import { supabase } from '@/lib/supabaseClient'

export type CustomerProfile = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
}

export async function getCustomers(): Promise<{
  data: CustomerProfile[]
  error: string | null
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, address, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: (data ?? []) as CustomerProfile[], error: null }
  } catch (err: unknown) {
    return { data: [], error: err instanceof Error ? err.message : 'Error al obtener clientes' }
  }
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  return normalizePhone(phone).length >= 7
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function buildCustomerWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`
}

export function buildEmailLink(emails: string[], subject: string, body: string): string {
  const valid = emails.filter(isValidEmail)
  if (valid.length === 0) return ''
  return `mailto:${valid.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
