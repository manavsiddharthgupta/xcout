import Link from "next/link"
import { useEffect, useRef, useMemo, useCallback } from "react"
import { usePathname } from "next/navigation"
import useSWRInfinite from "swr/infinite"
import { useSession } from "@/lib/auth-client"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Loader, MessageCircle } from "lucide-react"
import { ChatSelect } from "@/lib/db/schema"

interface ChatHistoryResponse {
  chats: ChatSelect[]
  hasMore: boolean
  nextCursor: string | null
}

interface GroupedChats {
  [key: string]: ChatSelect[]
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ChatHistoryResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch chats")
  }
  return response.json()
}

// Key function for infinite pagination
const getKey = (
  pageIndex: number,
  previousPageData: ChatHistoryResponse | null
) => {
  // If reached the end, don't fetch
  if (previousPageData && !previousPageData.hasMore) return null

  // First page, no cursor needed
  if (pageIndex === 0) return "/api/history?limit=20"

  // Use the nextCursor from previous page
  if (previousPageData?.nextCursor) {
    return `/api/history?limit=20&cursor=${previousPageData.nextCursor}`
  }

  return null
}

export function SidebarContentComponent() {
  const { data: session } = useSession()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Extract current chat ID from pathname
  const currentChatId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : ""

  // Use SWR Infinite for pagination
  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<ChatHistoryResponse>(
      session?.user?.id ? getKey : () => null, // Only fetch if user is authenticated
      fetcher,
      {
        revalidateFirstPage: true,
        revalidateAll: false,
      }
    )

  // Listen for custom chat completion events
  useEffect(() => {
    const handleChatComplete = () => {
      mutate()
    }
    window.addEventListener("chatComplete", handleChatComplete)
    return () => window.removeEventListener("chatComplete", handleChatComplete)
  }, [mutate])

  // Flatten all pages into a single array
  const allChats = useMemo(() => {
    return data?.flatMap((page) => page.chats) || []
  }, [data])

  // Check if we can load more
  const hasMore = data?.[data.length - 1]?.hasMore ?? false
  const isLoadingMore =
    isValidating && data && typeof data[size - 1] !== "undefined"

  // Add a ref to track if we're currently loading to prevent multiple calls
  const isLoadingRef = useRef(false)

  // Load more function with protection against multiple calls
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoadingRef.current) {
      isLoadingRef.current = true
      setSize(size + 1)
    }
  }, [hasMore, isLoadingMore, setSize, size])

  // Reset loading ref when loading completes
  useEffect(() => {
    if (!isLoadingMore) {
      isLoadingRef.current = false
    }
  }, [isLoadingMore])

  // Group chats by date
  const groupedChats = useMemo(() => {
    return allChats.reduce((groups: GroupedChats, chat) => {
      const date = new Date(chat.createdAt)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let group: string
      if (date.toDateString() === today.toDateString()) {
        group = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        group = "Yesterday"
      } else {
        const diffTime = Math.abs(today.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 7) {
          group = "Previous 7 days"
        } else if (diffDays <= 30) {
          group = "Previous 30 days"
        } else {
          group = date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        }
      }

      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(chat)
      return groups
    }, {})
  }, [allChats])

  // Throttled scroll handler to prevent multiple rapid API calls
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleScroll = useCallback(() => {
    if (!sidebarRef.current) return

    // Clear existing timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }

    // Throttle scroll events to prevent rapid firing
    throttleTimeoutRef.current = setTimeout(() => {
      if (!sidebarRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current

      // Load more when scrolled to bottom (with small buffer)
      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        hasMore &&
        !isLoadingMore &&
        !isLoadingRef.current
      ) {
        loadMore()
      }
    }, 150) // 150ms throttle delay
  }, [hasMore, isLoadingMore, loadMore])

  // Infinite scroll handler
  useEffect(() => {
    const sidebarElement = sidebarRef.current
    if (sidebarElement) {
      sidebarElement.addEventListener("scroll", handleScroll)
      return () => {
        sidebarElement.removeEventListener("scroll", handleScroll)
        // Clean up timeout on unmount
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current)
        }
      }
    }
  }, [handleScroll])

  // Auto-load more content if container is not scrollable (for large screens)
  useEffect(() => {
    // Only run auto-load check after loading completes and we have data
    if (isLoading || isLoadingMore || !hasMore || isLoadingRef.current) return

    const autoLoadMore = () => {
      if (!sidebarRef.current) return

      const { scrollHeight, clientHeight } = sidebarRef.current

      // If content doesn't fill the container (no scrollbar needed), load more
      // Add a small buffer to account for margins/padding
      if (scrollHeight <= clientHeight + 10) {
        loadMore()
      }
    }

    // Use delay to ensure DOM is fully updated after data changes
    const timer = setTimeout(autoLoadMore, 300)
    return () => clearTimeout(timer)
  }, [allChats.length, hasMore, isLoading, isLoadingMore, loadMore]) // Only trigger when chat count changes

  // Also check on window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (
        !sidebarRef.current ||
        isLoading ||
        isLoadingMore ||
        !hasMore ||
        isLoadingRef.current
      )
        return

      // Throttle resize events
      setTimeout(() => {
        if (!sidebarRef.current) return

        const { scrollHeight, clientHeight } = sidebarRef.current

        // Use same buffer as auto-load check
        if (scrollHeight <= clientHeight + 10) {
          loadMore()
        }
      }, 200)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [hasMore, isLoading, isLoadingMore, loadMore])

  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + "..."
  }

  return (
    <SidebarContent ref={sidebarRef} className="overflow-y-auto">
      {error && (
        <div className="p-4 text-center text-red-500 text-sm">
          {error.message || "Failed to load chats"}
        </div>
      )}

      {Object.entries(groupedChats).map(([groupName, chats]) => (
        <SidebarGroup key={groupName}>
          <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
          <SidebarGroupContent className="px-1">
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentChatId === chat.id}
                  >
                    <Link href={`/chat/${chat.id}`} className="w-full">
                      <span className="truncate">
                        {truncateTitle(chat.title || "New Chat")}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}

      {/* Loading state */}
      {(isLoading || isLoadingMore) && (
        <Loader className="animate-spin mx-auto mt-6" />
      )}

      {/* Empty state */}
      {!isLoading &&
        !isLoadingMore &&
        Object.keys(groupedChats).length === 0 &&
        !error && (
          <div className="p-4 text-center text-muted-foreground min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs">Start a new conversation!</p>
          </div>
        )}
    </SidebarContent>
  )
}
