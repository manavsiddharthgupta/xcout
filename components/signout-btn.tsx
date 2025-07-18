"use client"

import { Button } from "@/components/ui/button"
import { authClient, useSession } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

const SignOutBtn = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const onSignOut = async () => {
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
    <Button onClick={onSignOut} size="icon" variant="outline">
      <LogOut />
    </Button>
  )
}

export default SignOutBtn
