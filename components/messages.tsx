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

interface MessagesProps {
  messages: UIMessage[]
}

export default function Messages({ messages }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto mt-16 px-4">
      {messages.map((message) => (
        <AIMessage from={message.role as "user" | "assistant"} key={message.id}>
          <AIMessageContent>
            {message.parts.map(
              (part: UIMessage["parts"][number], i: number) => {
                switch (part.type) {
                  case "text":
                    return (
                      <AIResponse key={`${message.id}-${i}`}>
                        {part.text}
                      </AIResponse>
                    )
                  // case "tool-invocation": {
                  //   const toolName = part.toolInvocation.toolName
                  //   const args = part.toolInvocation.args
                  //   const result =
                  //     part.toolInvocation.state === "result"
                  //       ? part.toolInvocation.result
                  //       : null
                  //   return (
                  //     <AITool key={`${message.id}-${i}`} status="completed">
                  //       <AIToolHeader name={toolName} status="completed" />
                  //       <AIToolContent>
                  //         <AIToolParameters parameters={args} />
                  //         {result && (
                  //           <AIToolResult
                  //             result={JSON.stringify(result, null, 2)}
                  //           />
                  //         )}
                  //       </AIToolContent>
                  //     </AITool>
                  // )
                  // }
                  default:
                    return null
                }
              }
            )}
          </AIMessageContent>
        </AIMessage>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
