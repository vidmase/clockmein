'use client'

import { SignUp } from "@/components/auth/signup"
import { useAuth } from "@/components/auth/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const lastPath = sessionStorage.getItem('lastPath') || '/dashboard/time'
      router.push(lastPath)
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <SignUp />
    </div>
  )
} 