# Sofia AI Assistant - Pétala Restaurant Integration 🤖🍽️

## Overview

Sofia is the universal AI persona powering all interactions across the MagicSaaS System-∞. For Pétala Restaurant, Sofia provides intelligent dining assistance, natural language reservations, personalized menu recommendations, and contextual guidance throughout the customer's dining journey.

## Features

### 1. Natural Language Reservations 📅

Sofia understands reservation requests in natural language:

```typescript
// User says: "Mesa para 4 pessoas amanhã às 20h"
// Sofia extracts:
{
  intent: 'make_reservation',
  entities: {
    party_size: 4,
    date: '2025-11-07',
    time: '20:00',
    date_relative: 'tomorrow'
  }
}
```

### 2. Intelligent Menu Recommendations 👨‍🍳

Sofia provides personalized menu suggestions based on:

- Dietary restrictions (vegetarian, vegan, gluten-free)
- Cuisine preferences
- Spice level tolerance
- Allergen information
- Previous orders and favorites
- Chef's specials and seasonal items

### 3. Conversational Dining Assistant 💬

Sofia guides customers through their dining experience:

- **Reservation Making**: "Mesa para 2 pessoas hoje à noite?" → Sofia shows availability
- **Menu Exploration**: "O que vocês recomendam?" → Sofia suggests chef specials
- **Dietary Questions**: "Tem opções vegetarianas?" → Sofia filters menu
- **Order Placement**: "Quero pedir o prato do dia" → Sofia processes order
- **Table Preferences**: "Mesa perto da janela" → Sofia notes preference

### 4. Voice-Enabled Ordering 🎤

Hands-free dining experience:

- Voice reservations
- Voice menu browsing
- Voice order placement
- Voice allergy alerts

### 5. Proactive Table Management 🎯

Sofia helps optimize the dining experience:

- **Checking In**: Greets customers and confirms reservations
- **Wait Time Updates**: Provides real-time table availability
- **Special Occasions**: Asks about celebrations, suggests wine pairings
- **Feedback Collection**: Gathers dining experience feedback

### 6. Order Tracking & Delivery 📦

For takeout and delivery orders:

- Real-time order status
- Estimated preparation time
- Delivery tracking
- Contactless pickup coordination

## Restaurant-Specific Intents

| Intent | Examples | Actions |
|--------|----------|---------|
| `make_reservation` | "Mesa para 4", "Reservar hoje" | Creates reservation with availability check |
| `modify_reservation` | "Mudar para 8 pessoas", "Adiar 1 hora" | Updates existing reservation |
| `cancel_reservation` | "Cancelar reserva", "Desmarcar" | Cancels with confirmation |
| `view_menu` | "Ver cardápio", "O que tem?" | Shows menu with filters |
| `place_order` | "Fazer pedido", "Quero pedir" | Initiates order flow |
| `track_order` | "Cadê meu pedido?", "Quanto tempo falta?" | Shows order status |
| `get_recommendations` | "O que você recomenda?", "Prato do dia?" | Personalized suggestions |
| `check_availability` | "Tem mesa disponível?", "Horários livres?" | Real-time table check |
| `ask_dietary` | "Opções veganas?", "Sem glúten?" | Filters by dietary needs |
| `chef_special` | "Especial do chef", "Prato destaque" | Shows featured dishes |

## Context Tracking

```typescript
interface RestaurantSofiaContext {
  // User info
  customer_name?: string
  customer_phone?: string

  // Current state
  current_view?: 'home' | 'menu' | 'reservation' | 'order'
  has_reservation?: boolean
  has_order?: boolean

  // Preferences
  dietary_restrictions?: ['vegetarian', 'gluten-free']
  spice_level?: 'mild' | 'medium' | 'spicy'
  allergens?: string[]
  favorite_dishes?: string[]

  // Behavior
  visit_frequency?: 'first-time' | 'occasional' | 'regular'
  preferred_table?: 'window' | 'outdoor' | 'private'
}
```

## Implementation

### Frontend Integration

```vue
<template>
  <div class="restaurant-view">
    <!-- Your content -->

    <SofiaFloatingButton
      petala="restaurant"
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
import { computed, onMounted } from 'vue'
import { useSofia } from '@/composables/useSofia'
import SofiaFloatingButton from '@/../../shared/sofia/components/SofiaFloatingButton.vue'

const sofia = useSofia()

const sofiaStatus = computed(() => {
  if (sofia.state.value.listening) return 'listening'
  if (sofia.state.value.loading) return 'thinking'
  return 'idle'
})

onMounted(() => {
  sofia.updateContext({
    current_view: 'home',
    restaurant_id: 'main_location'
  })
})

const handleSofiaMessage = async (message: string) => {
  await sofia.sendMessage(message)
}

const handleSofiaAction = async (action: string) => {
  await sofia.executeAction(action)
}
</script>
```

### Backend Endpoints

Available at `/petalas/restaurant/sofia/*`:

- `POST /session` - Initialize Sofia
- `POST /message` - Send message
- `POST /reservation` - Make/modify reservation
- `POST /menu-recommendations` - Get suggestions
- `POST /order` - Place order
- `POST /table-availability` - Check tables
- `POST /chef-recommendations` - Get specials
- `DELETE /session/:id` - Clear conversation

## Restaurant-Specific Methods

### Make Reservation

```typescript
const reservation = await sofia.makeReservation({
  date: '2025-11-07',
  time: '20:00',
  party_size: 4,
  special_requests: 'Window table, birthday celebration'
})
```

### Get Menu Recommendations

```typescript
const recommendations = await sofia.getMenuRecommendations({
  dietary_restrictions: ['vegetarian'],
  cuisine_preference: 'italian',
  price_range: { min: 0, max: 50 }
})
```

### Place Order

```typescript
const order = await sofia.placeOrder('takeout')
```

### Check Table Availability

```typescript
const availability = await sofia.checkTableAvailability(
  '2025-11-07',
  '20:00',
  4
)
```

## Configuration

```bash
# Environment Variables
ANTHROPIC_API_KEY=sk-ant-...
SOFIA_PERSONALITY=friendly
SOFIA_VOICE_ENABLED=true
SOFIA_PROACTIVE=true
```

## Quick Actions by View

### Home View
- 📅 Fazer reserva
- 📖 Ver cardápio
- 🍽️ Fazer pedido

### Menu View
- ⭐ Ver recomendações
- 👨‍🍳 Especial do chef
- 🌱 Opções vegetarianas

### Reservation View
- 🕐 Ver horários disponíveis
- 📍 Escolher localização
- ✏️ Modificar reserva

### Order View
- 📦 Rastrear pedido
- ➕ Adicionar mais itens
- 💰 Ver conta

## Analytics

Sofia tracks for Restaurant:

- Reservations made via Sofia
- Orders placed via Sofia
- Most requested dietary filters
- Popular menu items asked about
- Average time to reservation
- Conversion rate (inquiry → reservation)

## Example Conversations

**Making a Reservation:**
```
User: "Preciso de uma mesa para jantar"
Sofia: "Com certeza! Para quantas pessoas e que dia você prefere?"
User: "4 pessoas, amanhã às 20h"
Sofia: "Perfeito! Temos mesas disponíveis. Prefere alguma localização específica?"
User: "Perto da janela se possível"
Sofia: "Ótimo! Reserva confirmada para 4 pessoas amanhã às 20h, mesa próxima à janela. Posso anotar alguma observação especial?"
```

**Menu Recommendations:**
```
User: "O que você recomenda para vegetarianos?"
Sofia: "Temos opções deliciosas! Nosso Risoto de Funghi é um dos favoritos, e hoje temos um Prato Especial do Chef com legumes da estação. Quer saber mais sobre algum?"
User: "Me fala mais sobre o especial"
Sofia: "O especial de hoje é um Medalhão de Berinjela grelhada com molho de tomate confit e manjericão fresco, acompanhado de quinoa e vegetais assados. R$ 45. Quer fazer o pedido?"
```

## Roadmap

- [ ] Multi-language support (pt-BR, en-US, es-ES)
- [ ] Wine pairing suggestions
- [ ] Nutrition information on demand
- [ ] Allergy alerts and ingredient lists
- [ ] Photo menu with visual recognition
- [ ] Kitchen live status updates
- [ ] Chef chat feature for special requests

---

**Sofia** - Your intelligent dining companion 🌸🍽️
