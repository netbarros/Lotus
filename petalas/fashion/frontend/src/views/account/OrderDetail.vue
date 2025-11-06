<template>
  <div class="order-detail-page">
    <div class="mb-6">
      <router-link to="/account/orders" class="text-primary-600 hover:text-primary-700 inline-flex items-center">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Orders
      </router-link>
    </div>

    <div class="card p-6 mb-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">Order #ORD-2025-123456</h2>
          <p class="text-gray-600">Placed on January 6, 2025</p>
        </div>
        <span class="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">Paid</span>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-6">
        <div>
          <h3 class="font-semibold mb-2">Shipping Address</h3>
          <p class="text-gray-700 text-sm">
            John Doe<br />
            123 Main St<br />
            New York, NY 10001<br />
            United States
          </p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Payment Method</h3>
          <p class="text-gray-700 text-sm">Credit Card ending in 4242</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Order Summary</h3>
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal:</span>
              <span>$99.00</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping:</span>
              <span>$5.99</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tax:</span>
              <span>$10.49</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total:</span>
              <span>$115.48</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="font-semibold mb-4">Order Items</h3>
        <div class="space-y-4">
          <div v-for="i in 2" :key="i" class="flex gap-4">
            <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div class="flex-1">
              <h4 class="font-semibold">Product {{ i }}</h4>
              <p class="text-sm text-gray-600">Quantity: 1</p>
              <p class="text-primary-600 font-semibold mt-1">$99.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <button class="btn btn-secondary">Request Refund</button>
      <button class="btn btn-primary">Track Shipment</button>
    </div>
  </div>
</template>
