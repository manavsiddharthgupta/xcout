"use client"

import AI_Prompt from "@/components/ai-input"
import Messages from "@/components/messages"
import { Message, useChat } from "@ai-sdk/react"
import { useSession } from "@/lib/auth-client"
import React, { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { toast } from "sonner"

const Chat = ({
  chatId,
  initialMessages,
}: {
  chatId: string
  initialMessages: Message[]
}) => {
  const { data: session } = useSession()

  const {
    messages,
    input,
    status,
    handleInputChange,
    handleSubmit,
    stop,
    error,
  } = useChat({
    api: "/api/chat",
    id: chatId,
    sendExtraMessageFields: true,
    initialMessages: initialMessages,
    onFinish: () => {
      // Custom event fallback to ensure sidebar refreshes
      window.dispatchEvent(new CustomEvent("chatComplete"))
    },
  })

  const [showDialog, setShowDialog] = React.useState(false)

  // Show toast only once per error
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong. Please try again.")
    }
  }, [error])

  const handleSetValue = (value: string) => {
    handleInputChange({ target: { value } } as any)
  }

  const onHandleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!session) {
      setShowDialog(true)
      return
    }
    // This is a hack to update the URL without reloading the page
    window.history.replaceState(null, "", "/chat/" + chatId)
    // send the message
    handleSubmit()
  }

  return (
    <>
      <Messages status={status} messages={messages} />
      <form
        onSubmit={onHandleSubmit}
        className="w-full max-w-3xl mx-auto sticky bottom-0 bg-background"
      >
        <AI_Prompt
          status={status}
          value={input}
          setValue={handleSetValue}
          onSubmit={onHandleSubmit}
          stop={stop}
        />
      </form>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>
            You must be logged in to use the chat feature.
          </DialogDescription>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Chat
