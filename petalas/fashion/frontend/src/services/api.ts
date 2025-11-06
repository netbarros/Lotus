import axios, { type AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add tenant ID
    config.headers['X-Tenant-ID'] = TENANT_ID

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Products API
export const productsApi = {
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    apiClient.get('/petalas/fashion/products', { params }),

  getById: (id: string) =>
    apiClient.get(`/petalas/fashion/products/${id}`),

  search: (query: string) =>
    apiClient.get('/petalas/fashion/products', { params: { search: query } })
}

// Cart API
export const cartApi = {
  get: () =>
    apiClient.get('/petalas/fashion/cart'),

  add: (productId: string, quantity: number, variantId?: string) =>
    apiClient.post('/petalas/fashion/cart/add', {
      product_id: productId,
      quantity,
      variant_id: variantId
    }),

  update: (itemId: string, quantity: number) =>
    apiClient.put(`/petalas/fashion/cart/${itemId}`, { quantity }),

  remove: (itemId: string) =>
    apiClient.delete(`/petalas/fashion/cart/${itemId}`),

  clear: () =>
    apiClient.delete('/petalas/fashion/cart')
}

// Checkout API
export const checkoutApi = {
  create: (data: {
    billing_address: any
    shipping_address: any
    payment_method: string
    coupon_code?: string
    customer_email?: string
    customer_name?: string
    customer_phone?: string
  }) =>
    apiClient.post('/petalas/fashion/checkout', data),

  validate: (data: { coupon_code?: string }) =>
    apiClient.post('/petalas/fashion/checkout/validate', data)
}

// Payment API
export const paymentApi = {
  process: (orderId: string, paymentMethod: string, paymentData: any) =>
    apiClient.post('/petalas/fashion/payment', {
      order_id: orderId,
      payment_method: paymentMethod,
      payment_data: paymentData
    }),

  getStatus: (orderId: string) =>
    apiClient.get(`/petalas/fashion/payment/${orderId}/status`)
}

// Reviews API
export const reviewsApi = {
  list: (productId: string, params?: { limit?: number; offset?: number; sort?: string; rating_filter?: number }) =>
    apiClient.get(`/petalas/fashion/reviews/${productId}`, { params }),

  create: (data: {
    product_id: string
    rating: number
    title?: string
    comment?: string
    images?: string[]
  }) =>
    apiClient.post('/petalas/fashion/reviews', data),

  markHelpful: (reviewId: string) =>
    apiClient.post(`/petalas/fashion/reviews/${reviewId}/helpful`),

  getStats: (productId: string) =>
    apiClient.get(`/petalas/fashion/reviews/stats/${productId}`)
}

// Recommendations API
export const recommendationsApi = {
  get: (params?: { user_id?: string; product_id?: string; type?: string; limit?: number }) =>
    apiClient.get('/petalas/fashion/recommendations', { params }),

  feedback: (productId: string, action: string, context?: any) =>
    apiClient.post('/petalas/fashion/recommendations/feedback', {
      product_id: productId,
      action,
      context
    })
}

// Customers API
export const customersApi = {
  getProfile: () =>
    apiClient.get('/petalas/fashion/customers/profile'),

  updateProfile: (data: { name?: string; phone?: string; addresses?: any; preferences?: any }) =>
    apiClient.put('/petalas/fashion/customers/profile', data),

  getOrders: (params?: { limit?: number; offset?: number; status?: string }) =>
    apiClient.get('/petalas/fashion/customers/orders', { params }),

  addAddress: (address: any) =>
    apiClient.post('/petalas/fashion/customers/addresses', { address }),

  updateAddress: (addressId: string, address: any) =>
    apiClient.put(`/petalas/fashion/customers/addresses/${addressId}`, { address }),

  deleteAddress: (addressId: string) =>
    apiClient.delete(`/petalas/fashion/customers/addresses/${addressId}`)
}

// Orders API
export const ordersApi = {
  get: (orderId: string) =>
    apiClient.get(`/petalas/fashion/orders/${orderId}`),

  cancel: (orderId: string, reason?: string) =>
    apiClient.put(`/petalas/fashion/orders/${orderId}/cancel`, { reason }),

  refund: (orderId: string, reason: string, items?: any[]) =>
    apiClient.post(`/petalas/fashion/orders/${orderId}/refund`, { reason, items }),

  getInvoice: (orderId: string) =>
    apiClient.get(`/petalas/fashion/orders/${orderId}/invoice`, { responseType: 'blob' })
}

// Loyalty API
export const loyaltyApi = {
  getStatus: () =>
    apiClient.get('/petalas/fashion/loyalty/status'),

  redeem: (points: number, type: string) =>
    apiClient.post('/petalas/fashion/loyalty/redeem', { points, type }),

  getHistory: (params?: { limit?: number }) =>
    apiClient.get('/petalas/fashion/loyalty/history', { params }),

  getRewards: () =>
    apiClient.get('/petalas/fashion/loyalty/rewards')
}

// Coupons API
export const couponsApi = {
  validate: (code: string, cartTotal?: number, customerEmail?: string) =>
    apiClient.post('/petalas/fashion/coupons/validate', {
      code,
      cart_total: cartTotal,
      customer_email: customerEmail
    }),

  getActive: (params?: { customer_email?: string }) =>
    apiClient.get('/petalas/fashion/coupons/active', { params })
}

// Shipping API
export const shippingApi = {
  calculate: (destination: any, items: any[], couponCode?: string) =>
    apiClient.post('/petalas/fashion/shipping/calculate', {
      destination,
      items,
      coupon_code: couponCode
    }),

  track: (orderId?: string, trackingNumber?: string) =>
    apiClient.post('/petalas/fashion/shipping/track', {
      order_id: orderId,
      tracking_number: trackingNumber
    })
}

// Analytics API
export const analyticsApi = {
  getDashboard: (params?: { period?: string }) =>
    apiClient.get('/petalas/fashion/analytics/dashboard', { params }),

  getProducts: (params?: { period?: string; sort?: string; limit?: number }) =>
    apiClient.get('/petalas/fashion/analytics/products', { params }),

  getCustomers: (params?: { segment?: string }) =>
    apiClient.get('/petalas/fashion/analytics/customers', { params })
}

// AR Try-On API
export const arApi = {
  startSession: (productId: string, customerMeasurements?: any) =>
    apiClient.post('/petalas/fashion/ar/session', {
      product_id: productId,
      customer_measurements: customerMeasurements
    }),

  updateSession: (sessionId: string, action: string, data?: any) =>
    apiClient.put(`/petalas/fashion/ar/session/${sessionId}`, { action, data }),

  getProducts: (params?: { category_id?: string; limit?: number }) =>
    apiClient.get('/petalas/fashion/ar/products', { params }),

  submitFeedback: (sessionId: string, rating: number, comment?: string, issues?: any) =>
    apiClient.post('/petalas/fashion/ar/feedback', {
      session_id: sessionId,
      rating,
      comment,
      issues
    })
}

export default apiClient
