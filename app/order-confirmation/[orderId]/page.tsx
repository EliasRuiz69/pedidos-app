'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { getOrder } from '@/lib/orders'
import { getCurrentUserProfile, getDisplayName } from '@/lib/profile'
import { buildWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import type { Order, Profile } from '@/types'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [whatsappLink, setWhatsappLink] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setError('Sesión no encontrada'); setDataLoading(false); return }
    async function load() {
      try {
        const [fetchedOrder, fetchedProfile] = await Promise.all([
          getOrder(orderId),
          getCurrentUserProfile(),
        ])
        if (!fetchedOrder) { setError('Pedido no encontrado'); return }
        if (!fetchedProfile) { setError('Perfil no encontrado'); return }
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', orderId)
        const cartItems = (itemsData ?? []).map((row: {
          quantity: number
          price: number
          products: { id: string; name: string; description: string; price: number; image_url: string; is_promo: boolean; promo_type: import('@/types').PromoType | null; promo_config: import('@/types').PromoConfig | null }
        }) => ({ product: row.products, quantity: row.quantity }))
        setWhatsappLink(buildWhatsAppLink(buildWhatsAppMessage(fetchedProfile, cartItems, fetchedOrder.total)))
        setOrder(fetchedOrder)
        setProfile(fetchedProfile)
      } catch {
        setError('Error al cargar el pedido')
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [user, authLoading, orderId])

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 skeleton h-16 w-16 rounded-2xl" />
          <div className="skeleton h-6 w-48 mx-auto mb-2" />
          <div className="skeleton h-4 w-32 mx-auto mb-6" />
          <div className="skeleton h-32 w-full rounded-2xl mb-3" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/30 border border-red-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-red-400 mb-5">{error}</p>
        <Link href="/" className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-50 transition-all">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">¡Pedido confirmado!</h1>
          <p className="mt-1.5 text-sm text-neutral-500 font-mono">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Order info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-3">Datos de entrega</p>
          <p className="text-sm font-semibold text-neutral-50">
            {getDisplayName(profile, profile?.email)}
          </p>
          <p className="text-sm text-neutral-500 mt-0.5">{profile?.phone}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{profile?.address}</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 mb-6">
          <span className="text-sm font-medium text-neutral-400">Total del pedido</span>
          <span className="text-xl font-bold text-neutral-50 tabular-nums">
            ${order?.total.toFixed(2)}
          </span>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-4 text-sm font-bold text-white hover:bg-[#1fba58] transition-colors shadow-lg shadow-[#25D366]/20 min-h-[52px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar pedido por WhatsApp
        </a>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
