import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('../views/Menu.vue')
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: () => import('../views/Reservations.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/Orders.vue')
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/Account.vue')
    }
  ]
})

export default router
