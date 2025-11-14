import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref([]);
  const currentReservation = ref(null);

  async function createReservation(data: any) {
    // API call to create reservation
  }

  async function fetchReservations() {
    // API call to fetch reservations
  }

  return { reservations, currentReservation, createReservation, fetchReservations };
});
