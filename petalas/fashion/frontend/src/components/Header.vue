<template>
  <header class="bg-white border-b sticky top-0 z-50">
    <div class="container-custom">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg"></div>
          <span class="text-xl font-bold">Pétala Fashion</span>
        </router-link>

        <!-- Search Bar (Desktop) -->
        <div class="hidden lg:block flex-1 max-w-xl mx-8">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link to="/products" class="hover:text-primary-600 font-medium transition-colors">
            Shop
          </router-link>

          <router-link
            v-if="isAuthenticated"
            to="/account"
            class="hover:text-primary-600 font-medium transition-colors"
          >
            Account
          </router-link>

          <router-link
            v-else
            to="/login"
            class="hover:text-primary-600 font-medium transition-colors"
          >
            Sign In
          </router-link>

          <!-- Cart -->
          <router-link to="/cart" class="relative hover:text-primary-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </router-link>
        </nav>

        <!-- Mobile Menu Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t py-4">
      <div class="container-custom">
        <div class="mb-4">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search products..."
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <nav class="space-y-2">
          <router-link to="/products" class="block py-2 hover:text-primary-600 font-medium">
            Shop
          </router-link>
          <router-link
            v-if="isAuthenticated"
            to="/account"
            class="block py-2 hover:text-primary-600 font-medium"
          >
            Account
          </router-link>
          <router-link
            v-else
            to="/login"
            class="block py-2 hover:text-primary-600 font-medium"
          >
            Sign In
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const cartCount = computed(() => cartStore.itemsCount)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'products', query: { search: searchQuery.value } })
    mobileMenuOpen.value = false
  }
}
</script>
