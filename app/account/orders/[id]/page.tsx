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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
      <div className="max-w-2xl mx-auto py-16 px-4">
        <p className="text-sm text-gray-400">Cargando pedido...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Pedido no encontrado'}</p>
        <Link href="/account/orders" className="text-sm font-medium text-gray-900 underline underline-offset-4">
          Ver todos los pedidos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <Link
          href="/account/orders"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Mis pedidos
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-4 mb-4">
        {order.order_items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between py-4 ${
              index < order.order_items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900">{item.products.name}</span>
              <span className="text-xs text-gray-400">x{item.quantity} — ${Number(item.price).toFixed(2)} c/u</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${(item.quantity * Number(item.price)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Total</span>
        <span className="text-xl font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
      </div>

      {reordered ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 text-center">
            Productos agregados al carrito
          </p>
          <Link
            href="/cart"
            className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Ir al carrito
          </Link>
        </div>
      ) : (
        <button
          onClick={handleReorder}
          className="w-full rounded-xl border border-gray-900 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Volver a pedir
        </button>
      )}
    </div>
  )
}
