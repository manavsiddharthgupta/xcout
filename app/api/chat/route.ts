import { google } from "@ai-sdk/google"
import { generateText, Message, streamText, TextPart } from "ai"
import { placesTextSearchTool } from "@/lib/ai/tools/places-text-search"
import {
  SYSTEM_PROMPT_PLACES,
  SYSTEM_PROMPT_PLACES_TITLE,
} from "@/constants/system-prompt"
import { auth } from "@/lib/auth"
import {
  getChatById,
  getMessageCountByUserId,
  saveChat,
  saveMessage,
} from "@/lib/controllers/chat"
import { MAX_MESSAGE_COUNT_PER_DAY } from "@/constants/fields"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, id }: { messages: Message[]; id: string } = await req.json()

  // Get authenticated user
  const session = await auth.api.getSession({ headers: req.headers })
  console.log("session", session)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const messageCount = await getMessageCountByUserId({
    id: session.user.id,
    differenceInHours: 24,
  })

  if (messageCount >= MAX_MESSAGE_COUNT_PER_DAY) {
    return new Response("Daily message limit exceeded", { status: 429 })
  }

  const chat = await getChatById({ id })

  if (!chat) {
    // generate a title for the chat
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT_PLACES_TITLE,
      prompt: JSON.stringify(messages[0].content),
    })

    // save new chat
    await saveChat({
      id,
      title: text,
      userId: session.user.id,
      model: "gemini-2.5-flash",
    })
  } else {
    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 })
    }
  }

  // Save the user's message
  await saveMessage({
    chatId: id,
    role: "user",
    content: messages[0].content,
    parts: messages[0].parts,
  })

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT_PLACES,
      },
      ...messages,
    ],
    tools: {
      placesTextSearch: placesTextSearchTool,
    },
    maxSteps: 5,
    onFinish: async (message) => {
      // save the assistant's message
      await saveMessage({
        chatId: id,
        role: "assistant",
        content: message.response.messages
          .map((message) => {
            const content = message.content[0]
            return typeof content === "string"
              ? content
              : (content as TextPart).text
          })
          .join("\n"),
        parts: message.response.messages.map((message) => message.content[0]),
      })
    },
  })

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) return "unknown error"
      if (typeof error === "string") return error
      if (error instanceof Error) return error.message
      return JSON.stringify(error)
    },
  })
}
