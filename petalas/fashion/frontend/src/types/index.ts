// User & Auth
export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'admin'
}

// Products
export interface Product {
  id: string
  tenant_id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: string
  compare_at_price?: string
  sku?: string
  featured_image?: string
  images?: ProductImage[]
  category_id?: string
  brand_id?: string
  inventory_quantity: number
  track_inventory: boolean
  low_stock_threshold?: number
  reviews_count: number
  reviews_average?: number
  views_count: number
  status: 'draft' | 'active' | 'archived'
  ar_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  url: string
  alt: string
  order: number
}

export interface ProductFilters {
  category?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  brand?: string | null
  status?: string
}

// Cart
export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_slug: string
  product_image?: string
  variant_id?: string | null
  quantity: number
  price: string
}

// Orders
export interface Order {
  id: string
  order_number: string
  status: {
    payment: 'pending' | 'paid' | 'failed' | 'refunded'
    fulfillment: 'unfulfilled' | 'shipped' | 'delivered' | 'cancelled'
  }
  customer: {
    email: string
    name?: string
    phone?: string
  }
  totals: {
    subtotal: string
    discount: string
    tax: string
    shipping: string
    total: string
    currency: string
  }
  items_count: number
  created_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
}

// Customer
export interface Customer {
  id: string
  email: string
  name?: string
  phone?: string
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  loyalty_points: number
  orders_count: number
  total_spent: string
  created_at: string
}

// Reviews
export interface Review {
  id: string
  product_id: string
  rating: number
  title?: string
  comment?: string
  verified_purchase: boolean
  helpful_count: number
  customer_name: string
  created_at: string
}

// API Response
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    limit?: number
    offset?: number
    [key: string]: any
  }
}
