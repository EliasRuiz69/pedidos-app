'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentUserProfile } from '@/lib/profile'
import { createOrder } from '@/lib/orders'
import { useCartStore } from '@/store/useCartStore'
import CartItem from '@/components/cart/CartItem'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  async function handleCheckout() {
    setError('')
    setLoading(true)
    try {
      if (!user) { router.push('/login'); return }
      const profile = await getCurrentUserProfile()
      if (!profile) { router.push('/complete-profile'); return }
      const { orderId, error: orderError } = await createOrder(user.id, items, totalPrice)
      if (orderError) throw new Error(orderError)
      clearCart()
      router.push(`/order-confirmation/${orderId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al confirmar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-neutral-300 mb-2">Tu carrito está vacío</p>
        <p className="text-sm text-neutral-600 mb-8">Agrega productos del catálogo para empezar</p>
        <Link
          href="/"
          className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 tracking-tight">Carrito</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-neutral-600 hover:text-red-400 transition-colors"
        >
          Vaciar
        </button>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-5">
        <span className="text-sm font-medium text-neutral-400">Total del pedido</span>
        <span className="text-2xl font-bold text-neutral-50 tabular-nums">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 min-h-[52px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Confirmando pedido...
          </span>
        ) : (
          'Confirmar pedido'
        )}
      </button>

      <p className="mt-3 text-center text-xs text-neutral-700">
        Pago contra entrega · Sin cargos adicionales
      </p>
    </div>
  )
}
