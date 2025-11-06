<template>
  <div class="product-catalog">
    <!-- Page Header -->
    <div class="bg-white border-b">
      <div class="container-custom py-6">
        <h1 class="text-3xl font-bold mb-2">Products</h1>
        <div class="text-sm text-gray-600">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span class="mx-2">/</span>
          <span>Products</span>
        </div>
      </div>
    </div>

    <div class="container-custom py-8">
      <div class="grid grid-cols-12 gap-8">
        <!-- Filters Sidebar -->
        <aside class="col-span-12 lg:col-span-3">
          <div class="card p-6">
            <h2 class="text-lg font-semibold mb-4">Filters</h2>

            <!-- Search -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Search</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                @input="handleSearch"
              />
            </div>

            <!-- Category Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Category</label>
              <select
                v-model="filters.category"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                @change="applyFilters"
              >
                <option value="">All Categories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="accessories">Accessories</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Price Range</label>
              <div class="flex gap-2">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  class="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  @change="applyFilters"
                />
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  class="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  @change="applyFilters"
                />
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Brand</label>
              <select
                v-model="filters.brand"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                @change="applyFilters"
              >
                <option value="">All Brands</option>
                <option value="nike">Nike</option>
                <option value="adidas">Adidas</option>
                <option value="puma">Puma</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <button
              @click="clearFilters"
              class="w-full btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <!-- Products Grid -->
        <main class="col-span-12 lg:col-span-9">
          <!-- Toolbar -->
          <div class="flex justify-between items-center mb-6">
            <div class="text-gray-600">
              Showing {{ products.length }} of {{ total }} products
            </div>
            <div class="flex gap-2">
              <select
                v-model="sortBy"
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                @change="handleSort"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>

              <div class="flex border rounded-lg">
                <button
                  @click="viewMode = 'grid'"
                  :class="['px-3 py-2', viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600']"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="['px-3 py-2', viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600']"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>

          <!-- Products Grid/List -->
          <div v-else-if="products.length > 0" :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'">
            <div v-for="product in products" :key="product.id">
              <!-- Product Card Component will be inserted here -->
              <div class="card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <router-link :to="`/products/${product.slug}`">
                  <div class="aspect-square bg-gray-200"></div>
                  <div class="p-4">
                    <h3 class="font-semibold mb-1 hover:text-primary-600">{{ product.name }}</h3>
                    <p class="text-gray-600 text-sm mb-2">{{ product.category }}</p>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="flex text-yellow-400">
                        <span v-for="i in 5" :key="i">⭐</span>
                      </div>
                      <span class="text-sm text-gray-600">({{ product.reviews_count }})</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="text-xl font-bold text-primary-600">${{ product.price }}</span>
                      </div>
                      <button class="btn btn-primary">Add to Cart</button>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20">
            <div class="text-gray-400 mb-4">
              <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">No products found</h3>
            <p class="text-gray-600 mb-4">Try adjusting your filters</p>
            <button @click="clearFilters" class="btn btn-primary">Clear Filters</button>
          </div>

          <!-- Pagination -->
          <div v-if="products.length > 0" class="flex justify-center mt-8">
            <div class="flex gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="['px-4 py-2 border rounded-lg', page === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-50']"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import type { ProductFilters } from '@/types'

const productsStore = useProductsStore()

const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref('newest')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const perPage = ref(12)

const filters = ref<ProductFilters>({
  category: null,
  minPrice: null,
  maxPrice: null,
  brand: null,
  status: 'active'
})

const products = computed(() => productsStore.products)
const total = computed(() => productsStore.total)
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

onMounted(() => {
  loadProducts()
})

async function loadProducts() {
  loading.value = true
  await productsStore.fetchProducts({
    limit: perPage.value,
    offset: (currentPage.value - 1) * perPage.value
  })
  loading.value = false
}

function handleSearch() {
  currentPage.value = 1
  productsStore.searchProducts(searchQuery.value)
}

function applyFilters() {
  currentPage.value = 1
  productsStore.setFilters(filters.value)
  loadProducts()
}

function clearFilters() {
  searchQuery.value = ''
  filters.value = {
    category: null,
    minPrice: null,
    maxPrice: null,
    brand: null,
    status: 'active'
  }
  productsStore.clearFilters()
  loadProducts()
}

function handleSort() {
  // Sort logic would go here
  loadProducts()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
