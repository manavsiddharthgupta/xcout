import Chat from "@/components/chat"
import { SidebarTrigger } from "@/components/ui/sidebar"
import SignOutBtn from "@/components/signout-btn"
import { ThemeToggle } from "@/components/theme-toggle"
import { notFound } from "next/navigation"
import { getChatById, getChatMessages } from "@/lib/controllers/chat"

const ChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const chat = await getChatById({ id })
  if (!chat) {
    return notFound()
  }

  const messages = await getChatMessages(id)
  const convertToSDKMessages = messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }))

  return (
    <div className="h-screen flex flex-col overflow-y-auto">
      <div className="fixed top-3 left-3">
        <SidebarTrigger />
      </div>
      <div className="fixed top-4 right-6 z-10">
        <div className="flex items-center gap-2">
          <SignOutBtn />
          <ThemeToggle />
        </div>
      </div>
      <Chat initialMessages={convertToSDKMessages} chatId={id} />
    </div>
  )
}

export default ChatPage
