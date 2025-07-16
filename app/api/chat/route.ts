import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { placesTextSearchTool } from "@/lib/ai/tools/places-text-search"
import { SYSTEM_PROMPT_PLACES } from "@/constants/system-prompt"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: google("gemini-2.0-flash"),
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
  })

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "unknown error"
      }

      if (typeof error === "string") {
        return error
      }

      if (error instanceof Error) {
        return error.message
      }

      return JSON.stringify(error)
    },
  })
}
