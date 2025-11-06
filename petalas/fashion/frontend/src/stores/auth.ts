import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  // Actions
  function initializeAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      // API call would go here
      // const response = await api.auth.login({ email, password })

      // Mock response
      const mockToken = 'mock_jwt_token'
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'customer'
      }

      token.value = mockToken
      user.value = mockUser

      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      return { success: true }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  async function register(data: { name: string; email: string; password: string }) {
    loading.value = true
    try {
      // API call would go here
      return { success: true }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    initializeAuth,
    login,
    logout,
    register
  }
})
