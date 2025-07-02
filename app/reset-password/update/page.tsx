'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { NewPassword } from "@/components/auth/new-password"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Invalid or expired reset link")
        router.push('/login')
        return
      }
      
      setIsLoading(false)
    }

    checkSession()
  }, [router, supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <NewPassword />
} 