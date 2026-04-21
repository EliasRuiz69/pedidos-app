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
          products: { id: string; name: string; description: string; price: number; image_url: string }
        }) => ({
          product: row.products,
          quantity: row.quantity,
        }))

        const message = buildWhatsAppMessage(fetchedProfile, cartItems, fetchedOrder.total)
        setWhatsappLink(buildWhatsAppLink(message))
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
      <div className="max-w-md mx-auto py-24 px-4 text-center text-sm text-gray-400">
        Cargando confirmación...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link href="/" className="text-sm font-medium text-gray-900 underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900">¡Pedido confirmado!</h1>
        <p className="mt-1 text-sm text-gray-500">Pedido #{orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Cliente</p>
        <p className="text-sm text-gray-900">{getDisplayName(profile, profile?.email)}</p>
        <p className="text-sm text-gray-500">{profile?.address}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 mb-6">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Total del pedido</span>
          <span className="text-base font-bold text-gray-900">${order?.total.toFixed(2)}</span>
        </div>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        Enviar pedido por WhatsApp
      </a>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
