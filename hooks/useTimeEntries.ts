import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeEntry } from '@/types/time-entry'

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const getTimeEntries = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      
      const entries = data as TimeEntry[]
      setTimeEntries(entries)
      return entries
    } catch (err) {
      setError(err as Error)
      setTimeEntries([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;
      
      const newEntry = data as TimeEntry;
      // Update local state by adding the new entry
      setTimeEntries((prev: TimeEntry[]) => [newEntry, ...prev])
      return newEntry;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state by removing the deleted entry
      setTimeEntries((prev: TimeEntry[]) => prev.filter((entry: TimeEntry) => entry.id !== id))
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch time entries on mount
  useEffect(() => {
    getTimeEntries()
  }, [])

  return {
    timeEntries,
    getTimeEntries,
    addTimeEntry,
    deleteTimeEntry,
    isLoading,
    error
  }
} 