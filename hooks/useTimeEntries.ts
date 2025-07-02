import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeEntry } from '@/types/time-entry'

export function useTimeEntries() {
  const [isLoading, setIsLoading] = useState(false)
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
      
      return data as TimeEntry[]
    } catch (err) {
      setError(err as Error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTimeEntry = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTimeEntries,
    deleteTimeEntry,
    isLoading,
    error
  }
} 