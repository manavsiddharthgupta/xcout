import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { placesTextSearchTool } from "@/lib/ai/tools/places-text-search"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: google("gemini-2.0-flash-001"),
    messages,
    tools: {
      placesTextSearch: placesTextSearchTool,
    },
    maxSteps: 2,
  })

  return result.toDataStreamResponse()
}
