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
      <div className="max-w-2xl mx-auto py-24 px-4 flex flex-col items-center gap-4 text-gray-400">
        <p className="text-lg">Tu carrito está vacío.</p>
        <Link
          href="/"
          className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrito</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-4">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4">
        <span className="text-base font-medium text-gray-700">Total</span>
        <span className="text-xl font-bold text-gray-900">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-all"
      >
        {loading ? 'Confirmando pedido...' : 'Confirmar pedido'}
      </button>
    </div>
  )
}
