<template>
  <div class="orders-page">
    <div class="card">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold">Order History</h2>
      </div>

      <div v-if="orders.length === 0" class="p-12 text-center">
        <p class="text-gray-600 mb-4">No orders yet</p>
        <router-link to="/products" class="btn btn-primary">Start Shopping</router-link>
      </div>

      <div v-else class="divide-y">
        <div v-for="order in orders" :key="order.id" class="p-6 hover:bg-gray-50 transition-colors">
          <div class="flex justify-between items-start mb-4">
            <div>
              <router-link :to="`/account/orders/${order.id}`" class="text-lg font-semibold hover:text-primary-600">
                Order #{{ order.order_number }}
              </router-link>
              <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
            </div>
            <span :class="getStatusClass(order.status.payment)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ order.status.payment }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Items:</span>
              <span class="font-medium ml-2">{{ order.items_count }}</span>
            </div>
            <div>
              <span class="text-gray-600">Total:</span>
              <span class="font-medium ml-2">${{ order.totals.total }}</span>
            </div>
            <div>
              <span class="text-gray-600">Payment:</span>
              <span class="font-medium ml-2">{{ order.status.payment }}</span>
            </div>
            <div>
              <span class="text-gray-600">Fulfillment:</span>
              <span class="font-medium ml-2">{{ order.status.fulfillment }}</span>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <router-link :to="`/account/orders/${order.id}`" class="btn btn-secondary text-sm">
              View Details
            </router-link>
            <button v-if="order.status.payment === 'paid'" class="btn btn-secondary text-sm">
              Track Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '@/types'

const orders = ref<Order[]>([])

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStatusClass(status: string) {
  const classes = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}
</script>
