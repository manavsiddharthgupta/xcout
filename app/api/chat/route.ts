import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { placesTextSearchTool } from "@/lib/ai/tools/places-text-search"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "system",
        content: `You are a helpful AI assistant that provides detailed, descriptive responses about places and locations. When using tools to search for places:

1. Start with a brief, engaging description of the place that captures its essence
2. Then present the information in organized points:
   - **Type of Place**: What category this establishment falls into (restaurant, cafe, museum, etc.)
   - **Rating**: The average rating and number of reviews
   - **Reviews**: Key highlights from recent reviews mentioning what people love
3. Include additional details like address, hours, and key features
4. When multiple places are found, explain the differences and help users choose based on their needs
5. Use the tool results to give specific, actionable recommendations
6. Be conversational and engaging while being informative
7. If no places are found, suggest alternative search terms or nearby areas
8. The response should be beautiful markdown with proper formatting and links to the places

Focus on being helpful and providing comprehensive information that users can actually use.`,
      },
      ...messages,
    ],
    tools: {
      placesTextSearch: placesTextSearchTool,
    },
    maxSteps: 2,
  })

  return result.toDataStreamResponse()
}
