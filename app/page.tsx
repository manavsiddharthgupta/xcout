"use client"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import AI_Prompt from "@/components/ai-input"
import Messages from "@/components/messages"
import { useChat } from "@ai-sdk/react"

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  const handleSetValue = (value: string) => {
    handleInputChange({ target: { value } } as any)
  }

  return (
    <div className="h-screen flex flex-col overflow-scroll">
      <div className="fixed top-3 left-3">
        <SidebarTrigger />
      </div>
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Messages messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto sticky bottom-0 bg-background"
      >
        <AI_Prompt
          value={input}
          setValue={handleSetValue}
          onSubmit={handleSubmit}
        />
      </form>
    </div>
  )
}
