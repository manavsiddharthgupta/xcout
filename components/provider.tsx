"use client"

import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "./ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { usePathname } from "next/navigation"

const Provider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  if (pathname === "/login" || pathname === "/signup") {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default Provider
