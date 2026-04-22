import { supabase } from '@/lib/supabaseClient'
import type { AdminOrder, OrderStatus } from '@/types'

export type ReportFilters = {
  dateFrom: string
  dateTo: string
  dateExact: string
  status: OrderStatus | ''
  customer: string
  orderId: string
  totalMin: string
  totalMax: string
  totalExact: string
}

export const EMPTY_FILTERS: ReportFilters = {
  dateFrom: '',
  dateTo: '',
  dateExact: '',
  status: '',
  customer: '',
  orderId: '',
  totalMin: '',
  totalMax: '',
  totalExact: '',
}

const DEFAULT_LIMIT = 200

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
}

export async function getFilteredOrders(
  filters: ReportFilters
): Promise<{ data: AdminOrder[]; error: string | null }> {
  try {
    let query = supabase
      .from('orders')
      .select('*, profiles(*), order_items(*, products(*))')
      .order('created_at', { ascending: false })

    const hasFilter = Object.values(filters).some((v) => v !== '')
    if (!hasFilter) query = query.limit(DEFAULT_LIMIT)

    if (filters.dateExact) {
      query = query
        .gte('created_at', `${filters.dateExact}T00:00:00`)
        .lte('created_at', `${filters.dateExact}T23:59:59`)
    } else {
      if (filters.dateFrom) query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
      if (filters.dateTo)   query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
    }

    if (filters.status) query = query.eq('status', filters.status)

    if (filters.orderId) query = query.ilike('id', `%${filters.orderId}%`)

    if (filters.totalExact !== '') {
      const exact = parseFloat(filters.totalExact)
      if (!isNaN(exact)) query = query.eq('total', exact)
    } else {
      if (filters.totalMin !== '') {
        const min = parseFloat(filters.totalMin)
        if (!isNaN(min)) query = query.gte('total', min)
      }
      if (filters.totalMax !== '') {
        const max = parseFloat(filters.totalMax)
        if (!isNaN(max)) query = query.lte('total', max)
      }
    }

    const { data, error } = await query
    if (error) throw error

    let result = (data ?? []) as AdminOrder[]

    if (filters.customer) {
      const term = filters.customer.toLowerCase()
      result = result.filter((o) => {
        const name  = (o.profiles?.name  ?? '').toLowerCase()
        const email = (o.profiles?.email ?? '').toLowerCase()
        return name.includes(term) || email.includes(term)
      })
    }

    return { data: result, error: null }
  } catch (err: unknown) {
    return { data: [], error: err instanceof Error ? err.message : 'Error al obtener pedidos' }
  }
}

function buildRows(orders: AdminOrder[]) {
  return orders.map((o) => ({
    ID:      o.id.slice(0, 8).toUpperCase(),
    Cliente: o.profiles?.name  ?? '',
    Email:   o.profiles?.email ?? '',
    Fecha:   new Date(o.created_at).toLocaleDateString('es-MX'),
    Estado:  STATUS_LABELS[(o.status as OrderStatus)] ?? o.status,
    Total:   o.total,
  }))
}

export async function exportToExcel(orders: AdminOrder[], filename = 'reporte-pedidos') {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(buildRows(orders))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export async function exportToPDF(orders: AdminOrder[], filename = 'reporte-pedidos') {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.setTextColor(249, 115, 22)
  doc.text('Reporte de Pedidos', 14, 18)

  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  ${orders.length} resultado${orders.length !== 1 ? 's' : ''}`, 14, 25)

  autoTable(doc, {
    startY: 31,
    head: [['ID', 'Cliente', 'Email', 'Fecha', 'Estado', 'Total']],
    body: orders.map((o) => [
      o.id.slice(0, 8).toUpperCase(),
      o.profiles?.name  ?? '',
      o.profiles?.email ?? '',
      new Date(o.created_at).toLocaleDateString('es-MX'),
      STATUS_LABELS[(o.status as OrderStatus)] ?? o.status,
      `$${o.total.toFixed(2)}`,
    ]),
    styles:     { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: { 5: { halign: 'right' } },
  })

  doc.save(`${filename}.pdf`)
}
