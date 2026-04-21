import type { CartItem, Profile } from '@/types'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export function buildWhatsAppMessage(
  profile: Profile,
  items: CartItem[],
  total: number
): string {
  const lines: string[] = []

  lines.push(`Hola, quiero hacer un pedido 🛒`)
  lines.push(``)
  lines.push(`*Cliente:* ${profile.name}`)
  lines.push(`*Teléfono:* ${profile.phone}`)
  lines.push(`*Dirección:* ${profile.address}`)
  lines.push(``)
  lines.push(`*Productos:*`)

  for (const item of items) {
    lines.push(`• ${item.product.name} x${item.quantity} — $${(item.product.price * item.quantity).toFixed(2)}`)
  }

  lines.push(``)
  lines.push(`*Total: $${total.toFixed(2)}*`)

  return lines.join('\n')
}

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
