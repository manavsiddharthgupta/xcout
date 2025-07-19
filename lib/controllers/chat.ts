import { eq, and, asc } from "drizzle-orm"
import { db } from "../db/db"
import {
  chat,
  message,
  type ChatSelect,
  type ChatInsert,
  type MessageSelect,
  type MessageInsert,
} from "../db/schema"

export interface SaveChatParams {
  id: string
  title: string
  userId: string
  model?: string
  settings?: any
  metadata?: any
}

export interface SaveMessageParams {
  chatId: string
  role: "system" | "user" | "assistant" | "data"
  content: string
  parts: any
  annotations?: any[]
  attachments?: Array<{
    name?: string
    contentType?: string
    url: string
  }>
  metadata?: any
}

export async function getChatById({ id }: { id: string }): Promise<ChatSelect> {
  try {
    const [chatData] = await db.select().from(chat).where(eq(chat.id, id))

    return chatData
  } catch (error) {
    console.error("Error fetching chat:", error)
    throw new Error("Failed to fetch chat")
  }
}

/**
 * Save a new chat
 */
export async function saveChat({
  id,
  title,
  userId,
  model,
  settings,
  metadata,
}: SaveChatParams): Promise<ChatSelect> {
  try {
    const chatData: ChatInsert = {
      id,
      title,
      userId,
      model,
      settings,
      metadata,
    }

    const [newChat] = await db.insert(chat).values(chatData).returning()

    return newChat
  } catch (error) {
    console.error("Error saving chat:", error)
    throw new Error("Failed to save chat")
  }
}

/**
 * Save a new message to a chat
 */
export async function saveMessage({
  chatId,
  role,
  content,
  parts,
  annotations,
  attachments,
  metadata,
}: SaveMessageParams): Promise<MessageSelect> {
  try {
    // Verify chat exists and user has access
    const [chatData] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1)

    if (!chatData) {
      throw new Error("Chat not found")
    }

    // Generate a unique ID for the message
    const messageId = crypto.randomUUID()

    const messageData: MessageInsert = {
      id: messageId,
      chatId,
      role,
      content,
      parts,
      annotations,
      attachments,
      metadata,
    }

    const [newMessage] = await db
      .insert(message)
      .values(messageData)
      .returning()

    // Update chat's updatedAt timestamp
    await db
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, chatId))

    return newMessage
  } catch (error) {
    console.error("Error saving message:", error)
    throw new Error("Failed to save message")
  }
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(
  chatId: string,
  userId: string
): Promise<void> {
  try {
    // Verify chat exists and user has access
    const [chatData] = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
      .limit(1)

    if (!chatData) {
      throw new Error("Chat not found or unauthorized")
    }

    // Delete all messages in the chat first
    await db.delete(message).where(eq(message.chatId, chatId))

    // Delete the chat
    await db.delete(chat).where(eq(chat.id, chatId))
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw new Error("Failed to delete chat")
  }
}

/**
 * Delete a specific message
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  try {
    // Verify message exists and user has access (through chat ownership)
    const [messageData] = await db
      .select({
        messageId: message.id,
        chatId: message.chatId,
        userId: chat.userId,
      })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(and(eq(message.id, messageId), eq(chat.userId, userId)))
      .limit(1)

    if (!messageData) {
      throw new Error("Message not found or unauthorized")
    }

    // Delete the message
    await db.delete(message).where(eq(message.id, messageId))

    // Update chat's updatedAt timestamp
    await db
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, messageData.chatId))
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message")
  }
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(
  chatId: string
): Promise<MessageSelect[]> {
  try {
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(asc(message.createdAt))

    return messages
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    throw new Error("Failed to fetch chat messages")
  }
}
