<template>
  <div class="checkout-page">
    <!-- Page Header -->
    <div class="bg-white border-b">
      <div class="container-custom py-6">
        <h1 class="text-3xl font-bold mb-2">Checkout</h1>
        <div class="text-sm text-gray-600">
          <router-link to="/" class="hover:text-primary-600">Home</router-link>
          <span class="mx-2">/</span>
          <router-link to="/cart" class="hover:text-primary-600">Cart</router-link>
          <span class="mx-2">/</span>
          <span>Checkout</span>
        </div>
      </div>
    </div>

    <div class="container-custom py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div
            v-for="(step, index) in steps"
            :key="step"
            class="flex items-center"
          >
            <div class="flex items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  currentStep >= index + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  'ml-2 font-medium',
                  currentStep >= index + 1 ? 'text-primary-600' : 'text-gray-600'
                ]"
              >
                {{ step }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'w-20 h-1 mx-4',
                currentStep > index + 1 ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <!-- Checkout Form -->
        <div class="col-span-12 lg:col-span-8">
          <!-- Step 1: Shipping Information -->
          <div v-if="currentStep === 1" class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-6">Shipping Information</h2>
            <form @submit.prevent="goToStep(2)">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    v-model="shipping.firstName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    v-model="shipping.lastName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium mb-2">Email *</label>
                  <input
                    v-model="shipping.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    v-model="shipping.phone"
                    type="tel"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium mb-2">Address *</label>
                  <input
                    v-model="shipping.address"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">City *</label>
                  <input
                    v-model="shipping.city"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">State *</label>
                  <input
                    v-model="shipping.state"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">ZIP Code *</label>
                  <input
                    v-model="shipping.zipCode"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium mb-2">Country *</label>
                  <select
                    v-model="shipping.country"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="US">United States</option>
                    <option value="BR">Brazil</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end mt-6">
                <button type="submit" class="btn btn-primary">
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Payment Method -->
          <div v-if="currentStep === 2" class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-6">Payment Method</h2>

            <!-- Payment Method Selection -->
            <div class="space-y-4 mb-6">
              <div
                v-for="method in paymentMethods"
                :key="method.id"
                @click="selectedPaymentMethod = method.id"
                :class="[
                  'border rounded-lg p-4 cursor-pointer transition-colors',
                  selectedPaymentMethod === method.id ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <input
                      type="radio"
                      :checked="selectedPaymentMethod === method.id"
                      class="text-primary-600 focus:ring-primary-500"
                    />
                    <span class="font-medium">{{ method.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <img v-for="logo in method.logos" :key="logo" :src="logo" :alt="method.name" class="h-6" />
                  </div>
                </div>
                <p class="text-sm text-gray-600 ml-8 mt-2">{{ method.description }}</p>
              </div>
            </div>

            <!-- Credit Card Form -->
            <form v-if="selectedPaymentMethod === 'credit_card'" @submit.prevent="goToStep(3)" class="mb-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium mb-2">Card Number *</label>
                  <input
                    v-model="payment.cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium mb-2">Cardholder Name *</label>
                  <input
                    v-model="payment.cardName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-medium mb-2">Expiry Date *</label>
                  <input
                    v-model="payment.expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div class="col-span-1">
                  <label class="block text-sm font-medium mb-2">CVV *</label>
                  <input
                    v-model="payment.cvv"
                    type="text"
                    placeholder="123"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </form>

            <div class="flex justify-between mt-6">
              <button @click="goToStep(1)" class="btn btn-secondary">
                Back to Shipping
              </button>
              <button @click="goToStep(3)" class="btn btn-primary">
                Review Order
              </button>
            </div>
          </div>

          <!-- Step 3: Review Order -->
          <div v-if="currentStep === 3" class="card p-6">
            <h2 class="text-xl font-semibold mb-6">Review Your Order</h2>

            <!-- Shipping Address -->
            <div class="mb-6">
              <h3 class="font-semibold mb-2">Shipping Address</h3>
              <div class="text-gray-700">
                <p>{{ shipping.firstName }} {{ shipping.lastName }}</p>
                <p>{{ shipping.address }}</p>
                <p>{{ shipping.city }}, {{ shipping.state }} {{ shipping.zipCode }}</p>
                <p>{{ shipping.country }}</p>
                <p>{{ shipping.email }}</p>
                <p>{{ shipping.phone }}</p>
              </div>
              <button @click="goToStep(1)" class="text-primary-600 hover:text-primary-700 text-sm mt-2">
                Edit
              </button>
            </div>

            <!-- Payment Method -->
            <div class="mb-6">
              <h3 class="font-semibold mb-2">Payment Method</h3>
              <p class="text-gray-700">
                {{ paymentMethods.find(m => m.id === selectedPaymentMethod)?.name }}
              </p>
              <button @click="goToStep(2)" class="text-primary-600 hover:text-primary-700 text-sm mt-2">
                Edit
              </button>
            </div>

            <!-- Order Items -->
            <div class="mb-6">
              <h3 class="font-semibold mb-3">Order Items</h3>
              <div class="space-y-3">
                <div v-for="item in items" :key="item.id" class="flex gap-3 pb-3 border-b">
                  <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div class="flex-1">
                    <p class="font-medium">{{ item.product_name }}</p>
                    <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                  </div>
                  <div class="font-semibold">${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <!-- Terms & Conditions -->
            <div class="mb-6">
              <label class="flex items-start gap-2">
                <input
                  v-model="acceptedTerms"
                  type="checkbox"
                  class="mt-1"
                  required
                />
                <span class="text-sm text-gray-700">
                  I agree to the <a href="#" class="text-primary-600 hover:underline">Terms & Conditions</a> and <a href="#" class="text-primary-600 hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            <div class="flex justify-between">
              <button @click="goToStep(2)" class="btn btn-secondary">
                Back to Payment
              </button>
              <button
                @click="placeOrder"
                :disabled="!acceptedTerms || processing"
                class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ processing ? 'Processing...' : 'Place Order' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="col-span-12 lg:col-span-4">
          <div class="card p-6 sticky top-8">
            <h2 class="text-xl font-semibold mb-4">Order Summary</h2>

            <!-- Order Items -->
            <div class="space-y-3 mb-4">
              <div v-for="item in items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-gray-700">{{ item.product_name }} x{{ item.quantity }}</span>
                <span class="font-medium">${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="border-t pt-4 space-y-3">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const currentStep = ref(1)
const steps = ['Shipping', 'Payment', 'Review']
const processing = ref(false)
const acceptedTerms = ref(false)

const shipping = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US'
})

const payment = ref({
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: ''
})

const selectedPaymentMethod = ref('credit_card')
const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or American Express',
    logos: []
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Secure payment via Stripe',
    logos: []
  },
  {
    id: 'pix',
    name: 'PIX',
    description: 'Instant payment via PIX (Brazil)',
    logos: []
  }
]

const items = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const shipping = computed(() => subtotal.value >= 50 ? 0 : 5.99)
const tax = computed(() => subtotal.value * 0.10)
const total = computed(() => subtotal.value + shipping.value + tax.value)

function goToStep(step: number) {
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function placeOrder() {
  if (!acceptedTerms.value) return

  processing.value = true

  try {
    // Call checkout API endpoint
    // await api.checkout.create({ shipping, payment, items })

    // Clear cart
    await cartStore.clearCart()

    // Redirect to success page
    router.push('/order-success')
  } catch (error) {
    alert('Order failed. Please try again.')
  } finally {
    processing.value = false
  }
}
</script>
