/**
 * Sofia Integration Template for Fashion Views
 *
 * This file contains reusable code snippets for integrating Sofia
 * into all Fashion frontend views
 */

// ====================
// TEMPLATE: Import statements to add to each view
// ====================

export const sofiaImports = `
import { useSofia } from '@/composables/useSofia'
import SofiaFloatingButton from '@/../../shared/sofia/components/SofiaFloatingButton.vue'
`;

// ====================
// TEMPLATE: Sofia setup code to add to script
// ====================

export const sofiaSetup = `
// Initialize Sofia
const sofia = useSofia()

// Sofia status
const sofiaStatus = computed(() => {
  if (sofia.state.value.listening) return 'listening'
  if (sofia.state.value.loading) return 'thinking'
  return 'idle'
})

// Sofia message handler
const handleSofiaMessage = async (message: string) => {
  await sofia.sendMessage(message)
}

// Sofia action handler
const handleSofiaAction = async (action: string) => {
  await sofia.executeAction(action)
}
`;

// ====================
// TEMPLATE: Sofia component to add before closing div
// ====================

export const sofiaComponent = `
<!-- Sofia AI Assistant -->
<SofiaFloatingButton
  petala="fashion"
  :messages="sofia.state.value.messages"
  :quick-actions="sofia.state.value.quickActions"
  :voice-enabled="true"
  :sofia-status="sofiaStatus"
  @send-message="handleSofiaMessage"
  @action="handleSofiaAction"
/>
`;

// ====================
// VIEW-SPECIFIC CONTEXT UPDATES
// ====================

export const contextUpdates = {
  // ProductCatalog.vue
  catalog: `
sofia.updateContext({
  current_view: 'catalog',
  current_category: route.query.category as string,
  search_history: [...(sofia.state.value.context.search_history || []), route.query.q]
})
`,

  // Cart.vue
  cart: `
const cartStore = useCartStore()
sofia.updateContext({
  current_view: 'cart',
  cart_items: cartStore.items,
  cart_total: cartStore.total
})
`,

  // Checkout.vue
  checkout: `
const cartStore = useCartStore()
sofia.updateContext({
  current_view: 'checkout',
  cart_items: cartStore.items,
  cart_total: cartStore.total,
  purchase_intent: 'high'
})
`,

  // Account.vue
  account: `
const authStore = useAuthStore()
sofia.updateContext({
  current_view: 'account',
  user_id: authStore.user?.id,
  customer_name: authStore.user?.name
})
`,

  // account/Orders.vue
  orders: `
sofia.updateContext({
  current_view: 'account',
  current_section: 'orders'
})
`,

  // account/Profile.vue
  profile: `
sofia.updateContext({
  current_view: 'account',
  current_section: 'profile'
})
`,

  // account/Loyalty.vue
  loyalty: `
sofia.updateContext({
  current_view: 'account',
  current_section: 'loyalty'
})
`,

  // account/OrderDetail.vue
  orderDetail: `
sofia.updateContext({
  current_view: 'account',
  current_section: 'order_detail',
  current_order_id: route.params.id as string
})
`,
};

// ====================
// COMPLETE INTEGRATION GUIDE
// ====================

export const integrationSteps = `
SOFIA INTEGRATION STEPS FOR FASHION VIEWS
==========================================

For each view file, follow these steps:

1. ADD IMPORTS (in <script setup>):
   - Add: import { computed } from 'vue' (if not present)
   - Add Sofia imports: ${sofiaImports}

2. ADD SOFIA SETUP (after existing reactive state):
   ${sofiaSetup}

3. UPDATE onMounted (or create if missing):
   - Add context update call based on view type
   - Use contextUpdates object above for view-specific context

4. ADD SOFIA COMPONENT (before closing </div> of root template):
   ${sofiaComponent}

5. VERIFY:
   - All imports are correct
   - Sofia initializes on mount
   - Context updates properly
   - Component is added to template

==========================================
`;

export default {
  sofiaImports,
  sofiaSetup,
  sofiaComponent,
  contextUpdates,
  integrationSteps,
};
