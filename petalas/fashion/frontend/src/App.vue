<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth on app mount
  authStore.initializeAuth()
})
</script>

<style lang="scss">
// Global styles will be imported in main.ts
</style>
