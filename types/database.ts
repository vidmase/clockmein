import type { Database as SupabaseDatabase } from '@supabase/supabase-js'

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' // Defines possible project status values

export interface Profile { // Interface for user profile data
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  duration: string
  description: string | null
  break_time: number
  created_at: string
  updated_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          role: 'admin' | 'user' | 'manager'
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          role?: 'admin' | 'user' | 'manager'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'user' | 'manager'
          avatar_url?: string | null
        }
      }
    }
  }
}

export type DbClient = Database<DatabaseSchema> 