import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Chat from "@/components/chat"
import SignOutBtn from "@/components/signout-btn"

export default function Home() {
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
      <Chat />
    </div>
  )
}
