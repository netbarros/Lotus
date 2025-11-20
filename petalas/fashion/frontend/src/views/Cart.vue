<template>
  <div class="cart-page">
    <!-- Page Header -->
    <div class="bg-white border-b">
      <div class="container-custom py-6">
        <h1 class="text-3xl font-bold mb-2">Shopping Cart</h1>
        <div class="text-sm text-gray-600">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span class="mx-2">/</span>
          <span>Cart</span>
        </div>
      </div>
    </div>

    <div class="container-custom py-8">
      <!-- Empty Cart State -->
      <div v-if="isEmpty" class="text-center py-20">
        <div class="text-gray-400 mb-6">
          <svg class="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Start shopping to add items to your cart</p>
        <router-link to="/products" class="btn btn-primary">
          Browse Products
        </router-link>
      </div>

      <!-- Cart with Items -->
      <div v-else class="grid grid-cols-12 gap-8">
        <!-- Cart Items -->
        <div class="col-span-12 lg:col-span-8">
          <div class="card">
            <!-- Cart Header -->
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">
                  Cart Items ({{ itemsCount }})
                </h2>
                <button @click="clearCart" class="text-red-600 hover:text-red-700 text-sm font-medium">
                  Clear Cart
                </button>
              </div>
            </div>

            <!-- Cart Items List -->
            <div class="divide-y">
              <div
                v-for="item in items"
                :key="item.id"
                class="p-6 flex gap-4"
              >
                <!-- Product Image -->
                <div class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  <img
                    v-if="item.product_image"
                    :src="item.product_image"
                    :alt="item.product_name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <!-- Product Info -->
                <div class="flex-1">
                  <router-link
                    :to="`/products/${item.product_slug}`"
                    class="font-semibold hover:text-primary-600 mb-1 block"
                  >
                    {{ item.product_name }}
                  </router-link>
                  <p class="text-sm text-gray-600 mb-2">SKU: {{ item.product_id }}</p>
                  <div class="text-primary-600 font-bold">${{ item.price }}</div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex flex-col items-end gap-4">
                  <button
                    @click="removeItem(item.id)"
                    class="text-gray-400 hover:text-red-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div class="flex items-center border rounded-lg">
                    <button
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="px-3 py-1 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      :value="item.quantity"
                      @input="updateQuantity(item.id, parseInt(($event.target as HTMLInputElement).value))"
                      type="number"
                      min="1"
                      class="w-16 text-center border-x focus:outline-none"
                    />
                    <button
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="px-3 py-1 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div class="font-bold">
                    ${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Continue Shopping -->
          <div class="mt-6">
            <router-link to="/products" class="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </router-link>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-span-12 lg:col-span-4">
          <div class="card p-6 sticky top-8">
            <h2 class="text-xl font-semibold mb-6">Order Summary</h2>

            <!-- Coupon Code -->
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">Coupon Code</label>
              <div class="flex gap-2">
                <input
                  v-model="couponCode"
                  type="text"
                  placeholder="Enter code"
                  class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  @click="applyCoupon"
                  class="btn btn-secondary"
                >
                  Apply
                </button>
              </div>
              <p v-if="couponApplied" class="text-sm text-green-600 mt-2">
                ✓ Coupon applied: {{ couponCode }}
              </p>
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div v-if="discount > 0" class="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${{ discount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>{{ shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}` }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-primary-600">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Checkout Button -->
            <router-link to="/checkout" class="btn btn-primary w-full block text-center">
              Proceed to Checkout
            </router-link>

            <!-- Additional Info -->
            <div class="mt-6 space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Secure checkout</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Easy returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const couponCode = ref('')
const couponApplied = ref(false)
const discount = ref(0)

const items = computed(() => cartStore.items)
const itemsCount = computed(() => cartStore.itemsCount)
const subtotal = computed(() => cartStore.subtotal)
const isEmpty = computed(() => cartStore.isEmpty)

// Calculate shipping (free over $50)
const shipping = computed(() => {
  return subtotal.value >= 50 ? 0 : 5.99
})

// Calculate tax (10%)
const tax = computed(() => {
  return (subtotal.value - discount.value) * 0.10
})

// Calculate total
const total = computed(() => {
  return subtotal.value - discount.value + shipping.value + tax.value
})

async function updateQuantity(itemId: string, quantity: number) {
  await cartStore.updateQuantity(itemId, quantity)
}

async function removeItem(itemId: string) {
  if (confirm('Remove this item from cart?')) {
    await cartStore.removeItem(itemId)
  }
}

async function clearCart() {
  if (confirm('Clear all items from cart?')) {
    await cartStore.clearCart()
    couponCode.value = ''
    couponApplied.value = false
    discount.value = 0
  }
}

function applyCoupon() {
  if (couponCode.value) {
    // Validate coupon via API
    // For now, mock 10% discount
    discount.value = subtotal.value * 0.10
    couponApplied.value = true
  }
}
</script>
