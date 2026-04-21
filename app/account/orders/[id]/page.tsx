'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getOrderWithItems } from '@/lib/orders'
import { useCartStore } from '@/store/useCartStore'
import type { OrderWithItems } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const addItem = useCartStore((state) => state.addItem)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)
  const [error, setError] = useState('')
  const [reordered, setReordered] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    async function load() {
      try {
        const data = await getOrderWithItems(id, user!.id)
        if (!data) { setError('Pedido no encontrado'); return }
        setOrder(data)
      } catch {
        setError('Error al cargar el pedido')
      } finally {
        setOrderLoading(false)
      }
    }
    load()
  }, [user, authLoading, id, router])

  function handleReorder() {
    if (!order) return
    order.order_items.forEach((item) => addItem(item.products))
    setReordered(true)
  }

  if (authLoading || orderLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-7 w-52" />
            <div className="skeleton h-3 w-36" />
          </div>
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="skeleton h-48 w-full rounded-2xl mb-4" />
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/30 border border-red-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-red-400 mb-5">{error || 'Pedido no encontrado'}</p>
        <Link href="/account/orders" className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-50 transition-all">
          Ver todos los pedidos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Link
          href="/account/orders"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mis pedidos
        </Link>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 mb-4">
        {order.order_items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between py-4 ${
              index < order.order_items.length - 1 ? 'border-b border-neutral-800' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-neutral-50">{item.products.name}</span>
              <span className="text-xs text-neutral-600">
                ×{item.quantity} · ${Number(item.price).toFixed(2)} c/u
              </span>
            </div>
            <span className="text-sm font-bold text-neutral-50 tabular-nums">
              ${(item.quantity * Number(item.price)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-5 mb-6">
        <span className="text-sm font-medium text-neutral-400">Total del pedido</span>
        <span className="text-2xl font-bold text-neutral-50 tabular-nums">
          ${Number(order.total).toFixed(2)}
        </span>
      </div>

      {/* Reorder */}
      {reordered ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3 text-sm text-green-400 text-center">
            Productos agregados al carrito
          </div>
          <Link
            href="/cart"
            className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Ir al carrito
          </Link>
        </div>
      ) : (
        <button
          onClick={handleReorder}
          className="w-full rounded-xl border border-neutral-700 px-4 py-3.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 transition-all"
        >
          Volver a pedir
        </button>
      )}
    </div>
  )
}
