<template>
  <div class="loyalty-page">
    <div class="card p-6 mb-6">
      <h2 class="text-2xl font-bold mb-6">Loyalty Program</h2>

      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="text-center p-6 bg-primary-50 rounded-lg">
          <div class="text-4xl font-bold text-primary-600 mb-2">1,250</div>
          <div class="text-gray-600">Points Balance</div>
          <div class="text-sm text-gray-500 mt-2">Worth $12.50</div>
        </div>

        <div class="text-center p-6 bg-gray-50 rounded-lg">
          <div class="text-4xl font-bold text-gray-700 mb-2">Gold</div>
          <div class="text-gray-600">Current Tier</div>
          <div class="text-sm text-gray-500 mt-2">10% discount on all orders</div>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="font-semibold mb-4">Progress to Platinum</h3>
        <div class="relative">
          <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-primary-600" style="width: 60%"></div>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>$1,500 spent</span>
            <span>$5,000 goal</span>
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-2">Spend $3,500 more to reach Platinum tier (15% discount + exclusive perks)</p>
      </div>

      <div class="border-t pt-6">
        <h3 class="font-semibold mb-4">Loyalty Tiers</h3>
        <div class="space-y-4">
          <div v-for="tier in tiers" :key="tier.name" class="flex items-center gap-4 p-4 border rounded-lg">
            <div class="w-16 h-16 rounded-full flex items-center justify-center font-bold" :style="{ backgroundColor: tier.color }">
              {{ tier.name[0] }}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold">{{ tier.name }}</h4>
              <p class="text-sm text-gray-600">{{ tier.description }}</p>
            </div>
            <div class="text-right">
              <div class="font-semibold text-primary-600">{{ tier.discount }}% Off</div>
              <div class="text-sm text-gray-600">{{ tier.threshold }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <h3 class="font-semibold mb-4">Recent Activity</h3>
      <div class="space-y-3">
        <div v-for="i in 5" :key="i" class="flex justify-between items-center">
          <div>
            <p class="font-medium">Points Earned</p>
            <p class="text-sm text-gray-600">Order #ORD-2025-{{ i }}</p>
          </div>
          <div class="text-green-600 font-semibold">+100 pts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tiers = [
  { name: 'Bronze', description: 'Spend $0 - $500', discount: 0, threshold: '$0+', color: '#CD7F32' },
  { name: 'Silver', description: 'Spend $500 - $1,500', discount: 5, threshold: '$500+', color: '#C0C0C0' },
  { name: 'Gold', description: 'Spend $1,500 - $5,000', discount: 10, threshold: '$1,500+', color: '#FFD700' },
  { name: 'Platinum', description: 'Spend $5,000+', discount: 15, threshold: '$5,000+', color: '#E5E4E2' }
]
</script>
