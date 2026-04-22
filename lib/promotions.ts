import type { Product, PromoPriceConfig, PromoQuantityConfig } from '@/types'

/** Effective unit price for display in catalog (price promo only). */
export function getEffectivePrice(product: Product): number {
  if (!product.is_promo || product.promo_type !== 'price' || !product.promo_config) {
    return product.price
  }
  return (product.promo_config as PromoPriceConfig).promo_price
}

/** Total cost for qty units applying any active promo. */
export function getItemTotal(product: Product, quantity: number): number {
  if (!product.is_promo || !product.promo_type || !product.promo_config) {
    return product.price * quantity
  }

  if (product.promo_type === 'price') {
    return (product.promo_config as PromoPriceConfig).promo_price * quantity
  }

  if (product.promo_type === 'quantity') {
    const cfg = product.promo_config as PromoQuantityConfig

    if (cfg.subtype === 'buy_x_pay_y') {
      const groups = Math.floor(quantity / cfg.buy)
      const remainder = quantity % cfg.buy
      return (groups * cfg.pay + remainder) * product.price
    }

    if (cfg.subtype === 'percentage') {
      // Every min_quantity group: (min_quantity - 1) at full price + 1 at discounted price
      const groups = Math.floor(quantity / cfg.min_quantity)
      const remainder = quantity % cfg.min_quantity
      const groupCost =
        (cfg.min_quantity - 1) * product.price +
        product.price * (1 - cfg.discount / 100)
      return groups * groupCost + remainder * product.price
    }
  }

  return product.price * quantity
}

/** Short promotional label for badges ("3x2", "20% OFF", "2° al 50%"). */
export function getPromoLabel(product: Product): string | null {
  if (!product.is_promo || !product.promo_type || !product.promo_config) return null

  if (product.promo_type === 'price') {
    const cfg = product.promo_config as PromoPriceConfig
    const pct = Math.round((1 - cfg.promo_price / product.price) * 100)
    return `${pct}% OFF`
  }

  if (product.promo_type === 'quantity') {
    const cfg = product.promo_config as PromoQuantityConfig
    if (cfg.subtype === 'buy_x_pay_y') return `${cfg.buy}x${cfg.pay}`
    if (cfg.subtype === 'percentage') return `${cfg.min_quantity}° al ${cfg.discount}%`
  }

  return null
}

/** Amount saved for qty units compared to regular price. */
export function getPromoSavings(product: Product, quantity: number): number {
  return product.price * quantity - getItemTotal(product, quantity)
}

/** Cart-level total and total savings across all items. */
export function computeCartTotal(items: { product: Product; quantity: number }[]): {
  total: number
  savings: number
} {
  let total = 0
  let savings = 0
  for (const { product, quantity } of items) {
    total += getItemTotal(product, quantity)
    savings += getPromoSavings(product, quantity)
  }
  return { total, savings }
}
