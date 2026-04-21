'use client'

import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/types'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4 flex-1">
        <h2 className="font-semibold text-gray-900 text-base leading-tight">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="mt-2 text-lg font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </p>
        <button
          onClick={() => addItem(product)}
          className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 active:scale-95 transition-all"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
