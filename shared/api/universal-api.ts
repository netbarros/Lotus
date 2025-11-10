/**
 * 🌸 MAGICSAAS SYSTEM-∞ - UNIVERSAL API CLIENT
 *
 * STATE-OF-THE-ART DYNAMIC API SYSTEM
 * ====================================
 *
 * ✅ ZERO CODE CHANGES for different pétalas
 * ✅ Automatic pétala detection and routing
 * ✅ Runtime configuration
 * ✅ Smart retry with exponential backoff
 * ✅ Request/response interceptors
 * ✅ Type-safe API calls
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { getRuntimeConfig, getRuntimeConfigSync, type RuntimeConfig } from '../config/runtime-config'

/**
 * API Client with intelligent routing
 */
export class UniversalApiClient {
  private axiosInstance: AxiosInstance
  private config: RuntimeConfig
  private petalaBasePath: string

  constructor(config: RuntimeConfig) {
    this.config = config
    this.petalaBasePath = config.petala.basePath

    this.axiosInstance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-MagicSaaS-Version': '3.0.0'
      }
    })

    this.setupInterceptors()
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add tenant ID
        config.headers['X-Tenant-ID'] = this.config.tenant.id

        // Add pétala context
        config.headers['X-Petala-Type'] = this.config.petala.type
        config.headers['X-Petala-Name'] = this.config.petala.name

        // Add environment
        config.headers['X-Environment'] = this.config.environment

        // Log in development
        if (this.config.isDevelopment) {
          console.log(`🌸 API Request: ${config.method?.toUpperCase()} ${config.url}`, config)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log in development
        if (this.config.isDevelopment) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        }

        return response
      },
      async (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          await this.handleUnauthorized()
        }

        // Smart retry with exponential backoff
        if (this.shouldRetry(error)) {
          return this.retryRequest(error)
        }

        // Log errors in development
        if (this.config.isDevelopment) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`${this.config.auth.storageKey}_token`)
  }

  /**
   * Handle unauthorized (401) responses
   */
  private async handleUnauthorized(): Promise<void> {
    if (typeof window === 'undefined') return

    // Clear auth data
    localStorage.removeItem(`${this.config.auth.storageKey}_token`)
    localStorage.removeItem(`${this.config.auth.storageKey}_user`)

    // Redirect to login
    // Skip if already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as any

    // Don't retry if max attempts reached
    if (config.__retryCount >= this.config.api.retryAttempts) {
      return false
    }

    // Only retry on network errors or 5xx errors
    if (!error.response) return true
    if (error.response.status >= 500 && error.response.status < 600) return true

    return false
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as any

    config.__retryCount = config.__retryCount || 0
    config.__retryCount += 1

    // Calculate delay with exponential backoff
    const delay = this.config.api.retryDelay * Math.pow(2, config.__retryCount - 1)

    console.log(`🔄 Retrying request (attempt ${config.__retryCount}/${this.config.api.retryAttempts}) after ${delay}ms`)

    await new Promise(resolve => setTimeout(resolve, delay))

    return this.axiosInstance.request(config)
  }

  /**
   * Build pétala-specific URL
   */
  private buildPetalaUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    // If path already includes petala base, use as-is
    if (cleanPath.startsWith(this.petalaBasePath.slice(1))) {
      return `/${cleanPath}`
    }

    // Otherwise, prepend petala base path
    return `${this.petalaBasePath}/${cleanPath}`
  }

  /**
   * Generic request method
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config)
    return response.data
  }

  /**
   * GET request
   */
  async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const url = this.buildPetalaUrl(path)
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const url = this.buildPetalaUrl(path)
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const url = this.buildPetalaUrl(path)
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const url = this.buildPetalaUrl(path)
    const response = await this.axiosInstance.patch<T>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const url = this.buildPetalaUrl(path)
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  /**
   * Get raw axios instance (for advanced use cases)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }

  /**
   * Get current config
   */
  getConfig(): RuntimeConfig {
    return this.config
  }
}

/**
 * Create Universal API Client (async)
 */
export async function createUniversalApiClient(): Promise<UniversalApiClient> {
  const config = await getRuntimeConfig()
  return new UniversalApiClient(config)
}

/**
 * Singleton instance
 */
let _apiClientInstance: UniversalApiClient | null = null

/**
 * Get Universal API Client (async, creates singleton)
 */
export async function getApiClient(): Promise<UniversalApiClient> {
  if (!_apiClientInstance) {
    _apiClientInstance = await createUniversalApiClient()
  }
  return _apiClientInstance
}

/**
 * Get Universal API Client (sync, throws if not initialized)
 */
export function getApiClientSync(): UniversalApiClient {
  if (!_apiClientInstance) {
    // Try to create sync if config is available
    try {
      const config = getRuntimeConfigSync()
      _apiClientInstance = new UniversalApiClient(config)
    } catch (e) {
      throw new Error('API Client not initialized. Call getApiClient() first.')
    }
  }
  return _apiClientInstance
}

/**
 * Reset API client (useful for testing)
 */
export function resetApiClient(): void {
  _apiClientInstance = null
}

export default getApiClient
