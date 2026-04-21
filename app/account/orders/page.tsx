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
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
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
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="skeleton h-7 w-36" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Mis pedidos</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
          </p>
        </div>
        <Link
          href="/account"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mi perfil
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-medium text-neutral-400 mb-1">Aún no tienes pedidos</p>
          <p className="text-sm text-neutral-700 mb-6">Haz tu primer pedido desde el catálogo</p>
          <Link
            href="/"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const statusKey = (order.status ?? 'pending') as OrderStatus
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 hover:border-neutral-700 transition-all animate-fade-in-up stagger-item"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-neutral-50 font-mono tracking-wide">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-600">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-neutral-50 tabular-nums">
                    ${Number(order.total).toFixed(2)}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[statusKey]}`}>
                    {STATUS_LABELS[statusKey]}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-700 group-hover:text-neutral-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
