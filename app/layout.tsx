import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Provider from "@/components/provider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "xcout",
  description: "Now maps into your chat to plan your next trip.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <main className="flex-1">{children}</main>
        </Provider>
        <Toaster richColors />
      </body>
    </html>
  )
}
