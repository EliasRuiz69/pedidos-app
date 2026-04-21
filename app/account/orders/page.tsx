'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserOrders } from '@/lib/orders'
import type { Order, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function load() {
      try {
        const data = await getUserOrders(user!.id)
        setOrders(data)
      } catch {
        setError('Error al cargar los pedidos')
      } finally {
        setOrdersLoading(false)
      }
    }
    load()
  }, [user, authLoading, router])

  if (authLoading || ordersLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <p className="text-sm text-gray-400">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <Link
          href="/account"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Mi perfil
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-400 mb-4">Aún no tienes pedidos.</p>
          <Link
            href="/"
            className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900">
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">
                  ${Number(order.total).toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[(order.status ?? 'pending') as OrderStatus]}`}
                >
                  {STATUS_LABELS[(order.status ?? 'pending') as OrderStatus]}
                </span>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
