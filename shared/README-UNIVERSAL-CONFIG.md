# 🌸 MagicSaaS Universal Configuration System

## STATE-OF-THE-ART DYNAMIC CONFIGURATION

**Version:** 3.0.0 **Status:** ✅ Production Ready

---

## 🎯 Core Concept: ZERO CODE CHANGES

This system enables **100% zero code changes** between:

- ✅ Development / Staging / Production environments
- ✅ Different pétalas (Fashion, Restaurant, Healthcare, etc.)
- ✅ Different domains and tenants
- ✅ Different API keys and configurations

**Everything is configured dynamically at runtime!**

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   RUNTIME CONFIGURATION                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. Load /config.json (if available)                    │  │
│  │ 2. Read environment variables (build-time)             │  │
│  │ 3. Auto-detect environment (localhost/staging/prod)    │  │
│  │ 4. Auto-detect pétala (subdomain/path/meta-tag)        │  │
│  │ 5. Build smart defaults                                │  │
│  │ 6. Merge all sources (priority order)                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           UNIVERSAL API CLIENT                          │  │
│  │  • Automatic pétala routing                            │  │
│  │  • Smart retry with exponential backoff                │  │
│  │  • Request/response interceptors                       │  │
│  │  • Auth token management                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          PÉTALA-SPECIFIC APIs                           │  │
│  │  • Products, Cart, Orders                              │  │
│  │  • Appointments, Customers                             │  │
│  │  • Payment, Reviews, Analytics                         │  │
│  │  • Sofia AI                                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           VUE 3 COMPOSABLES & PLUGIN                    │  │
│  │  • useUniversalApi() composable                        │  │
│  │  • $magicsaas global injection                         │  │
│  │  • Auto initialization                                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install the Plugin (main.ts)

```typescript
import { createApp } from 'vue';
import { createMagicSaaSPlugin } from '@/shared/plugins/magicsaas-plugin';
import App from './App.vue';

const app = createApp(App);

// Install MagicSaaS plugin
app.use(
  createMagicSaaSPlugin({
    enableDevTools: true,
    enableErrorTracking: true,
    onInitialized: (magicsaas) => {
      console.log('MagicSaaS ready!', magicsaas.config.petala.name);
    },
  })
);

app.mount('#app');
```

### 2. Use in Components (Options API)

```vue
<template>
  <div>
    <h1>{{ $magicsaas.config.petala.name }}</h1>
    <p>Environment: {{ $magicsaas.config.environment }}</p>
    <p>API: {{ $magicsaas.config.api.baseUrl }}</p>
  </div>
</template>

<script>
export default {
  async mounted() {
    // Access APIs directly
    const products = await this.$magicsaas.apis.products.list();
    console.log(products);
  },
};
</script>
```

### 3. Use in Components (Composition API)

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h2>Products</h2>
      <div v-for="product in data" :key="product.id">
        {{ product.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUniversalApi } from '@/shared/composables/useUniversalApi';

const api = useUniversalApi();

// Initialize
await api.initialize();

// Load products with reactive state
const { data, loading, error } = await api.products.list();

onMounted(() => {
  console.log('Pétala:', api.config.value?.petala.name);
});
</script>
```

---

## 🔧 Configuration Options

### Runtime Config (/config.json)

Deploy this file to your web server's public root:

```json
{
  "petala": {
    "name": "Fashion",
    "type": "fashion",
    "basePath": "/petalas/fashion"
  },
  "api": {
    "baseUrl": "https://api.yourdomain.com",
    "timeout": 30000
  },
  "sofia": {
    "enabled": true,
    "apiUrl": "https://sofia.yourdomain.com"
  },
  "payment": {
    "stripe": {
      "enabled": true,
      "publicKey": "pk_live_..."
    }
  }
}
```

**Priority Order:**

1. Runtime config from `/config.json` (highest)
2. Build-time environment variables (`VITE_*`)
3. Smart auto-detection
4. Default values (lowest)

---

## 🌍 Environment Detection

**Automatic detection based on hostname:**

| Hostname             | Environment   |
| -------------------- | ------------- |
| localhost, 127.0.0.1 | `development` |
| _.staging._, _.stg._ | `staging`     |
| All others           | `production`  |

**Override with meta tag:**

```html
<meta name="magicsaas:environment" content="staging" />
```

---

## 🌺 Pétala Detection

**Automatic detection based on:**

### 1. Subdomain

```
fashion.magicsaas.com      → Fashion pétala
restaurant.magicsaas.com   → Restaurant pétala
health.magicsaas.com       → Healthcare pétala
```

### 2. Path

```
/petalas/fashion/...       → Fashion pétala
/petalas/restaurant/...    → Restaurant pétala
/petalas/healthcare/...    → Healthcare pétala
```

### 3. Custom Domain Mapping

Configure in `/config.json`:

```json
{
  "petala": {
    "type": "fashion",
    "name": "Fashion"
  }
}
```

### 4. Meta Tag

```html
<meta name="magicsaas:petala" content="fashion" />
```

---

## 📡 API Endpoints

All APIs automatically route to correct pétala:

```typescript
// Products API (works for ALL pétalas)
api.products.list()           → GET /petalas/{type}/products
api.products.getById('123')   → GET /petalas/{type}/products/123

// Cart API (e-commerce pétalas)
api.cart.get()                → GET /petalas/{type}/cart
api.cart.add(id, qty)         → POST /petalas/{type}/cart/add

// Appointments API (service pétalas)
api.appointments.list()       → GET /petalas/{type}/appointments
api.appointments.create(...)  → POST /petalas/{type}/appointments

// Sofia AI (all pétalas)
api.sofia.chat(message)       → POST /petalas/{type}/sofia/chat
```

**{type} is automatically detected from configuration!**

---

## 🎨 Available APIs

### Products API

```typescript
const api = useUniversalApi();
await api.initialize();

// List products
const { data } = await api.products.list({ limit: 10 });

// Get by ID
const { data } = await api.products.getById('product-123');

// Search
const { data } = await api.products.search('shoes', { limit: 20 });

// Get featured
const { data } = await api.products.getFeatured();

// Get related
const { data } = await api.products.getRelated('product-123');
```

### Cart API

```typescript
// Get cart
const { data } = await api.cart.get();

// Add to cart
await api.cart.add('product-123', 2, 'variant-456');

// Update quantity
await api.cart.update('item-123', 3);

// Remove item
await api.cart.remove('item-123');

// Clear cart
await api.cart.clear();
```

### Orders API

```typescript
// List orders
const { data } = await api.orders.list({ status: 'pending' })

// Get order
const { data } = await api.orders.getById('order-123')

// Create order
await api.orders.create({ items: [...], address: {...} })

// Cancel order
await api.orders.cancel('order-123', 'Customer request')

// Track order
const { data } = await api.orders.track('order-123')
```

### Appointments API (Restaurant, Healthcare, Services)

```typescript
// List appointments
const { data } = await api.appointments.list({ date: '2025-11-08' });

// Create appointment
await api.appointments.create({
  date: '2025-11-08',
  time: '14:00',
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+5511999999999',
});

// Check availability
const { data } = await api.appointments.checkAvailability({
  date: '2025-11-08',
  time: '14:00',
});

// Get available slots
const { data } = await api.appointments.getAvailableSlots({
  date: '2025-11-08',
});
```

### Sofia AI API

```typescript
// Chat with Sofia
const { data } = await api.sofia.chat('Suggest outfit for summer party');

// Generate by intention
const { data } = await api.sofia.generateIntention(
  'E-commerce for digital products',
  { features: ['cart', 'checkout', 'downloads'] }
);

// Validate UX
const { data } = await api.sofia.validateUX();

// Optimize SEO
const { data } = await api.sofia.optimizeSEO(window.location.href);

// Get recommendations
const { data } = await api.sofia.getRecommendations('products', {
  userId: '123',
});
```

---

## 🔐 Authentication

Authentication is handled automatically:

```typescript
// Login
const { data } = await api.auth.login({
  email: 'user@example.com',
  password: 'password123',
});

// Token is automatically stored
// All subsequent requests include: Authorization: Bearer {token}

// Logout (automatic token removal + redirect)
await api.auth.logout();
```

---

## 🌐 Multi-Tenant Support

Each request automatically includes:

- `X-Tenant-ID`: Tenant identifier
- `X-Petala-Type`: Pétala type
- `X-Petala-Name`: Pétala name
- `X-Environment`: Current environment

Backend can use these headers for:

- Row-level security (RLS)
- Data isolation
- Analytics
- Feature flags

---

## 📊 Error Handling

```typescript
const { data, loading, error, isSuccess, isError } = await api.products.list();

if (isError.value) {
  console.error('Failed to load products:', error.value);
}

if (isSuccess.value) {
  console.log('Products loaded:', data.value);
}
```

**Automatic error handling:**

- ✅ 401 Unauthorized → Auto logout + redirect to login
- ✅ 5xx Server Errors → Auto retry with exponential backoff (3 attempts)
- ✅ Network Errors → Auto retry
- ✅ All errors logged in development mode

---

## 🎭 Example: Complete Component

```vue
<template>
  <div class="products-page">
    <!-- Loading state -->
    <div v-if="productsState.loading.value" class="loading">
      Loading products...
    </div>

    <!-- Error state -->
    <div v-else-if="productsState.error.value" class="error">
      Error: {{ productsState.error.value.message }}
      <button @click="loadProducts">Retry</button>
    </div>

    <!-- Success state -->
    <div v-else-if="productsState.data.value" class="products-grid">
      <div
        v-for="product in productsState.data.value"
        :key="product.id"
        class="product-card"
      >
        <img :src="product.image" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p>{{ formatCurrency(product.price) }}</p>
        <button @click="addToCart(product.id)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUniversalApi } from '@/shared/composables/useUniversalApi';
import { useMagicSaaS } from '@/shared/plugins/magicsaas-plugin';

// Get MagicSaaS instance
const magicsaas = useMagicSaaS();

// Get Universal API
const api = useUniversalApi();
await api.initialize();

// Reactive state
const productsState = ref(null);

// Load products
async function loadProducts() {
  productsState.value = await api.products.list({
    limit: 20,
    status: 'published',
  });
}

// Add to cart
async function addToCart(productId) {
  const { error } = await api.cart.add(productId, 1);

  if (!error.value) {
    alert('Added to cart!');
  }
}

// Format currency based on tenant config
function formatCurrency(value) {
  return new Intl.NumberFormat(magicsaas.config.tenant.locale || 'pt-BR', {
    style: 'currency',
    currency: magicsaas.config.tenant.currency || 'BRL',
  }).format(value);
}

// Load on mount
onMounted(() => {
  loadProducts();
});
</script>
```

---

## 🎯 Deployment Checklist

### Development (localhost)

- ✅ No `/config.json` needed
- ✅ Uses smart defaults
- ✅ API URL: `http://localhost:8055`

### Staging

1. Deploy `/config.json` to web server root:

```json
{
  "environment": "staging",
  "api": {
    "baseUrl": "https://api.staging.yourcompany.com"
  }
}
```

2. Configure subdomain: `*.staging.yourcompany.com`
3. Test all pétalas

### Production

1. Deploy `/config.json` with production values
2. Enable all security features
3. Configure CDN caching for `/config.json` (TTL: 5-10 minutes)
4. Monitor with Sentry/error tracking

---

## 🏆 Benefits

### Zero Code Changes

✅ Same codebase for all environments ✅ Same codebase for all pétalas ✅ Same
codebase for all tenants

### Smart Defaults

✅ Works out-of-the-box on localhost ✅ Auto-detects environment ✅ Auto-detects
pétala

### Type Safety

✅ Full TypeScript support ✅ Autocomplete in IDE ✅ Compile-time checks

### Performance

✅ Smart retry logic ✅ Automatic request caching ✅ Exponential backoff

### Developer Experience

✅ Simple API: `await api.products.list()` ✅ Reactive state:
`const { data, loading, error } = await ...` ✅ Global injection:
`this.$magicsaas`

---

## 📚 Advanced Usage

### Custom API Calls

```typescript
const api = useUniversalApi();
await api.initialize();

// Custom endpoint
const { data } = await api.execute(() =>
  api.getApi('client').get('custom-endpoint')
);
```

### Override Config

```typescript
app.use(
  createMagicSaaSPlugin({
    config: {
      api: {
        baseUrl: 'https://custom-api.com',
      },
    },
  })
);
```

### Multiple Tenants

```typescript
// Tenant is auto-detected from:
// 1. Subdomain
// 2. Custom domain
// 3. /config.json
// 4. Environment variable
```

---

## 🆘 Troubleshooting

### "Runtime config not initialized"

**Solution:** Call `await api.initialize()` before using APIs

### "API Client not initialized"

**Solution:** Install the plugin in main.ts with
`app.use(createMagicSaaSPlugin())`

### 401 Unauthorized

**Solution:** Check if user is logged in, token is valid

### CORS errors

**Solution:** Configure backend to allow your domain in `ALLOWED_ORIGINS`

---

## 🎉 Conclusion

This Universal Configuration System is **STATE-OF-THE-ART** and enables:

✅ **100% code reuse** across environments, pétalas, and tenants ✅ **Zero
configuration** for developers ✅ **Runtime flexibility** for DevOps ✅ **Type
safety** for quality ✅ **Smart defaults** for simplicity

**Deploy once, run anywhere!** 🚀

---

**Version:** 3.0.0 **License:** Proprietary - Software Lotus **Support:**
support@softwarelotus.com.br
