'use client'

import { useCartStore } from '@/store/useCartStore'
import type { CartItem as CartItemType } from '@/types'

type Props = {
  item: CartItemType
}

export default function CartItem({ item }: Props) {
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  const { product, quantity } = item

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>

      <p className="w-20 text-right font-semibold text-gray-900">
        ${(product.price * quantity).toFixed(2)}
      </p>

      <button
        onClick={() => removeItem(product.id)}
        className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
        aria-label="Eliminar producto"
      >
        ×
      </button>
    </div>
  )
}
