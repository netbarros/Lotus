# Sofia AI Assistant - Pétala Fashion Integration 🤖✨

## Overview

Sofia is the universal AI persona powering all interactions across the MagicSaaS
System-∞ and all 13 Pétalas. For Pétala Fashion, Sofia provides intelligent
shopping assistance, natural language product search, personalized
recommendations, and contextual guidance throughout the customer journey.

## Architecture

### Universal Components (Shared across all Pétalas)

Located in `/shared/sofia/`:

1. **Core Engine** (`core/SofiaEngine.ts`)
   - Main AI brain powered by Claude (Anthropic)
   - Intent classification and natural language understanding
   - Conversation management and context tracking
   - Personality adaptation system

2. **Cognitive Mesh Integration** (`core/CognitiveMeshIntegration.ts`)
   - Integration with all 11 layers of Cognitive Mesh OS
   - Real-time monitoring and optimization
   - Cross-layer orchestration
   - Auto-healing capabilities

3. **UI Components** (`components/`)
   - `SofiaChat.vue` - Full-featured chat interface
   - `SofiaAvatar.vue` - Animated avatar with status indicators
   - `SofiaVoiceControls.vue` - Voice input/output controls
   - `SofiaFloatingButton.vue` - Floating action button with minimizable chat

### Fashion-Specific Integration

Located in `/petalas/fashion/`:

1. **Frontend Service Layer**
   - `frontend/src/services/sofia.ts` - Sofia service for Fashion
   - `frontend/src/composables/useSofia.ts` - Vue 3 composable
   - `frontend/src/types/sofia.ts` - TypeScript type definitions

2. **Backend Endpoints**
   - `backend/directus/endpoints/sofia.ts` - RESTful API endpoints

## Features

### 1. Natural Language Product Search 🔍

Sofia understands natural language queries and extracts search parameters:

```typescript
// User says: "Show me red dresses under $100"
// Sofia extracts:
{
  intent: 'search_products',
  entities: {
    category: 'dresses',
    color: 'red',
    price_range: { min: 0, max: 100 }
  }
}
```

### 2. Personalized Recommendations ✨

Sofia learns from user behavior and provides tailored suggestions:

- Browsing history analysis
- Style preference detection
- Price range optimization
- Contextual recommendations

### 3. Conversational Shopping Assistant 💬

Sofia guides users through their shopping journey:

- **Product Discovery**: "What's trending?" → Sofia shows latest arrivals
- **Product Details**: "Tell me about this dress" → Sofia explains features
- **Size Guidance**: "What size should I get?" → Sofia provides size
  recommendations
- **Cart Assistance**: "Do I qualify for free shipping?" → Sofia calculates and
  advises
- **Order Tracking**: "Where's my order?" → Sofia provides tracking info

### 4. Voice Shopping 🎤

Hands-free shopping experience with voice commands:

- Voice product search
- Voice-activated navigation
- Spoken product descriptions
- Voice order tracking

### 5. Proactive Assistance 🎯

Sofia proactively helps based on context:

- **On Home Page**: Suggests new arrivals, promotions
- **On Product Page**: Recommends complementary items, outfit ideas
- **In Cart**: Reminds about free shipping threshold, suggests coupons
- **At Checkout**: Guides through steps, answers payment questions

### 6. AR Try-On Integration 👗

Sofia seamlessly integrates with AR try-on:

- "Try this dress with AR" → Launches AR experience
- "Show me how it looks" → Activates virtual try-on
- Suggests best items for AR experience

## Implementation Guide

### Frontend Integration

#### 1. Add Sofia to a View

```vue
<template>
  <div class="my-view">
    <!-- Your view content -->

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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSofia } from '@/composables/useSofia';
import SofiaFloatingButton from '@/../../shared/sofia/components/SofiaFloatingButton.vue';

// Initialize Sofia
const sofia = useSofia();

// Sofia status
const sofiaStatus = computed(() => {
  if (sofia.state.value.listening) return 'listening';
  if (sofia.state.value.loading) return 'thinking';
  return 'idle';
});

// Update context on mount
onMounted(() => {
  sofia.updateContext({
    current_view: 'product_catalog',
    // ... other context
  });
});

// Message handler
const handleSofiaMessage = async (message: string) => {
  await sofia.sendMessage(message);
};

// Action handler
const handleSofiaAction = async (action: string) => {
  await sofia.executeAction(action);
};
</script>
```

#### 2. Update Context

```typescript
// When user views a product
sofia.updateContext({
  current_view: 'product_detail',
  current_product_id: product.id,
  current_category: product.category_id,
});

// When user adds to cart
sofia.updateContext({
  cart_items: cartStore.items,
  cart_total: cartStore.total,
});

// When user navigates
sofia.updateContext({
  current_view: 'checkout',
  purchase_intent: 'high',
});
```

### Backend Integration

Sofia endpoints are automatically available at `/petalas/fashion/sofia/*`:

- `POST /session` - Initialize Sofia session
- `POST /message` - Send message to Sofia
- `POST /search` - Natural language product search
- `POST /recommendations` - Get personalized recommendations
- `POST /outfits` - Get outfit suggestions
- `POST /track` - Track orders
- `POST /cart-assist` - Get cart assistance
- `POST /checkout-assist` - Get checkout guidance
- `POST /action` - Execute Sofia actions
- `DELETE /session/:id` - Clear conversation

## Fashion-Specific Intents

Sofia recognizes these Fashion intents:

| Intent                   | Examples                                    | Actions                       |
| ------------------------ | ------------------------------------------- | ----------------------------- |
| `search_products`        | "Show me dresses", "Find red shoes"         | Search with extracted filters |
| `add_to_cart`            | "Add to cart", "I want this"                | Add current product to cart   |
| `get_recommendations`    | "Recommend something", "What should I buy?" | Show personalized products    |
| `track_order`            | "Where's my order?", "Track #123456"        | Show order status             |
| `get_outfit_suggestions` | "What goes with this?", "Complete the look" | Show complementary items      |
| `apply_coupon`           | "Apply code SAVE20", "Use my coupon"        | Apply discount code           |
| `calculate_shipping`     | "How much is shipping?", "Delivery cost?"   | Calculate shipping            |
| `start_ar_tryon`         | "Try with AR", "Virtual try-on"             | Launch AR experience          |
| `get_size_guide`         | "What's my size?", "Size help"              | Show size guide               |

## Context Tracking

Sofia maintains rich context about user sessions:

```typescript
interface FashionSofiaContext {
  // User info
  user_id?: string;
  customer_name?: string;
  customer_tier?: string;

  // Navigation
  current_view?: string; // 'home' | 'catalog' | 'product_detail' | 'cart' | 'checkout' | 'account'
  current_product_id?: string;
  current_category?: string;

  // Shopping behavior
  cart_items?: any[];
  cart_total?: number;
  viewed_products?: string[];
  search_history?: string[];

  // Preferences
  preferred_style?: string[]; // ['casual', 'formal', 'sporty']
  preferred_sizes?: Record<string, string>;
  preferred_brands?: string[];
  price_range?: { min: number; max: number };

  // Intelligence
  browsing_pattern?: string; // 'explorer' | 'researcher' | 'buyer'
  engagement_level?: 'high' | 'medium' | 'low';
  purchase_intent?: 'high' | 'medium' | 'low';
}
```

## Cognitive Mesh Integration

Sofia integrates with all 11 layers of the Cognitive Mesh OS:

1. **Infrastructure Layer** - Monitors system health, resources
2. **Data Layer** - Accesses databases, cache, storage
3. **Integration Layer** - Connects with external APIs
4. **Business Logic Layer** - Executes business rules
5. **AI/ML Layer** - Powers intelligence and learning
6. **API Layer** - Provides RESTful endpoints
7. **Application Layer** - Integrates with Fashion app
8. **Presentation Layer** - Renders UI components
9. **Experience Layer** - Optimizes user interactions
10. **Intelligence Layer** - Analyzes and predicts
11. **Meta-Orchestration** - Coordinates everything

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
SOFIA_PERSONALITY=friendly        # professional | friendly | casual
SOFIA_VOICE_ENABLED=true
SOFIA_PROACTIVE=true
SOFIA_MAX_CONTEXT_LENGTH=10000
```

### Feature Flags

```typescript
{
  voice: true,              // Enable voice input/output
  chat: true,               // Enable text chat
  recommendations: true,    // Enable AI recommendations
  proactive: true,          // Enable proactive suggestions
  ar_integration: true      // Enable AR try-on integration
}
```

## Performance

- **Response Time**: < 2s for most queries
- **Context Memory**: Last 50 interactions
- **Concurrent Sessions**: Scalable with Redis
- **Cache Strategy**: 15-minute TTL on common queries

## Security

- **API Key Protection**: Server-side only, never exposed
- **User Context Isolation**: Tenant-based segregation
- **PII Handling**: Encrypted in transit and at rest
- **Rate Limiting**: 100 requests/minute per user

## Testing

```bash
# Test Sofia endpoints
curl -X POST http://localhost:8055/petalas/fashion/sofia/session \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test", "user_id": "user123"}'

curl -X POST http://localhost:8055/petalas/fashion/sofia/message \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": "conv_test_user123_123456", "message": "Show me red dresses"}'
```

## Analytics

Sofia tracks:

- Total interactions per session
- Intent classification accuracy
- Response satisfaction scores
- Conversion impact (with/without Sofia)
- Most common intents
- Failed queries for improvement

## Roadmap

- [ ] Multi-language support (pt-BR, en-US, es-ES)
- [ ] Voice synthesis with personality
- [ ] Image-based search ("Find similar to this")
- [ ] Video shopping assistance
- [ ] Social shopping (share with friends)
- [ ] StyleGPT integration (fashion advice)

## Support

For issues or questions about Sofia integration:

1. Check logs: `/var/log/directus/sofia.log`
2. Review context: Use Sofia dev tools
3. Test endpoints: Use provided curl commands
4. Contact: sofia-support@magicsaas.io

---

**Sofia** - Your intelligent shopping companion across all MagicSaaS Pétalas
🌸✨
