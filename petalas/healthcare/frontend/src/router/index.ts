import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue') },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('../views/Appointments.vue'),
    },
    {
      path: '/medical-records',
      name: 'records',
      component: () => import('../views/MedicalRecords.vue'),
    },
    {
      path: '/prescriptions',
      name: 'prescriptions',
      component: () => import('../views/Prescriptions.vue'),
    },
    { path: '/account', name: 'account', component: () => import('../views/Account.vue') },
  ],
});

export default router;
