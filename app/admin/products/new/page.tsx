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
    setSaving(true)
    setError('')
    const { error: createError } = await createProduct(data)
    if (createError) {
      setError(createError)
      setSaving(false)
    } else {
      router.push('/admin/products')
    }
  }

  if (guardLoading || !authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Productos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
