import Link from "next/link"
import { Sidebar, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { SidebarContentComponent } from "./sidebar-content"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="space-y-1.5 mt-1">
        <div className="absolute top-3 left-3">
          <SidebarTrigger />
        </div>
        <p className="text-xl font-bold text-center">xcout ai</p>
        <Button className="font-semibold" asChild>
          <Link href="/">
            <Plus className="h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContentComponent />
    </Sidebar>
  )
}
