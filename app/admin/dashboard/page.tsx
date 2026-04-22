'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { getDashboardMetrics, type DashboardMetrics } from '@/lib/dashboard'

// ─── Sub-components ──────────────────────────────────────────────────────────

function DashboardCard({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string
  value: string | number
  sublabel?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600">{label}</p>
      <p className={`text-2xl font-bold tabular-nums leading-tight ${accent ? 'text-orange-400' : 'text-neutral-50'}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-neutral-500 truncate">{sublabel}</p>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  icon,
  href,
  linkLabel,
}: {
  title: string
  icon: React.ReactNode
  href: string
  linkLabel: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-neutral-600">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">{title}</h2>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-400 transition-colors"
      >
        {linkLabel}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonSection({ cols = 3 }: { cols?: number }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton h-3.5 w-20 rounded" />
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-${cols} gap-3`}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-7 w-12 rounded" />
            <div className="skeleton h-3 w-28 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_LABELS = { pending: 'Pendientes', confirmed: 'Confirmados', delivered: 'Entregados' }
const STATUS_COLORS: Record<string, string> = {
  pending:   'text-amber-400',
  confirmed: 'text-blue-400',
  delivered: 'text-green-400',
}

export default function AdminDashboardPage() {
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentMonth = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (guardLoading || !authorized) return
    getDashboardMetrics().then(({ data, error: err }) => {
      if (err) setError(err)
      else setMetrics(data)
      setLoading(false)
    })
  }, [guardLoading, authorized])

  if (guardLoading || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <div className="skeleton h-7 w-36 mb-2 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
        <SkeletonSection cols={3} />
        <SkeletonSection cols={4} />
        <SkeletonSection cols={2} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-4 text-sm text-red-400">
          {error}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const { products, orders, customers } = metrics

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600 capitalize">{currentMonth}</p>
      </div>

      {/* Productos */}
      <section>
        <SectionHeader
          title="Productos"
          href="/admin/products"
          linkLabel="Ver productos"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard
            label="Total productos"
            value={products.total}
          />
          <DashboardCard
            label="En promoción"
            value={products.total_promotions}
            accent={products.total_promotions > 0}
          />
          <DashboardCard
            label="Top ventas del mes"
            value={products.top_selling ? `×${products.top_selling.quantity}` : '—'}
            sublabel={products.top_selling?.name ?? 'Sin ventas este mes'}
            accent={!!products.top_selling}
          />
        </div>
      </section>

      {/* Pedidos */}
      <section>
        <SectionHeader
          title="Pedidos del mes"
          href="/admin/orders"
          linkLabel="Ver pedidos"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard
            label="Total"
            value={orders.total_month}
          />
          {(['pending', 'confirmed', 'delivered'] as const).map((s) => (
            <div
              key={s}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600">
                {STATUS_LABELS[s]}
              </p>
              <p className={`text-2xl font-bold tabular-nums leading-tight ${STATUS_COLORS[s]}`}>
                {orders.by_status[s]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Clientes */}
      <section>
        <SectionHeader
          title="Clientes"
          href="/admin/customers"
          linkLabel="Ver clientes"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard
            label="Total clientes"
            value={customers.total}
          />
          <DashboardCard
            label="Top cliente del mes"
            value={customers.top_month ? customers.top_month.name : '—'}
            sublabel={customers.top_month
              ? `${customers.top_month.order_count} pedido${customers.top_month.order_count !== 1 ? 's' : ''} · ${customers.top_month.email}`
              : 'Sin pedidos este mes'}
            accent={!!customers.top_month}
          />
        </div>
      </section>

    </div>
  )
}
