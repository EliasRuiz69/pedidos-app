import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_promo', { ascending: false })
      .order('name', { ascending: true })
    if (error) throw error
    return data as Product[]
  } catch {
    return []
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as Product
  } catch {
    return null
  }
}

export async function createProduct(
  data: Omit<Product, 'id'>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('products').insert(data)
    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al crear producto' }
  }
}

export async function updateProduct(
  id: string,
  data: Omit<Product, 'id'>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('products').update(data).eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al actualizar producto' }
  }
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al eliminar producto' }
  }
}
