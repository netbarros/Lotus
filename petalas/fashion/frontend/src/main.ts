import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Styles
import './assets/styles/main.scss'

// Create Vue app
const app = createApp(App)

// Pinia store
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// Mount app
app.mount('#app')
