import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([])

  async function fetchAppointments() {
    // API call
  }

  return { appointments, fetchAppointments }
})
