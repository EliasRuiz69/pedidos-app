'use client'

import { useEffect, useRef, useState } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import {
  getFilteredOrders,
  exportToExcel,
  exportToPDF,
  EMPTY_FILTERS,
} from '@/lib/reports'
import type { ReportFilters } from '@/lib/reports'
import type { AdminOrder, OrderStatus } from '@/types'
import { getCustomers } from '@/lib/customers'
import type { CustomerProfile } from '@/lib/customers'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
}

type DateMode  = 'range' | 'exact'
type TotalMode = 'range' | 'exact'

function ModeToggle({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex rounded-lg border border-neutral-700 overflow-hidden w-fit">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value === o.value
              ? 'bg-orange-500 text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function AdminReportsPage() {
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS)
  const [dateMode,  setDateMode]  = useState<DateMode>('range')
  const [totalMode, setTotalMode] = useState<TotalMode>('range')
  const [results,   setResults]   = useState<AdminOrder[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [error, setError] = useState('')
  const [customerList, setCustomerList] = useState<CustomerProfile[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const customerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCustomers().then(({ data }) => setCustomerList(data))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const customerSuggestions = filters.customer.trim()
    ? customerList.filter((c) => {
        const term = filters.customer.toLowerCase()
        return c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
      })
    : []

  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleDateModeChange(mode: string) {
    setDateMode(mode as DateMode)
    setFilters((prev) => ({ ...prev, dateFrom: '', dateTo: '', dateExact: '' }))
  }

  function handleTotalModeChange(mode: string) {
    setTotalMode(mode as TotalMode)
    setFilters((prev) => ({ ...prev, totalMin: '', totalMax: '', totalExact: '' }))
  }

  async function handleSearch() {
    setSearching(true)
    setError('')
    const active: ReportFilters = {
      ...filters,
      ...(dateMode  === 'exact' ? { dateFrom: '',  dateTo:   '' } : { dateExact:  '' }),
      ...(totalMode === 'exact' ? { totalMin: '',  totalMax: '' } : { totalExact: '' }),
    }
    const { data, error: fetchError } = await getFilteredOrders(active)
    if (fetchError) setError(fetchError)
    else setResults(data)
    setSearching(false)
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS)
    setDateMode('range')
    setTotalMode('range')
    setResults(null)
    setError('')
    setShowSuggestions(false)
  }

  async function handleExportExcel() {
    if (!results?.length) return
    setExporting('excel')
    await exportToExcel(results)
    setExporting(null)
  }

  async function handleExportPDF() {
    if (!results?.length) return
    setExporting('pdf')
    await exportToPDF(results)
    setExporting(null)
  }

  if (guardLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="skeleton h-7 w-36 mb-2" />
        <div className="skeleton h-4 w-48 mb-6" />
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!authorized) return null

  const hasResults = results !== null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Reportes</h1>
        <p className="mt-1 text-sm text-neutral-600">Filtra pedidos y exporta el resultado</p>
      </div>

      {/* Filter card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 mb-5">
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Date */}
          <div className="sm:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Fecha</label>
              <ModeToggle
                value={dateMode}
                options={[{ value: 'range', label: 'Rango' }, { value: 'exact', label: 'Exacta' }]}
                onChange={handleDateModeChange}
              />
            </div>
            {dateMode === 'range' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-600">Desde</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => set('dateFrom', e.target.value)}
                    className="input-dark [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-600">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => set('dateTo', e.target.value)}
                    className="input-dark [color-scheme:dark]"
                  />
                </div>
              </div>
            ) : (
              <input
                type="date"
                value={filters.dateExact}
                onChange={(e) => set('dateExact', e.target.value)}
                className="input-dark [color-scheme:dark]"
              />
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => set('status', e.target.value as OrderStatus | '')}
              className="input-dark"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="delivered">Entregado</option>
            </select>
          </div>

          {/* Customer */}
          <div className="flex flex-col gap-1.5" ref={customerRef}>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Cliente</label>
            <div className="relative">
              <input
                type="search"
                value={filters.customer}
                onChange={(e) => { set('customer', e.target.value); setShowSuggestions(true) }}
                onFocus={() => { if (filters.customer.trim()) setShowSuggestions(true) }}
                placeholder="Nombre o email"
                className="input-dark w-full [&::-webkit-search-cancel-button]:hidden"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                name="customer-search-x"
              />
              {showSuggestions && customerSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 shadow-xl overflow-hidden">
                  {customerSuggestions.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          set('customer', c.name)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors"
                      >
                        <p className="text-sm font-medium text-neutral-200 truncate">{c.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Order ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">ID de pedido</label>
            <input
              type="text"
              value={filters.orderId}
              onChange={(e) => set('orderId', e.target.value)}
              placeholder="Buscar por ID"
              className="input-dark"
            />
          </div>

          {/* Total */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total</label>
              <ModeToggle
                value={totalMode}
                options={[{ value: 'range', label: 'Rango' }, { value: 'exact', label: 'Exacto' }]}
                onChange={handleTotalModeChange}
              />
            </div>
            {totalMode === 'range' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.totalMin}
                    onChange={(e) => set('totalMin', e.target.value)}
                    placeholder="Mín"
                    className="input-dark pl-7"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.totalMax}
                    onChange={(e) => set('totalMax', e.target.value)}
                    placeholder="Máx"
                    className="input-dark pl-7"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.totalExact}
                  onChange={(e) => set('totalExact', e.target.value)}
                  placeholder="Total exacto"
                  className="input-dark pl-7"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center gap-3">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary !w-auto px-6"
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando...
              </span>
            ) : 'Buscar'}
          </button>
          <button onClick={handleReset} className="btn-ghost">Limpiar</button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div>
          {/* Summary + export */}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-200">{results.length}</span>
              {' '}{results.length === 1 ? 'resultado' : 'resultados'}
            </p>

            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  disabled={exporting !== null}
                  className="flex items-center gap-2 rounded-xl border border-green-800/50 bg-green-950/20 px-4 py-2 text-xs font-semibold text-green-400 hover:bg-green-950/40 disabled:opacity-50 transition-all"
                >
                  {exporting === 'excel' ? (
                    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting !== null}
                  className="flex items-center gap-2 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50 transition-all"
                >
                  {exporting === 'pdf' ? (
                    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  PDF
                </button>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-600">No se encontraron pedidos con esos filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-800">
                  <tr>
                    {['ID', 'Cliente', 'Fecha', 'Estado', 'Total'].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-600 ${h === 'Total' ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((order) => {
                    const statusKey = (order.status ?? 'pending') as OrderStatus
                    const customerName =
                      order.profiles?.name ||
                      order.profiles?.email?.split('@')[0] ||
                      'Sin nombre'

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-neutral-200">{customerName}</p>
                          {order.profiles?.email && (
                            <p className="text-xs text-neutral-600 mt-0.5">{order.profiles.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-neutral-500">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[statusKey]}`}>
                            {STATUS_LABELS[statusKey]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-neutral-50 tabular-nums">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
