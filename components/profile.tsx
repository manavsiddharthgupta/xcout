"use client"
import { LogOut, Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient, useSession } from "@/lib/auth-client"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function ProfileBar() {
  const { data: session } = useSession()
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  if (!session) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-12 px-3">
          <Avatar className="h-9 w-9 mr-1">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
            <span className="text-sm font-medium">
              {session.user.name || "Guest"}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {session.user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuItem
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
