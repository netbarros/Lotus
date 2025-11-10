/**
 * 🌸 MAGICSAAS SYSTEM-∞ - PÉTALA-SPECIFIC APIs
 *
 * TYPE-SAFE API INTERFACES FOR ALL PÉTALAS
 * =========================================
 *
 * ✅ 100% reusable across all pétalas
 * ✅ Automatic pétala routing
 * ✅ Type-safe calls
 * ✅ Consistent patterns
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

import type { UniversalApiClient } from './universal-api'
import { getApiClient } from './universal-api'

/**
 * =============================================================================
 * COMMON INTERFACES (Used across all pétalas)
 * =============================================================================
 */

export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
  sort?: string
}

export interface SearchParams extends PaginationParams {
  search?: string
  query?: string
  keyword?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

/**
 * =============================================================================
 * PRODUCTS API (Fashion, Retail, etc.)
 * =============================================================================
 */

export interface ProductsApi {
  list(params?: SearchParams & { status?: string; category?: string }): Promise<any>
  getById(id: string): Promise<any>
  search(query: string, params?: PaginationParams): Promise<any>
  getByCategory(categoryId: string, params?: PaginationParams): Promise<any>
  getFeatured(params?: PaginationParams): Promise<any>
  getRelated(productId: string, params?: PaginationParams): Promise<any>
}

export function createProductsApi(client: UniversalApiClient): ProductsApi {
  return {
    list: (params) => client.get('products', { params }),
    getById: (id) => client.get(`products/${id}`),
    search: (query, params) => client.get('products', { params: { search: query, ...params } }),
    getByCategory: (categoryId, params) => client.get(`products`, { params: { category: categoryId, ...params } }),
    getFeatured: (params) => client.get('products', { params: { featured: true, ...params } }),
    getRelated: (productId, params) => client.get(`products/${productId}/related`, { params })
  }
}

/**
 * =============================================================================
 * CART API (E-commerce pétalas)
 * =============================================================================
 */

export interface CartApi {
  get(): Promise<any>
  add(productId: string, quantity: number, variantId?: string): Promise<any>
  update(itemId: string, quantity: number): Promise<any>
  remove(itemId: string): Promise<any>
  clear(): Promise<any>
}

export function createCartApi(client: UniversalApiClient): CartApi {
  return {
    get: () => client.get('cart'),
    add: (productId, quantity, variantId) =>
      client.post('cart/add', { product_id: productId, quantity, variant_id: variantId }),
    update: (itemId, quantity) => client.put(`cart/${itemId}`, { quantity }),
    remove: (itemId) => client.delete(`cart/${itemId}`),
    clear: () => client.delete('cart')
  }
}

/**
 * =============================================================================
 * ORDERS API (All e-commerce pétalas)
 * =============================================================================
 */

export interface OrdersApi {
  list(params?: PaginationParams & { status?: string }): Promise<any>
  getById(id: string): Promise<any>
  create(data: any): Promise<any>
  cancel(id: string, reason?: string): Promise<any>
  refund(id: string, reason: string, items?: any[]): Promise<any>
  getInvoice(id: string): Promise<Blob>
  track(id: string): Promise<any>
}

export function createOrdersApi(client: UniversalApiClient): OrdersApi {
  return {
    list: (params) => client.get('orders', { params }),
    getById: (id) => client.get(`orders/${id}`),
    create: (data) => client.post('orders', data),
    cancel: (id, reason) => client.put(`orders/${id}/cancel`, { reason }),
    refund: (id, reason, items) => client.post(`orders/${id}/refund`, { reason, items }),
    getInvoice: (id) => client.get(`orders/${id}/invoice`, { responseType: 'blob' }),
    track: (id) => client.get(`orders/${id}/track`)
  }
}

/**
 * =============================================================================
 * APPOINTMENTS/RESERVATIONS API (Restaurant, Healthcare, Services)
 * =============================================================================
 */

export interface AppointmentsApi {
  list(params?: PaginationParams & { status?: string; date?: string }): Promise<any>
  getById(id: string): Promise<any>
  create(data: {
    service_id?: string
    provider_id?: string
    table_id?: string
    date: string
    time: string
    duration?: number
    guests?: number
    customer_name: string
    customer_email: string
    customer_phone: string
    notes?: string
  }): Promise<any>
  update(id: string, data: any): Promise<any>
  cancel(id: string, reason?: string): Promise<any>
  checkAvailability(params: {
    service_id?: string
    provider_id?: string
    date: string
    time?: string
  }): Promise<any>
  getAvailableSlots(params: {
    service_id?: string
    provider_id?: string
    date: string
  }): Promise<any>
}

export function createAppointmentsApi(client: UniversalApiClient): AppointmentsApi {
  return {
    list: (params) => client.get('appointments', { params }),
    getById: (id) => client.get(`appointments/${id}`),
    create: (data) => client.post('appointments', data),
    update: (id, data) => client.put(`appointments/${id}`, data),
    cancel: (id, reason) => client.put(`appointments/${id}/cancel`, { reason }),
    checkAvailability: (params) => client.get('appointments/availability', { params }),
    getAvailableSlots: (params) => client.get('appointments/slots', { params })
  }
}

/**
 * =============================================================================
 * CUSTOMERS API (All pétalas)
 * =============================================================================
 */

export interface CustomersApi {
  getProfile(): Promise<any>
  updateProfile(data: any): Promise<any>
  getOrders(params?: PaginationParams): Promise<any>
  getAppointments(params?: PaginationParams): Promise<any>
  addAddress(address: any): Promise<any>
  updateAddress(id: string, address: any): Promise<any>
  deleteAddress(id: string): Promise<any>
  getAddresses(): Promise<any>
}

export function createCustomersApi(client: UniversalApiClient): CustomersApi {
  return {
    getProfile: () => client.get('customers/profile'),
    updateProfile: (data) => client.put('customers/profile', data),
    getOrders: (params) => client.get('customers/orders', { params }),
    getAppointments: (params) => client.get('customers/appointments', { params }),
    addAddress: (address) => client.post('customers/addresses', { address }),
    updateAddress: (id, address) => client.put(`customers/addresses/${id}`, { address }),
    deleteAddress: (id) => client.delete(`customers/addresses/${id}`),
    getAddresses: () => client.get('customers/addresses')
  }
}

/**
 * =============================================================================
 * PAYMENT API (All e-commerce pétalas)
 * =============================================================================
 */

export interface PaymentApi {
  process(orderId: string, method: string, data: any): Promise<any>
  getStatus(orderId: string): Promise<any>
  createIntent(amount: number, currency?: string): Promise<any>
  confirmPayment(paymentIntentId: string): Promise<any>
}

export function createPaymentApi(client: UniversalApiClient): PaymentApi {
  return {
    process: (orderId, method, data) =>
      client.post('payment', { order_id: orderId, payment_method: method, payment_data: data }),
    getStatus: (orderId) => client.get(`payment/${orderId}/status`),
    createIntent: (amount, currency = 'BRL') =>
      client.post('payment/intent', { amount, currency }),
    confirmPayment: (paymentIntentId) =>
      client.post('payment/confirm', { payment_intent_id: paymentIntentId })
  }
}

/**
 * =============================================================================
 * REVIEWS API (All customer-facing pétalas)
 * =============================================================================
 */

export interface ReviewsApi {
  list(itemId: string, params?: PaginationParams & { rating_filter?: number }): Promise<any>
  create(data: {
    item_id: string
    item_type: string
    rating: number
    title?: string
    comment?: string
    images?: string[]
  }): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<any>
  markHelpful(id: string): Promise<any>
  getStats(itemId: string, itemType?: string): Promise<any>
}

export function createReviewsApi(client: UniversalApiClient): ReviewsApi {
  return {
    list: (itemId, params) => client.get(`reviews/${itemId}`, { params }),
    create: (data) => client.post('reviews', data),
    update: (id, data) => client.put(`reviews/${id}`, data),
    delete: (id) => client.delete(`reviews/${id}`),
    markHelpful: (id) => client.post(`reviews/${id}/helpful`),
    getStats: (itemId, itemType) => client.get(`reviews/stats/${itemId}`, { params: { item_type: itemType } })
  }
}

/**
 * =============================================================================
 * ANALYTICS API (All pétalas)
 * =============================================================================
 */

export interface AnalyticsApi {
  getDashboard(params?: { period?: string; start_date?: string; end_date?: string }): Promise<any>
  getMetrics(metric: string, params?: any): Promise<any>
  trackEvent(event: string, data?: any): Promise<void>
}

export function createAnalyticsApi(client: UniversalApiClient): AnalyticsApi {
  return {
    getDashboard: (params) => client.get('analytics/dashboard', { params }),
    getMetrics: (metric, params) => client.get(`analytics/metrics/${metric}`, { params }),
    trackEvent: (event, data) => client.post('analytics/events', { event, data })
  }
}

/**
 * =============================================================================
 * SOFIA AI API (All pétalas)
 * =============================================================================
 */

export interface SofiaApi {
  chat(message: string, context?: any): Promise<any>
  generateIntention(description: string, requirements?: any): Promise<any>
  validateUX(url?: string): Promise<any>
  optimizeSEO(url: string, content?: string): Promise<any>
  getRecommendations(type: string, context?: any): Promise<any>
  getSuggestions(context?: any): Promise<any>
}

export function createSofiaApi(client: UniversalApiClient): SofiaApi {
  return {
    chat: (message, context) => client.post('sofia/chat', { message, context }),
    generateIntention: (description, requirements) =>
      client.post('sofia/intention', { description, requirements }),
    validateUX: (url) => client.post('sofia/ux-validate', { url }),
    optimizeSEO: (url, content) => client.post('sofia/seo-optimize', { url, content }),
    getRecommendations: (type, context) =>
      client.get('sofia/recommendations', { params: { type, ...context } }),
    getSuggestions: (context) => client.get('sofia/suggestions', { params: context })
  }
}

/**
 * =============================================================================
 * UNIVERSAL API FACADE
 * Creates all APIs with a single call
 * =============================================================================
 */

export interface UniversalApis {
  products: ProductsApi
  cart: CartApi
  orders: OrdersApi
  appointments: AppointmentsApi
  customers: CustomersApi
  payment: PaymentApi
  reviews: ReviewsApi
  analytics: AnalyticsApi
  sofia: SofiaApi
  client: UniversalApiClient
}

/**
 * Create all APIs (async)
 */
export async function createUniversalApis(): Promise<UniversalApis> {
  const client = await getApiClient()

  return {
    products: createProductsApi(client),
    cart: createCartApi(client),
    orders: createOrdersApi(client),
    appointments: createAppointmentsApi(client),
    customers: createCustomersApi(client),
    payment: createPaymentApi(client),
    reviews: createReviewsApi(client),
    analytics: createAnalyticsApi(client),
    sofia: createSofiaApi(client),
    client
  }
}

/**
 * Singleton
 */
let _universalApis: UniversalApis | null = null

/**
 * Get Universal APIs (async, creates singleton)
 */
export async function getUniversalApis(): Promise<UniversalApis> {
  if (!_universalApis) {
    _universalApis = await createUniversalApis()
  }
  return _universalApis
}

/**
 * Reset (useful for testing)
 */
export function resetUniversalApis(): void {
  _universalApis = null
}

export default getUniversalApis
