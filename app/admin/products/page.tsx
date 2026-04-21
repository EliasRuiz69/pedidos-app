'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { getProducts, deleteProduct } from '@/lib/products'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (guardLoading || !authorized) return
    getProducts().then((data) => { setProducts(data); setLoading(false) })
  }, [guardLoading, authorized])

  async function handleDelete(id: string) {
    setDeleting(true); setError('')
    const { error: deleteError } = await deleteProduct(id)
    if (deleteError) {
      setError(deleteError)
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
    setConfirmId(null); setDeleting(false)
  }

  if (guardLoading || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="skeleton h-7 w-32 mb-2" />
            <div className="skeleton h-4 w-20" />
          </div>
          <div className="skeleton h-9 w-36 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-neutral-800 last:border-0">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-56" />
              </div>
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-7 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-neutral-600 text-sm">No hay productos. Crea el primero.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800">
              <tr>
                {['Imagen', 'Producto', 'Precio', 'Acciones'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-600 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={() => {}}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-neutral-100">{product.name}</p>
                    <p className="text-xs text-neutral-600 line-clamp-1 mt-0.5">{product.description}</p>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-neutral-50 tabular-nums">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    {confirmId === product.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-neutral-600">¿Eliminar?</span>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting}
                          className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {deleting ? '...' : 'Sí'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 transition-all"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setConfirmId(product.id)}
                          className="rounded-lg border border-red-900/50 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-950/30 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
