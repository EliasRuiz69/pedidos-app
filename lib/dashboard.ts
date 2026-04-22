import { supabase } from '@/lib/supabaseClient'
import type { OrderStatus } from '@/types'

export type TopProduct = {
  name: string
  quantity: number
}

export type TopCustomer = {
  name: string
  email: string
  order_count: number
}

export type DashboardMetrics = {
  products: {
    total: number
    total_promotions: number
    top_selling: TopProduct | null
  }
  orders: {
    total_month: number
    by_status: Record<OrderStatus, number>
  }
  customers: {
    total: number
    top_month: TopCustomer | null
  }
}

type RawOrderRow = {
  id: string
  status: string
  user_id: string
  profiles: { name: string; email: string } | null
  order_items: Array<{
    quantity: number
    product_id: string
    products: { name: string } | null
  }> | null
}

function monthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  return { start, end }
}

export async function getDashboardMetrics(): Promise<{
  data: DashboardMetrics | null
  error: string | null
}> {
  try {
    const { start, end } = monthRange()

    const [productsRes, ordersRes, customersRes] = await Promise.all([
      supabase.from('products').select('id, is_promo'),
      supabase
        .from('orders')
        .select('id, status, user_id, profiles(name, email), order_items(quantity, product_id, products(name))')
        .gte('created_at', start)
        .lte('created_at', end),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
    ])

    if (productsRes.error) throw productsRes.error
    if (ordersRes.error) throw ordersRes.error
    if (customersRes.error) throw customersRes.error

    const allProducts = (productsRes.data ?? []) as { id: string; is_promo: boolean }[]
    const monthOrders = (ordersRes.data ?? []) as unknown as RawOrderRow[]
    const totalCustomers = customersRes.count ?? 0

    // Products
    const total = allProducts.length
    const total_promotions = allProducts.filter((p) => p.is_promo).length

    // Top selling product this month
    const qtyByProduct = new Map<string, { name: string; qty: number }>()
    for (const order of monthOrders) {
      for (const item of order.order_items ?? []) {
        const name = item.products?.name ?? item.product_id
        const prev = qtyByProduct.get(item.product_id)
        if (prev) {
          prev.qty += item.quantity
        } else {
          qtyByProduct.set(item.product_id, { name, qty: item.quantity })
        }
      }
    }

    let top_selling: TopProduct | null = null
    if (qtyByProduct.size > 0) {
      const sorted = [...qtyByProduct.values()].sort((a, b) => b.qty - a.qty)
      top_selling = { name: sorted[0].name, quantity: sorted[0].qty }
    }

    // Orders by status
    const total_month = monthOrders.length
    const by_status: Record<OrderStatus, number> = { pending: 0, confirmed: 0, delivered: 0 }
    for (const order of monthOrders) {
      const s = order.status as OrderStatus
      if (s in by_status) by_status[s]++
    }

    // Top customer this month
    const countByCustomer = new Map<string, { name: string; email: string; count: number }>()
    for (const order of monthOrders) {
      const uid = order.user_id
      const profile = order.profiles
      const prev = countByCustomer.get(uid)
      if (prev) {
        prev.count++
      } else {
        countByCustomer.set(uid, {
          name: profile?.name ?? '—',
          email: profile?.email ?? '',
          count: 1,
        })
      }
    }

    let top_month: TopCustomer | null = null
    if (countByCustomer.size > 0) {
      const sorted = [...countByCustomer.values()].sort((a, b) => b.count - a.count)
      top_month = { name: sorted[0].name, email: sorted[0].email, order_count: sorted[0].count }
    }

    return {
      data: {
        products: { total, total_promotions, top_selling },
        orders: { total_month, by_status },
        customers: { total: totalCustomers, top_month },
      },
      error: null,
    }
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al cargar métricas',
    }
  }
}
