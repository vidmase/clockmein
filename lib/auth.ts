import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export const supabase = createClientComponentClient()

export function useAuthStore() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any) // Set session state with type casting to fix Session | null error //Set session state
      setLoading(false) // Update loading state after session check //Set loading state to false
    })

    // Listen for auth changes
    const {
      data: { subscription },

    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as any) // Cast session to any to fix type error //Type casting to resolve Session | null error
      setLoading(false) // Update loading state after auth change //Set loading state to false
    })

    // Refresh token periodically
    const refreshInterval = setInterval(async () => {
      const { data, error } = await supabase.auth.refreshSession() //Refresh the auth session
      if (error) setError(error as any) //Set error state with type casting to fix type error
      if (data.session) setSession(data.session as any) //Set session state with type casting to fix type error
    }, 1000 * 60 * 60) // Refresh every hour

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  return { session, loading, error }
} 