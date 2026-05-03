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
    <nav className="sticky top-0 z-50 border-b border-neutral-800/60 bg-[#080808]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 group-hover:bg-orange-600 transition-colors">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          <span className="font-bold tracking-tight text-neutral-50 group-hover:text-orange-400 transition-colors">
            Pedidos
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white ring-2 ring-[#080808]">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link
                  href="/admin/orders"
                  className="flex rounded-xl px-3 py-2 text-xs font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                href="/account"
                className="hidden rounded-xl px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 transition-all sm:block truncate max-w-[130px]"
              >
                {getDisplayName(profile, user.email)}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-800 hover:text-red-400 transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 active:scale-95 transition-all"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
