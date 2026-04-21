'use client'

import { Fragment, useEffect, useState } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { getAllOrdersWithProfiles, updateOrderStatus } from '@/lib/orders'
import type { AdminOrder, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function AdminOrdersPage() {
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (guardLoading || !authorized) return
    getAllOrdersWithProfiles().then((data) => { setOrders(data); setLoading(false) })
  }, [guardLoading, authorized])

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdating(orderId)
    setError(null)
    const { error: updateError } = await updateOrderStatus(orderId, status)
    if (updateError) {
      setError(updateError)
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    }
    setUpdating(null)
  }

  if (guardLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos aún.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const statusKey = (order.status ?? 'pending') as OrderStatus
                const isExpanded = expandedId === order.id
                const customerName =
                  order.profiles?.name ||
                  order.profiles?.email?.split('@')[0] ||
                  'Sin nombre'

                return (
                  <Fragment key={order.id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {order.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {customerName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[statusKey]}`}
                        >
                          {STATUS_LABELS[statusKey]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {isExpanded ? '▲' : '▼'}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-6 py-5">
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Productos
                              </p>
                              <div className="space-y-1">
                                {order.order_items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between text-sm text-gray-700"
                                  >
                                    <span>
                                      {item.products.name} × {item.quantity}
                                    </span>
                                    <span className="text-gray-500">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {order.profiles?.phone && (
                                <p className="mt-3 text-xs text-gray-500">
                                  Tel: {order.profiles.phone}
                                </p>
                              )}
                              {order.profiles?.address && (
                                <p className="text-xs text-gray-500">
                                  Dir: {order.profiles.address}
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Cambiar estado
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(['pending', 'confirmed', 'delivered'] as OrderStatus[]).map(
                                  (s) => (
                                    <button
                                      key={s}
                                      disabled={statusKey === s || updating === order.id}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusChange(order.id, s)
                                      }}
                                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                        statusKey === s
                                          ? `${STATUS_COLORS[s]} ring-2 ring-inset ring-current`
                                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      {updating === order.id ? '...' : STATUS_LABELS[s]}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
