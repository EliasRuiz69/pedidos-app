'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/types'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 animate-fade-in-up stagger-item">
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-neutral-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h2 className="font-semibold text-neutral-50 text-base leading-snug">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-sm text-neutral-500 line-clamp-2 flex-1 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <p className="text-2xl font-bold text-neutral-50 tracking-tight">
            <span className="text-sm font-normal text-neutral-500 mr-0.5">$</span>
            {product.price.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 active:scale-95 min-h-[44px] ${
            added
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
          }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Agregado
            </span>
          ) : (
            'Agregar al carrito'
          )}
        </button>
      </div>
    </div>
  )
}
