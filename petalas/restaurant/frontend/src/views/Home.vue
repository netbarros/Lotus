<template>
  <div class="home">
    <h1>Restaurant Home</h1>
    <SofiaChat v-if="sofiaEnabled" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SofiaChat from '@/../../shared/sofia/components/SofiaChat.vue'

const sofiaEnabled = ref(true)
</script>
