import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

// Menu items.
const items = [
  {
    title: "New Chat",
  },
  {
    title: "How to build a React app?",
  },
  {
    title: "Explain machine learning basics",
  },
  {
    title: "JavaScript best practices",
  },
  {
    title: "Help with CSS flexbox",
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="space-y-1.5 mt-1">
        <div className="absolute top-3 left-3">
          <SidebarTrigger />
        </div>
        <p className="text-xl font-bold text-center">Claude</p>
        <Button className="font-semibold">New Chat</Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={`/chat/${item.title}`}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
