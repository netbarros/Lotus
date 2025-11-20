<template>
  <div class="product-card card overflow-hidden hover:shadow-lg transition-all duration-300 group">
    <router-link :to="`/products/${product.slug}`">
      <!-- Product Image -->
      <div class="relative aspect-square bg-gray-200 overflow-hidden">
        <img
          v-if="product.featured_image"
          :src="product.featured_image"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <!-- AR Badge -->
        <div
          v-if="product.ar_enabled"
          class="absolute top-2 left-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full"
        >
          AR Try-On
        </div>

        <!-- Out of Stock Badge -->
        <div
          v-if="product.inventory_quantity === 0"
          class="absolute top-2 right-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full"
        >
          Out of Stock
        </div>

        <!-- Quick Actions -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            @click.prevent="handleQuickView"
            class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            Quick View
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <!-- Category -->
        <p v-if="product.category_id" class="text-sm text-gray-600 mb-1">
          {{ getCategoryName(product.category_id) }}
        </p>

        <!-- Product Name -->
        <h3 class="font-semibold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
          {{ product.name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-2">
          <div class="flex text-yellow-400 text-sm">
            <span v-for="i in 5" :key="i">
              {{ i <= Math.round(product.reviews_average || 0) ? '⭐' : '☆' }}
            </span>
          </div>
          <span class="text-xs text-gray-600">
            {{ product.reviews_average?.toFixed(1) || '0.0' }} ({{ product.reviews_count }})
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-xl font-bold text-primary-600">
            ${{ parseFloat(product.price).toFixed(2) }}
          </span>
          <span
            v-if="product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price)"
            class="text-sm text-gray-400 line-through"
          >
            ${{ parseFloat(product.compare_at_price).toFixed(2) }}
          </span>
        </div>

        <!-- Add to Cart Button -->
        <button
          @click.prevent="handleAddToCart"
          :disabled="product.inventory_quantity === 0"
          class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
        </button>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{
  quickView: [product: Product]
}>()

const cartStore = useCartStore()

function getCategoryName(categoryId: string): string {
  // In production, this would fetch from categories store
  return 'Category'
}

async function handleAddToCart() {
  if (props.product.inventory_quantity > 0) {
    await cartStore.addItem(props.product, 1)
    // Show success notification (implement toast/notification system)
    alert('Product added to cart!')
  }
}

function handleQuickView() {
  emit('quickView', props.product)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
