'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { getProfile, getDisplayName } from '@/lib/profile'
import { useCartStore } from '@/store/useCartStore'
import type { Profile } from '@/types'

export default function Navbar() {
  const router = useRouter()
  const { user } = useAuth()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) { setProfile(null); return }
    getProfile(user.id).then(setProfile)
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    clearCart()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="p-4 border-b flex justify-between items-center bg-white">
      <Link href="/" className="font-bold text-gray-900 hover:text-gray-600 transition-colors">
        Pedidos App
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>Carrito</span>
          {totalItems > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
              {totalItems}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors hidden sm:block"
              >
                Admin
              </Link>
            )}
            <Link
              href="/account"
              className="text-sm text-gray-500 hidden sm:block truncate max-w-[140px] hover:text-gray-900 transition-colors"
            >
              {getDisplayName(profile, user.email)}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  )
}
