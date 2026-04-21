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
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const STATUS_BTN: Record<OrderStatus, string> = {
  pending: 'border-amber-800/50 text-amber-400 hover:bg-amber-500/10',
  confirmed: 'border-blue-800/50 text-blue-400 hover:bg-blue-500/10',
  delivered: 'border-green-800/50 text-green-400 hover:bg-green-500/10',
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
    setUpdating(orderId); setError(null)
    const { error: updateError } = await updateOrderStatus(orderId, status)
    if (updateError) {
      setError(updateError)
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    }
    setUpdating(null)
  }

  if (guardLoading || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <div className="skeleton h-7 w-48 mb-2" />
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-neutral-800 last:border-0">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-3 w-32 flex-1" />
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 py-20 text-center">
          <p className="text-neutral-600 text-sm">No hay pedidos aún.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800">
              <tr>
                {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
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
                      className={`cursor-pointer border-b border-neutral-800/50 last:border-0 transition-colors ${
                        isExpanded ? 'bg-neutral-800/50' : 'hover:bg-neutral-800/30'
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-neutral-600">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-neutral-200">
                        {customerName}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-neutral-50 tabular-nums">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[statusKey]}`}>
                          {STATUS_LABELS[statusKey]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 text-xs">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs text-neutral-700">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="border-b border-neutral-800/50 bg-neutral-800/20 px-6 py-5">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                                Productos
                              </p>
                              <div className="space-y-2">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-neutral-300">
                                      {item.products.name}
                                      <span className="text-neutral-600"> × {item.quantity}</span>
                                    </span>
                                    <span className="text-neutral-400 tabular-nums">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {(order.profiles?.phone || order.profiles?.address) && (
                                <div className="mt-4 space-y-1 border-t border-neutral-800 pt-3">
                                  {order.profiles?.phone && (
                                    <p className="text-xs text-neutral-600">
                                      <span className="text-neutral-500">Tel:</span> {order.profiles.phone}
                                    </p>
                                  )}
                                  {order.profiles?.address && (
                                    <p className="text-xs text-neutral-600">
                                      <span className="text-neutral-500">Dir:</span> {order.profiles.address}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                                Cambiar estado
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(['pending', 'confirmed', 'delivered'] as OrderStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    disabled={statusKey === s || updating === order.id}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, s) }}
                                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                                      statusKey === s
                                        ? `${STATUS_COLORS[s]} ring-1 ring-inset ring-current`
                                        : `${STATUS_BTN[s]} bg-transparent`
                                    }`}
                                  >
                                    {updating === order.id ? '...' : STATUS_LABELS[s]}
                                  </button>
                                ))}
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
