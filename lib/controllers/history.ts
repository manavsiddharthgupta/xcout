import { desc, and, lt, eq } from "drizzle-orm"
import { db } from "../db/db"
import { chat, type ChatSelect } from "../db/schema"

export interface GetChatsParams {
  userId: string
  limit?: number
  cursor?: string // ISO timestamp string
}

export interface GetChatsResponse {
  chats: ChatSelect[]
  nextCursor?: string
  hasMore: boolean
}

/**
 * Get user chats with cursor-based pagination for infinite scrolling
 * Uses createdAt timestamp as cursor for efficient pagination
 */
export async function getUserChats({
  userId,
  limit = 20,
  cursor,
}: GetChatsParams): Promise<GetChatsResponse> {
  try {
    // Build query conditions
    const conditions = [eq(chat.userId, userId)]

    // Add cursor condition if provided (get chats older than cursor)
    if (cursor) {
      conditions.push(lt(chat.createdAt, new Date(cursor)))
    }

    // Query chats with limit + 1 to check if there are more
    const chats = await db
      .select()
      .from(chat)
      .where(and(...conditions))
      .orderBy(desc(chat.createdAt)) // Most recent first
      .limit(limit + 1)

    // Check if there are more chats
    const hasMore = chats.length > limit
    const returnChats = hasMore ? chats.slice(0, limit) : chats

    // Set next cursor to the createdAt of the last chat
    const nextCursor =
      hasMore && returnChats.length > 0
        ? returnChats[returnChats.length - 1].createdAt.toISOString()
        : undefined

    return {
      chats: returnChats,
      nextCursor,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching user chats:", error)
    throw new Error("Failed to fetch user chats")
  }
}
