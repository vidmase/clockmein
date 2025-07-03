"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
}

/**
 * Simple client-side hook to load the authenticated user's projects from Supabase.
 * Extend/replace with your own business logic as needed.
 */
export function useProjects() {
  const supabase = createClientComponentClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, color")
        .order("created_at", { ascending: false })

      if (error) throw error
      const fetchedProjects = data as Project[]
      setProjects(fetchedProjects)
      return fetchedProjects
    } catch (err: any) {
      setError(err)
      setProjects([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getProjects()
  }, [supabase])

  return { projects, getProjects, isLoading, error }
}
