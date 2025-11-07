<template>
  <div class="reservations">
    <h1>Make a Reservation</h1>
    <form @submit.prevent="submitReservation">
      <!-- Reservation form fields -->
    </form>
    <SofiaChat />
  </div>
</template>

<script setup lang="ts">
import SofiaChat from '@/../../shared/sofia/components/SofiaChat.vue'
import { useReservationsStore } from '@/stores/reservations'

const reservationsStore = useReservationsStore()

function submitReservation() {
  // Submit logic
}
</script>
