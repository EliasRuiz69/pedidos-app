'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getProfile } from '@/lib/profile'

export function useAdminGuard(): { loading: boolean; authorized: boolean } {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    getProfile(user.id).then((profile) => {
      if (!profile || profile.role !== 'admin') {
        router.replace('/')
      } else {
        setAuthorized(true)
      }
      setLoading(false)
    })
  }, [authLoading, user, router])

  return { loading, authorized }
}
