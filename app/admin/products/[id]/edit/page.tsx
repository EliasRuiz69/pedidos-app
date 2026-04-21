'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { getProduct, updateProduct } from '@/lib/products'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/types'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (guardLoading || !authorized) return
    getProduct(id).then((data) => {
      if (!data) setNotFound(true)
      else setProduct(data)
      setLoadingProduct(false)
    })
  }, [guardLoading, authorized, id])

  async function handleSubmit(data: Omit<Product, 'id'>) {
    setSaving(true); setError('')
    const { error: updateError } = await updateProduct(id, data)
    if (updateError) { setError(updateError); setSaving(false) }
    else router.push('/admin/products')
  }

  if (guardLoading || loadingProduct) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="skeleton h-6 w-48 mb-8" />
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-neutral-600 mb-5">Producto no encontrado.</p>
        <Link href="/admin/products" className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-50 transition-all">
          Volver a productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Productos
        </Link>
        <span className="text-neutral-800">/</span>
        <h1 className="text-lg font-bold text-neutral-50">Editar producto</h1>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <ProductForm
          initialValues={{
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
          }}
          onSubmit={handleSubmit}
          loading={saving}
          error={error}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  )
}
