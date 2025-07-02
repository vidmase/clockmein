import { useCallback, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/types/database'

export function useUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const createUser = useCallback(async ({ email, password, fullName }: {
    email: string
    password: string
    fullName: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (authError) throw authError

      if (!authData.user) {
        throw new Error('No user data returned')
      }

      return { user: authData.user }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    createUser,
  }
} 