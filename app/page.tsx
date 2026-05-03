import { Suspense } from 'react'
import { createSupabaseServer } from '@/lib/supabaseServer'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types'

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <div className="skeleton h-52 w-full rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-11 w-full mt-2 rounded-xl" />
      </div>
    </div>
  )
}

async function ProductList() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('is_promo', { ascending: false })
    .order('name', { ascending: true })
  const products = (data ?? []) as Product[]

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-base font-medium">No hay productos disponibles</p>
        <p className="text-sm mt-1 text-neutral-700">Vuelve más tarde</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-50 tracking-tight">Catálogo</h1>
        <p className="mt-1.5 text-sm text-neutral-500">Elige tus productos favoritos</p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductList />
      </Suspense>
    </div>
  )
}
