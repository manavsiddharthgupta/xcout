import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserChats } from "@/lib/controllers/history"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit")
    const cursor = searchParams.get("cursor")

    // Parse limit with default and max values
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 50) : 20

    // Validate limit
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      )
    }

    // Validate cursor if provided
    if (cursor && isNaN(Date.parse(cursor))) {
      return NextResponse.json(
        { error: "Invalid cursor parameter" },
        { status: 400 }
      )
    }

    // Get user chats
    const result = await getUserChats({
      userId: session.user.id,
      limit: parsedLimit,
      cursor: cursor || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
