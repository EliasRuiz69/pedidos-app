import { supabase } from '@/lib/supabaseClient'
import type { AdminOrder, CartItem, Order, OrderStatus, OrderWithItems } from '@/types'

export async function createOrder(
  userId: string,
  items: CartItem[],
  total: number
): Promise<{ orderId: string | null; error: string | null }> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, total })
      .select('id')
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return { orderId: order.id, error: null }
  } catch (err: unknown) {
    return { orderId: null, error: err instanceof Error ? err.message : 'Error al crear pedido' }
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) return null
    return data as Order
  } catch {
    return null
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Order[]
  } catch {
    return []
  }
}

export async function getAllOrdersWithProfiles(): Promise<AdminOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(*), order_items(*, products(*))')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as AdminOrder[]
  } catch {
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al actualizar estado' }
  }
}

export async function getOrderWithItems(
  orderId: string,
  userId: string
): Promise<OrderWithItems | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data as OrderWithItems
  } catch {
    return null
  }
}
