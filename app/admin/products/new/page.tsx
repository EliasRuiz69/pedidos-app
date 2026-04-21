'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { createProduct } from '@/lib/products'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: Omit<Product, 'id'>) {
    setSaving(true); setError('')
    const { error: createError } = await createProduct(data)
    if (createError) { setError(createError); setSaving(false) }
    else router.push('/admin/products')
  }

  if (guardLoading || !authorized) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="skeleton h-6 w-40 mb-8" />
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
        <h1 className="text-lg font-bold text-neutral-50">Nuevo producto</h1>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <ProductForm
          onSubmit={handleSubmit}
          loading={saving}
          error={error}
          submitLabel="Crear producto"
        />
      </div>
    </div>
  )
}
