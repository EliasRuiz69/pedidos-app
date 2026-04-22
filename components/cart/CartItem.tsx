'use client'

import { useCartStore } from '@/store/useCartStore'
import { getItemTotal, getPromoLabel, getPromoSavings } from '@/lib/promotions'
import type { CartItem as CartItemType } from '@/types'

type Props = { item: CartItemType }

export default function CartItem({ item }: Props) {
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const { product, quantity } = item

  const promoLabel = getPromoLabel(product)
  const subtotal = getItemTotal(product, quantity)
  const savings = getPromoSavings(product, quantity)

  return (
    <div className="flex items-start gap-4 py-4 border-b border-neutral-800 last:border-0">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
            </svg>
          </div>
        )}
        {promoLabel && (
          <div className="absolute top-0 left-0 rounded-br-lg rounded-tl-xl bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-tight">
            {promoLabel}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <p className="font-medium text-neutral-50 truncate text-sm">{product.name}</p>
        <p className="text-xs text-neutral-500">${product.price.toFixed(2)} c/u</p>
        {savings > 0 && (
          <p className="text-xs text-orange-400">Ahorras ${savings.toFixed(2)}</p>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-50 hover:bg-neutral-800 transition-all text-base leading-none"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-neutral-50">{quantity}</span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-50 hover:bg-neutral-800 transition-all text-base leading-none"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex flex-col items-end gap-0.5 mt-0.5">
        <p className="w-20 text-right font-bold text-neutral-50 text-sm tabular-nums">
          ${subtotal.toFixed(2)}
        </p>
        {savings > 0 && (
          <p className="text-xs text-neutral-600 line-through tabular-nums">
            ${(product.price * quantity).toFixed(2)}
          </p>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        className="text-neutral-700 hover:text-red-400 transition-colors mt-1"
        aria-label="Eliminar producto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
