<template>
  <!--
    🌸 UNIVERSAL PRODUCTS LIST COMPONENT

    This component works for ALL pétalas without any changes!
    - Fashion: Shows clothes
    - Restaurant: Shows menu items
    - Healthcare: Shows services
    - Retail: Shows products

    The only difference is the DATA returned by the API,
    not the component code!
  -->
  <div class="products-list">
    <!-- Header with pétala name -->
    <div class="header">
      <h1>{{ petalaName }} {{ itemTypeName }}</h1>
      <p class="subtitle">Powered by MagicSaaS System-∞</p>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="`Search ${itemTypeName.toLowerCase()}...`"
        @input="debouncedSearch"
      >
    </div>

    <!-- Loading State -->
    <div v-if="productsState.loading.value" class="loading-state">
      <div class="spinner"></div>
      <p>Loading {{ itemTypeName.toLowerCase() }}...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="productsState.error.value" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load {{ itemTypeName.toLowerCase() }}</h3>
      <p>{{ productsState.error.value.message }}</p>
      <button @click="loadProducts" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Success State -->
    <div v-else-if="productsState.data.value" class="products-grid">
      <div
        v-for="product in productsState.data.value.data || productsState.data.value"
        :key="product.id"
        class="product-card"
        @click="viewProduct(product.id)"
      >
        <!-- Image -->
        <div class="product-image">
          <img
            :src="getImageUrl(product)"
            :alt="product.name"
            @error="handleImageError"
          >
        </div>

        <!-- Content -->
        <div class="product-content">
          <h3 class="product-name">{{ product.name }}</h3>
          <p v-if="product.description" class="product-description">
            {{ truncate(product.description, 100) }}
          </p>

          <!-- Price (for e-commerce pétalas) -->
          <div v-if="product.price" class="product-price">
            <span class="price">{{ formatCurrency(product.price) }}</span>
            <span v-if="product.compare_price" class="compare-price">
              {{ formatCurrency(product.compare_price) }}
            </span>
          </div>

          <!-- Rating (if available) -->
          <div v-if="product.rating" class="product-rating">
            <span class="stars">{{ renderStars(product.rating) }}</span>
            <span class="rating-text">({{ product.rating }}/5)</span>
          </div>

          <!-- Actions -->
          <div class="product-actions">
            <button
              v-if="hasCart"
              @click.stop="addToCart(product.id)"
              class="btn-primary"
            >
              {{ cartButtonText }}
            </button>
            <button
              v-if="hasAppointments"
              @click.stop="bookAppointment(product.id)"
              class="btn-secondary"
            >
              {{ appointmentButtonText }}
            </button>
            <button @click.stop="viewProduct(product.id)" class="btn-outline">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No {{ itemTypeName.toLowerCase() }} found</h3>
      <p>Try adjusting your search or filters</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUniversalApi } from '@/shared/composables/useUniversalApi'
import { useMagicSaaS } from '@/shared/plugins/magicsaas-plugin'

/**
 * Get MagicSaaS configuration
 */
const magicsaas = useMagicSaaS()
const router = useRouter()

/**
 * Get Universal API
 */
const api = useUniversalApi()
await api.initialize()

/**
 * Reactive state
 */
const searchQuery = ref('')
const productsState = ref(null)

/**
 * Computed: Pétala-aware labels
 */
const petalaName = computed(() => magicsaas.config.petala.name)

const itemTypeName = computed(() => {
  const typeMap = {
    fashion: 'Products',
    restaurant: 'Menu Items',
    healthcare: 'Services',
    travel: 'Packages',
    academy: 'Courses',
    retail: 'Products',
    realestate: 'Properties',
    education: 'Courses',
    fitness: 'Classes',
    hospitality: 'Rooms',
    financial: 'Services',
    legal: 'Services',
    manufacturing: 'Products',
    logistics: 'Services'
  }

  return typeMap[magicsaas.config.petala.type] || 'Items'
})

const cartButtonText = computed(() => {
  const textMap = {
    fashion: 'Add to Cart',
    restaurant: 'Add to Order',
    retail: 'Add to Cart'
  }

  return textMap[magicsaas.config.petala.type] || 'Add'
})

const appointmentButtonText = computed(() => {
  const textMap = {
    restaurant: 'Reserve Table',
    healthcare: 'Book Appointment',
    fitness: 'Book Class',
    hospitality: 'Book Room'
  }

  return textMap[magicsaas.config.petala.type] || 'Book'
})

/**
 * Check if pétala has cart
 */
const hasCart = computed(() => {
  return ['fashion', 'restaurant', 'retail'].includes(magicsaas.config.petala.type)
})

/**
 * Check if pétala has appointments
 */
const hasAppointments = computed(() => {
  return ['restaurant', 'healthcare', 'fitness', 'hospitality'].includes(magicsaas.config.petala.type)
})

/**
 * Load products
 */
async function loadProducts() {
  productsState.value = await api.products.list({
    limit: 20,
    status: 'published',
    search: searchQuery.value || undefined
  })
}

/**
 * Search with debounce
 */
let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 300)
}

/**
 * Get image URL with fallback
 */
function getImageUrl(product) {
  if (product.image) {
    // If it's a Directus asset
    if (product.image.startsWith('/assets/')) {
      return `${magicsaas.config.directus.assetsUrl}${product.image}`
    }
    return product.image
  }

  // Fallback placeholder
  return `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`
}

/**
 * Handle image load error
 */
function handleImageError(event) {
  event.target.src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image'
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat(magicsaas.config.tenant.locale || 'pt-BR', {
    style: 'currency',
    currency: magicsaas.config.tenant.currency || 'BRL'
  }).format(value)
}

/**
 * Truncate text
 */
function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Render stars
 */
function renderStars(rating) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
}

/**
 * Add to cart
 */
async function addToCart(productId) {
  const { error } = await api.cart.add(productId, 1)

  if (!error.value) {
    // Show success notification
    alert(`Added to ${magicsaas.config.petala.type === 'restaurant' ? 'order' : 'cart'}!`)
  } else {
    alert(`Failed to add: ${error.value.message}`)
  }
}

/**
 * Book appointment
 */
async function bookAppointment(productId) {
  // Navigate to booking page
  router.push({ name: 'booking', params: { id: productId } })
}

/**
 * View product details
 */
function viewProduct(productId) {
  router.push({ name: 'product-details', params: { id: productId } })
}

/**
 * Load on mount
 */
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.products-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 30px;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: #6366f1;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-button {
  margin-top: 20px;
  padding: 10px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 16px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.product-price {
  margin-bottom: 12px;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
}

.compare-price {
  margin-left: 8px;
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  color: #fbbf24;
}

.rating-text {
  font-size: 14px;
  color: #6b7280;
}

.product-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.product-actions button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  background: #10b981;
  color: white;
}

.btn-secondary:hover {
  background: #059669;
}

.btn-outline {
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.btn-outline:hover {
  background: #6366f1;
  color: white;
}
</style>
