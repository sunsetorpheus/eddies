import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/** The current user's username. `undefined` while loading, `null` if no profile row. */
export function useProfile(userId: string | undefined) {
  const [username, setUsername] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? null))
  }, [userId])

  return username
}
