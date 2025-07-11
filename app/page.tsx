import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Home() {
  return (
    <div>
      <div className="absolute top-3 left-3">
        <SidebarTrigger />
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  )
}
