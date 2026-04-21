import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <nav className="flex gap-6">
            <Link
              href="/admin/orders"
              className="py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pedidos
            </Link>
            <Link
              href="/admin/products"
              className="py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Productos
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
