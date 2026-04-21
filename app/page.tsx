import { Suspense } from 'react'
import { getProducts } from '@/lib/products'
import ProductCard from '@/components/ui/ProductCard'

async function ProductList() {
  const products = await getProducts()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-lg">No hay productos disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo de Productos</h1>
      <Suspense
        fallback={
          <div className="flex justify-center py-24 text-gray-400">
            <p>Cargando productos...</p>
          </div>
        }
      >
        <ProductList />
      </Suspense>
    </div>
  )
}
