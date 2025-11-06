<template>
  <div class="product-detail">
    <!-- Breadcrumb -->
    <div class="bg-white border-b">
      <div class="container-custom py-4">
        <div class="text-sm text-gray-600">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span class="mx-2">/</span>
          <router-link to="/products" class="hover:text-primary-600">Products</router-link>
          <span class="mx-2">/</span>
          <span>{{ product?.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="container-custom py-12">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <div v-else-if="product" class="container-custom py-8">
      <div class="grid grid-cols-12 gap-8">
        <!-- Product Images -->
        <div class="col-span-12 lg:col-span-6">
          <div class="sticky top-8">
            <!-- Main Image -->
            <div class="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
              <img
                v-if="product.featured_image"
                :src="product.featured_image"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Thumbnail Gallery -->
            <div class="grid grid-cols-4 gap-2">
              <div v-for="i in 4" :key="i" class="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-75"></div>
            </div>

            <!-- AR Try-On Button -->
            <button
              v-if="product.ar_enabled"
              class="w-full mt-4 btn btn-secondary flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Try with AR
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-span-12 lg:col-span-6">
          <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="flex items-center gap-2 mb-4">
              <div class="flex text-yellow-400">
                <span v-for="i in 5" :key="i">⭐</span>
              </div>
              <span class="text-sm text-gray-600">
                {{ product.reviews_average?.toFixed(1) || '0.0' }} ({{ product.reviews_count }} reviews)
              </span>
            </div>

            <!-- Price -->
            <div class="mb-6">
              <div class="flex items-baseline gap-3">
                <span class="text-4xl font-bold text-primary-600">${{ product.price }}</span>
                <span v-if="product.compare_at_price" class="text-xl text-gray-400 line-through">
                  ${{ product.compare_at_price }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <p class="text-gray-700">{{ product.short_description || product.description }}</p>
            </div>

            <!-- SKU & Stock -->
            <div class="flex gap-6 mb-6 text-sm">
              <div>
                <span class="text-gray-600">SKU:</span>
                <span class="font-medium ml-2">{{ product.sku }}</span>
              </div>
              <div>
                <span class="text-gray-600">Availability:</span>
                <span
                  :class="[
                    'font-medium ml-2',
                    product.inventory_quantity > 0 ? 'text-green-600' : 'text-red-600'
                  ]"
                >
                  {{ product.inventory_quantity > 0 ? 'In Stock' : 'Out of Stock' }}
                </span>
              </div>
            </div>

            <!-- Variant Selection (Size, Color, etc.) -->
            <div class="mb-6">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Size</label>
                <div class="flex gap-2">
                  <button
                    v-for="size in ['XS', 'S', 'M', 'L', 'XL']"
                    :key="size"
                    :class="[
                      'px-4 py-2 border rounded-lg',
                      selectedSize === size ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-300 hover:border-gray-400'
                    ]"
                    @click="selectedSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Color</label>
                <div class="flex gap-2">
                  <button
                    v-for="color in ['Black', 'White', 'Blue', 'Red']"
                    :key="color"
                    :class="[
                      'px-4 py-2 border rounded-lg',
                      selectedColor === color ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-300 hover:border-gray-400'
                    ]"
                    @click="selectedColor = color"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Quantity & Add to Cart -->
            <div class="flex gap-4 mb-6">
              <div class="flex items-center border rounded-lg">
                <button
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="px-4 py-3 hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  class="w-16 text-center border-x focus:outline-none"
                />
                <button
                  @click="quantity++"
                  class="px-4 py-3 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                @click="addToCart"
                :disabled="product.inventory_quantity === 0"
                class="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>

            <!-- Additional Info -->
            <div class="border-t pt-6">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span class="text-gray-700">Free shipping on orders over $50</span>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-gray-700">30-day return policy</span>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-gray-700">Secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Tabs -->
      <div class="mt-12">
        <div class="border-b">
          <div class="flex gap-8">
            <button
              v-for="tab in tabs"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'pb-4 font-medium border-b-2 transition-colors',
                activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <div class="py-8">
          <!-- Description Tab -->
          <div v-if="activeTab === 'Description'" class="prose max-w-none">
            <p>{{ product.description }}</p>
          </div>

          <!-- Reviews Tab -->
          <div v-if="activeTab === 'Reviews'">
            <div class="max-w-4xl">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">Customer Reviews</h3>
                <button class="btn btn-primary">Write a Review</button>
              </div>

              <!-- Review Summary -->
              <div class="card p-6 mb-6">
                <div class="flex items-center gap-8">
                  <div class="text-center">
                    <div class="text-5xl font-bold mb-2">{{ product.reviews_average?.toFixed(1) || '0.0' }}</div>
                    <div class="flex text-yellow-400 mb-2">
                      <span v-for="i in 5" :key="i">⭐</span>
                    </div>
                    <div class="text-sm text-gray-600">{{ product.reviews_count }} reviews</div>
                  </div>
                  <div class="flex-1">
                    <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2 mb-1">
                      <span class="text-sm w-8">{{ star }}⭐</span>
                      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-400" :style="{ width: '60%' }"></div>
                      </div>
                      <span class="text-sm text-gray-600 w-12 text-right">60%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Review List -->
              <div class="space-y-6">
                <div v-for="i in 3" :key="i" class="card p-6">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <div class="font-semibold mb-1">John Doe</div>
                      <div class="flex text-yellow-400 text-sm">
                        <span v-for="j in 5" :key="j">⭐</span>
                      </div>
                    </div>
                    <span class="text-sm text-gray-600">2 days ago</span>
                  </div>
                  <p class="text-gray-700">Great product! Exactly as described. Fast shipping and excellent quality.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Tab -->
          <div v-if="activeTab === 'Shipping'">
            <div class="max-w-2xl">
              <h3 class="text-lg font-semibold mb-4">Shipping Information</h3>
              <div class="space-y-4">
                <p>We offer multiple shipping options to meet your needs:</p>
                <ul class="list-disc list-inside space-y-2">
                  <li><strong>Standard Shipping:</strong> 5-7 business days - $5.99</li>
                  <li><strong>Express Shipping:</strong> 2-3 business days - $12.99</li>
                  <li><strong>Next Day Shipping:</strong> 1 business day - $24.99</li>
                </ul>
                <p class="mt-4"><strong>Free shipping</strong> on orders over $50!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="card overflow-hidden hover:shadow-lg transition-shadow">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-4">
              <h3 class="font-semibold mb-2">Related Product {{ i }}</h3>
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-primary-600">$99.00</span>
                <button class="btn btn-primary text-sm">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else class="container-custom py-20 text-center">
      <h2 class="text-2xl font-bold mb-4">Product Not Found</h2>
      <p class="text-gray-600 mb-6">Sorry, we couldn't find the product you're looking for.</p>
      <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const loading = ref(false)
const product = ref<Product | null>(null)
const quantity = ref(1)
const selectedSize = ref('')
const selectedColor = ref('')
const activeTab = ref('Description')
const tabs = ['Description', 'Reviews', 'Shipping']

onMounted(async () => {
  loading.value = true
  const slug = route.params.slug as string
  await productsStore.fetchProductBySlug(slug)
  product.value = productsStore.currentProduct
  loading.value = false
})

async function addToCart() {
  if (product.value) {
    await cartStore.addItem(product.value, quantity.value)
    // Show success toast/notification
    alert('Product added to cart!')
  }
}
</script>
