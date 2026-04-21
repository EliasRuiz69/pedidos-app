export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export type Profile = {
  id: string
  email: string
  name: string
  phone: string
  address: string
  role: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered'

export type Order = {
  id: string
  user_id: string
  total: number
  status: OrderStatus
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}

export type OrderItemWithProduct = OrderItem & {
  products: Product
}

export type OrderWithItems = Order & {
  order_items: OrderItemWithProduct[]
}

export type AdminOrder = Order & {
  profiles: Profile | null
  order_items: OrderItemWithProduct[]
}
