/**
 * 🌸 MAGICSAAS SYSTEM-∞ - UNIVERSAL API COMPOSABLE
 *
 * VUE 3 COMPOSABLE FOR TYPE-SAFE API CALLS
 * =========================================
 *
 * ✅ 100% reusable across all pétalas
 * ✅ Reactive state management
 * ✅ Auto loading/error handling
 * ✅ Type-safe
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

import { ref, computed, type Ref } from 'vue'
import { getUniversalApis, type UniversalApis } from '../api/petala-apis'
import { getRuntimeConfig, type RuntimeConfig } from '../config/runtime-config'

export interface UseApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  isSuccess: Ref<boolean>
  isError: Ref<boolean>
}

export interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Universal API Composable
 */
export function useUniversalApi() {
  const apis: Ref<UniversalApis | null> = ref(null)
  const config: Ref<RuntimeConfig | null> = ref(null)
  const initialized = ref(false)

  /**
   * Initialize APIs and config
   */
  async function initialize() {
    if (initialized.value) return

    try {
      config.value = await getRuntimeConfig()
      apis.value = await getUniversalApis()
      initialized.value = true
    } catch (error) {
      console.error('Failed to initialize Universal API:', error)
      throw error
    }
  }

  /**
   * Ensure initialized before accessing
   */
  function ensureInitialized() {
    if (!initialized.value || !apis.value || !config.value) {
      throw new Error('Universal API not initialized. Call initialize() first.')
    }
  }

  /**
   * Get specific API
   */
  function getApi<K extends keyof UniversalApis>(apiName: K): UniversalApis[K] {
    ensureInitialized()
    return apis.value![apiName]
  }

  /**
   * Execute API call with state management
   */
  async function execute<T>(
    apiCall: () => Promise<T>,
    options?: UseApiOptions
  ): Promise<UseApiState<T>> {
    const data = ref<T | null>(null) as Ref<T | null>
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const isSuccess = computed(() => !loading.value && error.value === null && data.value !== null)
    const isError = computed(() => error.value !== null)

    const execute = async () => {
      loading.value = true
      error.value = null

      try {
        data.value = await apiCall()

        if (options?.onSuccess) {
          options.onSuccess(data.value)
        }
      } catch (e) {
        error.value = e as Error

        if (options?.onError) {
          options.onError(error.value)
        }
      } finally {
        loading.value = false
      }
    }

    if (options?.immediate !== false) {
      await execute()
    }

    return {
      data,
      loading,
      error,
      isSuccess,
      isError
    }
  }

  /**
   * Products API
   */
  const products = {
    list: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('products').list(params), options),

    getById: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('products').getById(id), options),

    search: (query: string, params?: any, options?: UseApiOptions) =>
      execute(() => getApi('products').search(query, params), options),

    getByCategory: (categoryId: string, params?: any, options?: UseApiOptions) =>
      execute(() => getApi('products').getByCategory(categoryId, params), options),

    getFeatured: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('products').getFeatured(params), options),

    getRelated: (productId: string, params?: any, options?: UseApiOptions) =>
      execute(() => getApi('products').getRelated(productId, params), options)
  }

  /**
   * Cart API
   */
  const cart = {
    get: (options?: UseApiOptions) =>
      execute(() => getApi('cart').get(), options),

    add: (productId: string, quantity: number, variantId?: string, options?: UseApiOptions) =>
      execute(() => getApi('cart').add(productId, quantity, variantId), options),

    update: (itemId: string, quantity: number, options?: UseApiOptions) =>
      execute(() => getApi('cart').update(itemId, quantity), options),

    remove: (itemId: string, options?: UseApiOptions) =>
      execute(() => getApi('cart').remove(itemId), options),

    clear: (options?: UseApiOptions) =>
      execute(() => getApi('cart').clear(), options)
  }

  /**
   * Orders API
   */
  const orders = {
    list: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('orders').list(params), options),

    getById: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('orders').getById(id), options),

    create: (data: any, options?: UseApiOptions) =>
      execute(() => getApi('orders').create(data), options),

    cancel: (id: string, reason?: string, options?: UseApiOptions) =>
      execute(() => getApi('orders').cancel(id, reason), options),

    refund: (id: string, reason: string, items?: any[], options?: UseApiOptions) =>
      execute(() => getApi('orders').refund(id, reason, items), options),

    getInvoice: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('orders').getInvoice(id), options),

    track: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('orders').track(id), options)
  }

  /**
   * Appointments API
   */
  const appointments = {
    list: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('appointments').list(params), options),

    getById: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('appointments').getById(id), options),

    create: (data: any, options?: UseApiOptions) =>
      execute(() => getApi('appointments').create(data), options),

    update: (id: string, data: any, options?: UseApiOptions) =>
      execute(() => getApi('appointments').update(id, data), options),

    cancel: (id: string, reason?: string, options?: UseApiOptions) =>
      execute(() => getApi('appointments').cancel(id, reason), options),

    checkAvailability: (params: any, options?: UseApiOptions) =>
      execute(() => getApi('appointments').checkAvailability(params), options),

    getAvailableSlots: (params: any, options?: UseApiOptions) =>
      execute(() => getApi('appointments').getAvailableSlots(params), options)
  }

  /**
   * Customers API
   */
  const customers = {
    getProfile: (options?: UseApiOptions) =>
      execute(() => getApi('customers').getProfile(), options),

    updateProfile: (data: any, options?: UseApiOptions) =>
      execute(() => getApi('customers').updateProfile(data), options),

    getOrders: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('customers').getOrders(params), options),

    getAppointments: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('customers').getAppointments(params), options),

    addAddress: (address: any, options?: UseApiOptions) =>
      execute(() => getApi('customers').addAddress(address), options),

    updateAddress: (id: string, address: any, options?: UseApiOptions) =>
      execute(() => getApi('customers').updateAddress(id, address), options),

    deleteAddress: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('customers').deleteAddress(id), options),

    getAddresses: (options?: UseApiOptions) =>
      execute(() => getApi('customers').getAddresses(), options)
  }

  /**
   * Payment API
   */
  const payment = {
    process: (orderId: string, method: string, data: any, options?: UseApiOptions) =>
      execute(() => getApi('payment').process(orderId, method, data), options),

    getStatus: (orderId: string, options?: UseApiOptions) =>
      execute(() => getApi('payment').getStatus(orderId), options),

    createIntent: (amount: number, currency?: string, options?: UseApiOptions) =>
      execute(() => getApi('payment').createIntent(amount, currency), options),

    confirmPayment: (paymentIntentId: string, options?: UseApiOptions) =>
      execute(() => getApi('payment').confirmPayment(paymentIntentId), options)
  }

  /**
   * Reviews API
   */
  const reviews = {
    list: (itemId: string, params?: any, options?: UseApiOptions) =>
      execute(() => getApi('reviews').list(itemId, params), options),

    create: (data: any, options?: UseApiOptions) =>
      execute(() => getApi('reviews').create(data), options),

    update: (id: string, data: any, options?: UseApiOptions) =>
      execute(() => getApi('reviews').update(id, data), options),

    delete: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('reviews').delete(id), options),

    markHelpful: (id: string, options?: UseApiOptions) =>
      execute(() => getApi('reviews').markHelpful(id), options),

    getStats: (itemId: string, itemType?: string, options?: UseApiOptions) =>
      execute(() => getApi('reviews').getStats(itemId, itemType), options)
  }

  /**
   * Analytics API
   */
  const analytics = {
    getDashboard: (params?: any, options?: UseApiOptions) =>
      execute(() => getApi('analytics').getDashboard(params), options),

    getMetrics: (metric: string, params?: any, options?: UseApiOptions) =>
      execute(() => getApi('analytics').getMetrics(metric, params), options),

    trackEvent: (event: string, data?: any) =>
      getApi('analytics').trackEvent(event, data)
  }

  /**
   * Sofia AI API
   */
  const sofia = {
    chat: (message: string, context?: any, options?: UseApiOptions) =>
      execute(() => getApi('sofia').chat(message, context), options),

    generateIntention: (description: string, requirements?: any, options?: UseApiOptions) =>
      execute(() => getApi('sofia').generateIntention(description, requirements), options),

    validateUX: (url?: string, options?: UseApiOptions) =>
      execute(() => getApi('sofia').validateUX(url), options),

    optimizeSEO: (url: string, content?: string, options?: UseApiOptions) =>
      execute(() => getApi('sofia').optimizeSEO(url, content), options),

    getRecommendations: (type: string, context?: any, options?: UseApiOptions) =>
      execute(() => getApi('sofia').getRecommendations(type, context), options),

    getSuggestions: (context?: any, options?: UseApiOptions) =>
      execute(() => getApi('sofia').getSuggestions(context), options)
  }

  return {
    // Initialization
    initialize,
    initialized,

    // Config
    config,

    // Raw APIs
    apis,
    getApi,

    // Typed APIs
    products,
    cart,
    orders,
    appointments,
    customers,
    payment,
    reviews,
    analytics,
    sofia,

    // Utility
    execute
  }
}

export default useUniversalApi
