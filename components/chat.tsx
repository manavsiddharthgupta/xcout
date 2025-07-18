"use client"

import AI_Prompt from "@/components/ai-input"
import Messages from "@/components/messages"
import { useChat } from "@ai-sdk/react"
import { useSession } from "@/lib/auth-client"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LoginForm } from "./login-form"

const Chat = () => {
  const { data: session } = useSession()
  const { messages, input, status, handleInputChange, handleSubmit, stop } =
    useChat()

  const [showDialog, setShowDialog] = React.useState(false)

  const handleSetValue = (value: string) => {
    handleInputChange({ target: { value } } as any)
  }

  const onHandleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!session) {
      setShowDialog(true)
      return
    }
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
