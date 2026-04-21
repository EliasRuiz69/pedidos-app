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
    setSaving(true)
    setError('')
    const { error: updateError } = await updateProduct(id, data)
    if (updateError) {
      setError(updateError)
      setSaving(false)
    } else {
      router.push('/admin/products')
    }
  }

  if (guardLoading || loadingProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Producto no encontrado.</p>
        <Link href="/admin/products" className="text-sm font-medium text-gray-900 underline">
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
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Productos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-900">Editar producto</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
