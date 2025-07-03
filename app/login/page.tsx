'use client'

import { Login } from "@/components/auth/login"
import { useAuth } from "@/components/auth/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WelcomeDialog } from "@/components/auth/welcome-dialog"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (user && !showWelcome) {
      setShowWelcome(true)
    }
  }, [user])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Login />
      {showWelcome && user && (
        <WelcomeDialog 
          username={user.user_metadata?.full_name || 'User'} 
          onClose={() => setShowWelcome(false)} 
        />
      )}
    </div>
  )
} 