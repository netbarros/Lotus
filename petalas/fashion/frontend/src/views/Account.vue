<template>
  <div class="account-page">
    <div class="bg-white border-b">
      <div class="container-custom py-6">
        <h1 class="text-3xl font-bold">My Account</h1>
      </div>
    </div>

    <div class="container-custom py-8">
      <div class="grid grid-cols-12 gap-8">
        <aside class="col-span-12 lg:col-span-3">
          <div class="card p-4">
            <nav class="space-y-1">
              <router-link
                to="/account/profile"
                class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                active-class="bg-primary-50 text-primary-600"
              >
                Profile
              </router-link>
              <router-link
                to="/account/orders"
                class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                active-class="bg-primary-50 text-primary-600"
              >
                Orders
              </router-link>
              <router-link
                to="/account/loyalty"
                class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                active-class="bg-primary-50 text-primary-600"
              >
                Loyalty Program
              </router-link>
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-red-600 font-medium"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>

        <main class="col-span-12 lg:col-span-9">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>
