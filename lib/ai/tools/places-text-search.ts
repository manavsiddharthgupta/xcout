import { tool } from "ai"
import { z } from "zod"
import { GOOGLE_MAPS_API_URL } from "@/constants/urls"

type PlacesTextSearchParams = {
  textQuery: string
  includedType?: string
  languageCode?: string
  pageSize?: number
  pageToken?: string
  priceLevels?: string[]
  rankPreference?: string
  regionCode?: string
  minRating?: number
  openNow?: boolean
}

const PriceLevelSchema = z.enum([
  "PRICE_LEVEL_INEXPENSIVE",
  "PRICE_LEVEL_MODERATE",
  "PRICE_LEVEL_EXPENSIVE",
  "PRICE_LEVEL_VERY_EXPENSIVE",
])

const RankPreferenceSchema = z.enum(["RELEVANCE", "DISTANCE"])

export const placesTextSearchTool = tool({
  description:
    "Search for places using Google Places API with text query and various filters",
  parameters: z.object({
    textQuery: z.string().describe("The text query to search for places"),
    includedType: z
      .string()
      .optional()
      .describe(
        "Filter results by place type (e.g., restaurant, gas_station, etc.)"
      ),
    languageCode: z
      .string()
      .optional()
      .describe("Language code for the response (e.g., en, es, fr)"),
    pageSize: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe("Number of results to return (1-20)"),
    pageToken: z.string().optional().describe("Token for pagination"),
    priceLevels: z
      .array(PriceLevelSchema)
      .optional()
      .describe("Filter by price levels"),
    rankPreference: RankPreferenceSchema.optional().describe(
      "How to rank the results"
    ),
    regionCode: z
      .string()
      .optional()
      .describe("Region code to bias results (e.g., US, GB, FR)"),
    minRating: z
      .number()
      .min(1)
      .max(5)
      .optional()
      .describe("Minimum rating filter (1-5)"),
    openNow: z
      .boolean()
      .optional()
      .describe("Filter to only show places open now"),
    fields: z
      .array(z.string())
      .optional()
      .describe("Specific fields to return in the response"),
  }),
  execute: async (params) => {
    try {
      const { fields, ...searchParams } = params
      const result = await performPlacesTextSearch(
        searchParams as PlacesTextSearchParams,
        fields
      )
      return {
        success: true,
        data: result,
        message: `Found ${
          result.places?.length || 0
        } places matching your search criteria`,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to search places",
      }
    }
  },
})

export async function performPlacesTextSearch(
  options: PlacesTextSearchParams,
  fields?: string[]
) {
  const url = new URL(GOOGLE_MAPS_API_URL)

  if (options.regionCode) {
    url.searchParams.append("regionCode", options.regionCode)
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key not configured")
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
  }

  const fieldMask = Array.isArray(fields) ? fields.join(",") : undefined
  if (fieldMask) {
    headers["X-Goog-FieldMask"] = fieldMask
  } else {
    headers["X-Goog-FieldMask"] = "*"
  }

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: headers,
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.error?.message || `HTTP ${response.status}`
      throw new Error(message)
    }

    return await response.json()
  } catch (error) {
    console.error("Places Text Search Error:", error)
    throw error
  }
}
