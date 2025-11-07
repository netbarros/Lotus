<template>
  <div class="account">
    <h1>My Account</h1>
    <div class="account-info">
      <!-- Account information -->
    </div>
    <SofiaChat />
  </div>
</template>

<script setup lang="ts">
import SofiaChat from '@/../../shared/sofia/components/SofiaChat.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
