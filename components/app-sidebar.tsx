import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import NewChatBtn from "./new-chat-btn"
import { SidebarContentComponent } from "./sidebar-content"
import { ProfileBar } from "./profile"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="space-y-1.5 mt-1">
        <div className="absolute top-3 left-3">
          <SidebarTrigger />
        </div>
        <p className="text-xl font-bold text-center">xcout ai</p>
        <NewChatBtn />
      </SidebarHeader>

      <SidebarContentComponent />

      <SidebarFooter>
        <ProfileBar />
      </SidebarFooter>
    </Sidebar>
  )
}
