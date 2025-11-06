<template>
  <div class="profile-page">
    <div class="card p-6">
      <h2 class="text-2xl font-bold mb-6">Profile Settings</h2>

      <form @submit.prevent="updateProfile">
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium mb-2">First Name</label>
            <input
              v-model="profile.firstName"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium mb-2">Last Name</label>
            <input
              v-model="profile.lastName"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-2">Email</label>
            <input
              v-model="profile.email"
              type="email"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-2">Phone</label>
            <input
              v-model="profile.phone"
              type="tel"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="mt-6">
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const profile = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

function updateProfile() {
  alert('Profile updated successfully!')
}
</script>
