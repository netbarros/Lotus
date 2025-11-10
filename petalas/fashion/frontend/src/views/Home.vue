<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="container-custom">
        <div class="max-w-3xl">
          <h1 class="text-5xl font-bold mb-6">Welcome to Pétala Fashion</h1>
          <p class="text-xl mb-8 text-primary-100">
            Discover the latest trends in fashion. Shop with confidence using our AR try-on technology.
          </p>
          <div class="flex gap-4">
            <router-link to="/products" class="btn btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Shop Now
            </router-link>
            <button @click="scrollToFeatures" class="btn btn-secondary bg-primary-700 hover:bg-primary-600">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresSection" class="py-16 bg-gray-50">
      <div class="container-custom">
        <h2 class="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card p-6 text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">AR Try-On</h3>
            <p class="text-gray-600">Try products virtually before buying using augmented reality technology.</p>
          </div>

          <div class="card p-6 text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Loyalty Rewards</h3>
            <p class="text-gray-600">Earn points with every purchase and unlock exclusive benefits.</p>
          </div>

          <div class="card p-6 text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fast Shipping</h3>
            <p class="text-gray-600">Get your orders delivered quickly with our express shipping options.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16">
      <div class="container-custom">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold">Featured Products</h2>
          <router-link to="/products" class="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </router-link>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Product cards will be loaded here -->
          <div v-for="i in 4" :key="i" class="card p-4">
            <div class="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <h3 class="font-semibold mb-2">Product {{ i }}</h3>
            <p class="text-gray-600 text-sm mb-2">Category</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-primary-600">$99.00</span>
              <button class="btn btn-primary text-sm">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-600 text-white py-16">
      <div class="container-custom text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Upgrade Your Wardrobe?</h2>
        <p class="text-xl mb-8 text-primary-100">Join thousands of satisfied customers shopping with us.</p>
        <router-link to="/register" class="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8">
          Sign Up Now
        </router-link>
      </div>
    </section>

    <!-- Sofia AI Assistant -->
    <SofiaFloatingButton
      petala="fashion"
      :messages="sofia.state.value.messages"
      :quick-actions="sofia.state.value.quickActions"
      :voice-enabled="true"
      :sofia-status="sofiaStatus"
      @send-message="handleSofiaMessage"
      @action="handleSofiaAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useSofia } from '@/composables/useSofia'
import SofiaFloatingButton from '@/../../shared/sofia/components/SofiaFloatingButton.vue'

const productsStore = useProductsStore()
const loading = ref(false)
const featuresSection = ref<HTMLElement>()

// Initialize Sofia
const sofia = useSofia()

// Sofia status
const sofiaStatus = computed(() => {
  if (sofia.state.value.listening) return 'listening'
  if (sofia.state.value.loading) return 'thinking'
  return 'idle'
})

onMounted(async () => {
  loading.value = true

  // Load featured products
  await productsStore.fetchProducts({ limit: 4 })

  // Update Sofia context
  sofia.updateContext({
    current_view: 'home',
    session_start: new Date().toISOString()
  })

  loading.value = false
})

function scrollToFeatures() {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// Sofia message handler
const handleSofiaMessage = async (message: string) => {
  await sofia.sendMessage(message)
}

// Sofia action handler
const handleSofiaAction = async (action: string) => {
  await sofia.executeAction(action)
}
</script>
