/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌐 API SERVICE - Directus Integration                                    ║
 * ║ Complete API client with Directus support                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { APIResponse, APIError, PaginationParams } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<APIError>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // GENERIC CRUD
  // ═════════════════════════════════════════════════════════════════════════

  async get<T>(collection: string, params?: PaginationParams): Promise<APIResponse<T[]>> {
    const response = await this.client.get(`/items/${collection}`, { params });
    return response.data;
  }

  async getOne<T>(collection: string, id: string): Promise<APIResponse<T>> {
    const response = await this.client.get(`/items/${collection}/${id}`);
    return response.data;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<APIResponse<T>> {
    const response = await this.client.post(`/items/${collection}`, data);
    return response.data;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<APIResponse<T>> {
    const response = await this.client.patch(`/items/${collection}/${id}`, data);
    return response.data;
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.client.delete(`/items/${collection}/${id}`);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═════════════════════════════════════════════════════════════════════════

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data.data;
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout', {
      refresh_token: localStorage.getItem('refresh_token'),
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CUSTOM ENDPOINTS
  // ═════════════════════════════════════════════════════════════════════════

  async customEndpoint<T>(method: string, path: string, data?: any): Promise<T> {
    const response = await this.client.request({
      method,
      url: path,
      data,
    });
    return response.data;
  }
}

export const api = new APIClient();
export default api;
