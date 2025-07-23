"use client"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response"
import { AIMessage, AIMessageContent } from "@/components/ui/kibo-ui/ai/message"
// import {
//   AITool,
//   AIToolHeader,
//   AIToolContent,
//   AIToolParameters,
//   AIToolResult,
// } from "@/components/ui/kibo-ui/ai/tool"
import { useEffect, useRef } from "react"
import { UIMessage } from "ai"
import { Spinner } from "@/components/ui/kibo-ui/spinner"

interface MessagesProps {
  messages: UIMessage[]
  status: "error" | "submitted" | "streaming" | "ready"
}

export default function Messages({ messages, status }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto mt-16 px-4">
        <div className="flex flex-col justify-center h-full gap-2">
          <p className="font-bold text-3xl">Hello there!</p>
          <p className="text-muted-foreground text-lg max-md:text-base">
            You can search for places like <b>pizza in New York</b>,{" "}
            <b>shoe stores near Ottawa</b>, or specific addresses like{" "}
            <b>123 Main Street</b>. I can help you find businesses, landmarks,
            and locations even with ambiguous queries!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto mt-16 px-4">
      {messages.map((message) => (
        <AIMessage from={message.role as "user" | "assistant"} key={message.id}>
          {message.parts.some((part) => part.type === "text") && (
            <AIMessageContent>
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case "text":
                    if (message.role === "assistant") {
                      return (
                        <AIResponse key={part.type + index}>
                          {part.text}
                        </AIResponse>
                      )
                    }
                    return part.text
                }
              })}
            </AIMessageContent>
          )}
        </AIMessage>
      ))}
      <div ref={messagesEndRef} />
      {status === "submitted" ||
        (status === "streaming" && (
          <Spinner variant="pinwheel" className="w-6 h-6 mb-4" />
        ))}
    </div>
  )
}
