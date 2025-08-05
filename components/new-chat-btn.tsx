"use client"

import { Button } from "./ui/button"
import { Plus } from "lucide-react"

const NewChatBtn = () => {
  const handleNewChat = () => {
    window.location.href = "/"
  }

  return (
    <Button className="font-semibold" onClick={handleNewChat}>
      <Plus className="h-4 w-4" />
      New Chat
    </Button>
  )
}

export default NewChatBtn
