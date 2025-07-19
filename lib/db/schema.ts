import { pgTable, text, timestamp, boolean, json } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
})

// Chat schema - optimized for Vercel AI SDK
export const chat = pgTable("chat", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  model: text("model"), // Track which AI model was used
  settings: json("settings"), // Store model settings (temperature, max_tokens, etc.)
  metadata: json("metadata"), // Additional metadata (tags, categories, etc.)
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

// Message schema - matches UIMessage structure from Vercel AI SDK
export const message = pgTable("message", {
  id: text("id").primaryKey(), // Matches UIMessage.id
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["system", "user", "assistant", "data"],
  }).notNull(), // Matches UIMessage.role
  content: text("content").notNull(), // Matches UIMessage.content
  parts: json("parts").notNull(),

  // Annotations array - matches UIMessage.annotations
  annotations: json("annotations").$type<Array<any>>(),

  // Attachments - matches UIMessage.experimental_attachments
  attachments: json("attachments").$type<
    Array<{
      name?: string
      contentType?: string
      url: string
    }>
  >(),
  metadata: json("metadata"), // Custom metadata

  // Timestamps
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

// Types for better TypeScript support
export type ChatSelect = typeof chat.$inferSelect
export type ChatInsert = typeof chat.$inferInsert
export type MessageSelect = typeof message.$inferSelect
export type MessageInsert = typeof message.$inferInsert
