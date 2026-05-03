'use client'

import { useEffect, useState } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import {
  getCustomers,
  buildCustomerWhatsAppLink,
  buildEmailLink,
  isValidPhone,
  isValidEmail,
  type CustomerProfile,
} from '@/lib/customers'

// ─── Types ────────────────────────────────────────────────────────────────────

type WaEntry = { name: string; phone: string; link: string }
type PendingAction = 'whatsapp' | 'email' | null

// ─── Small sub-components ─────────────────────────────────────────────────────

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => { if (el) el.indeterminate = indeterminate }}
      onChange={onChange}
      className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
    />
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="skeleton h-7 w-28 mb-2 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>
      <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
        <div className="skeleton h-20 w-full rounded-xl" />
        <div className="skeleton h-9 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-neutral-800 last:border-0">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="skeleton h-4 w-36 rounded" />
              <div className="skeleton h-3 w-44 rounded" />
            </div>
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const { loading: guardLoading, authorized } = useAdminGuard()
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('Mensaje de Pedidos App')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [waLinks, setWaLinks] = useState<WaEntry[]>([])

  useEffect(() => {
    if (guardLoading || !authorized) return
    getCustomers().then(({ data, error: err }) => {
      if (err) setError(err)
      else setCustomers(data)
      setLoading(false)
    })
  }, [guardLoading, authorized])

  if (guardLoading || loading) return <Skeleton />

  // ── Derived state ────────────────────────────────────────────────────────────
  const allSelected = customers.length > 0 && selected.size === customers.length
  const someSelected = selected.size > 0 && selected.size < customers.length
  const selectedList = customers.filter((c) => selected.has(c.id))
  const withPhone = selectedList.filter((c) => isValidPhone(c.phone))
  const withEmail = selectedList.filter((c) => isValidEmail(c.email))
  const canAct = selected.size > 0 && message.trim().length > 0

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setWaLinks([])
    setPendingAction(null)
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(customers.map((c) => c.id)))
    setWaLinks([])
    setPendingAction(null)
  }

  function clearSelection() {
    setSelected(new Set())
    setPendingAction(null)
    setWaLinks([])
  }

  function confirmWhatsApp() {
    if (withPhone.length === 0) { setPendingAction(null); return }
    if (withPhone.length === 1) {
      window.open(buildCustomerWhatsAppLink(withPhone[0].phone, message), '_blank')
      setWaLinks([])
    } else {
      setWaLinks(withPhone.map((c) => ({
        name: c.name,
        phone: c.phone,
        link: buildCustomerWhatsAppLink(c.phone, message),
      })))
    }
    setPendingAction(null)
  }

  function confirmEmail() {
    if (withEmail.length === 0) { setPendingAction(null); return }
    const link = buildEmailLink(withEmail.map((c) => c.email), subject, message)
    const a = document.createElement('a')
    a.href = link
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setPendingAction(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Message composer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Mensaje</p>
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setWaLinks([]) }}
          placeholder="Escribe el mensaje que enviarás a los clientes…"
          rows={3}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:border-orange-500 focus:outline-none resize-none transition-colors"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto del email"
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-400 placeholder-neutral-600 focus:border-orange-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Action bar */}
      {selected.size > 0 && (
        <div className="rounded-2xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="flex-1 text-sm font-medium text-neutral-300">
            {selected.size} {selected.size === 1 ? 'cliente seleccionado' : 'clientes seleccionados'}
          </span>

          {pendingAction === null ? (
            <>
              <button
                onClick={clearSelection}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Limpiar
              </button>
              <button
                disabled={!canAct || withPhone.length === 0}
                onClick={() => setPendingAction('whatsapp')}
                title={!canAct ? 'Escribe un mensaje primero' : withPhone.length === 0 ? 'Ningún cliente tiene teléfono válido' : ''}
                className="flex items-center gap-1.5 rounded-xl bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp {withPhone.length < selected.size && `(${withPhone.length})`}
              </button>
              <button
                disabled={!canAct || withEmail.length === 0}
                onClick={() => setPendingAction('email')}
                title={!canAct ? 'Escribe un mensaje primero' : withEmail.length === 0 ? 'Ningún cliente tiene email válido' : ''}
                className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email {withEmail.length < selected.size && `(${withEmail.length})`}
              </button>
            </>
          ) : pendingAction === 'whatsapp' ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-neutral-400">
                ¿Enviar WhatsApp a {withPhone.length} {withPhone.length === 1 ? 'cliente' : 'clientes'}
                {withPhone.length < selected.size && ` (${selected.size - withPhone.length} sin teléfono válido)`}?
              </span>
              <button
                onClick={confirmWhatsApp}
                className="rounded-lg bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-neutral-600 px-3 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-neutral-400">
                ¿Enviar email a {withEmail.length} {withEmail.length === 1 ? 'cliente' : 'clientes'}
                {withEmail.length < selected.size && ` (${selected.size - withEmail.length} sin email válido)`}?
              </span>
              <button
                onClick={confirmEmail}
                className="rounded-lg bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-neutral-600 px-3 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* List / Table */}
      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 py-20 text-center">
          <p className="text-sm text-neutral-600">No hay clientes registrados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

          {/* ── Móvil: tarjetas ── */}
          <div className="sm:hidden">
            {/* Select all row */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-800 bg-neutral-800/30">
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              <span className="text-xs text-neutral-600">Seleccionar todos</span>
            </div>
            <div className="divide-y divide-neutral-800">
              {customers.map((c) => {
                const isSelected = selected.has(c.id)
                return (
                  <div
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={() => toggle(c.id)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-neutral-100 truncate">{c.name || '—'}</p>
                        <span className="font-mono text-[10px] text-neutral-600 shrink-0">
                          {c.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{c.email || '—'}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                        {c.phone && (
                          <span className={isValidPhone(c.phone) ? 'text-neutral-400' : 'text-neutral-700'}>
                            {c.phone}
                          </span>
                        )}
                        {c.address && (
                          <span className="text-neutral-600 truncate">{c.address}</span>
                        )}
                      </div>
                      {c.created_at && (
                        <p className="mt-1 text-[10px] text-neutral-700">
                          {new Date(c.created_at).toLocaleDateString('es-MX')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Desktop: tabla ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-800">
                <tr>
                  <th className="w-10 px-4 py-3 text-left">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  {['ID', 'Cliente', 'Teléfono', 'Dirección', 'Registro'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const isSelected = selected.has(c.id)
                  return (
                    <tr
                      key={c.id}
                      onClick={() => toggle(c.id)}
                      className={`border-b border-neutral-800/50 last:border-0 cursor-pointer transition-colors ${
                        isSelected ? 'bg-orange-500/5' : 'hover:bg-neutral-800/20'
                      }`}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggle(c.id)} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">
                        {c.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-neutral-100">{c.name || '—'}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{c.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400">
                        {isValidPhone(c.phone) ? c.phone : (
                          <span className="text-neutral-700">{c.phone || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 max-w-[180px] truncate">
                        {c.address || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-neutral-600 whitespace-nowrap">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString('es-MX')
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* WhatsApp links panel for multiple recipients */}
      {waLinks.length > 0 && (
        <div className="rounded-2xl border border-green-900/30 bg-green-950/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-green-400">
              Abre WhatsApp para cada cliente
            </p>
            <button
              onClick={() => setWaLinks([])}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
          <div className="space-y-2">
            {waLinks.map((entry) => (
              <div
                key={entry.phone}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-200">{entry.name}</p>
                  <p className="text-xs text-neutral-600">{entry.phone}</p>
                </div>
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  Abrir
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
