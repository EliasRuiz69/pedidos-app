'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

// undefined = todavía cargando, null = sin sesión, User = autenticado
export function useAuth(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user: user ?? null, loading: user === undefined }
}
