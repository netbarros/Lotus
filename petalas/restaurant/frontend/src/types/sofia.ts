/**
 * Sofia AI Assistant Types for Pétala Restaurant
 */

// Message types
export interface SofiaMessage {
  id: string
  role: 'user' | 'sofia'
  content: string
  timestamp: Date
  actions?: SofiaAction[]
  suggestions?: string[]
  attachments?: SofiaAttachment[]
}

// Intent classification
export interface SofiaIntent {
  intent: string
  confidence: number
  entities: Record<string, any>
  context: Record<string, any>
}

// Restaurant-specific intents
export type RestaurantIntent =
  | 'make_reservation'
  | 'modify_reservation'
  | 'cancel_reservation'
  | 'view_menu'
  | 'place_order'
  | 'track_order'
  | 'get_recommendations'
  | 'check_availability'
  | 'ask_dietary'
  | 'chef_special'
  | 'get_directions'
  | 'contact_restaurant'
  | 'general_inquiry'

// Sofia response
export interface SofiaResponse {
  message: string
  intent: SofiaIntent
  actions?: SofiaAction[]
  suggestions?: string[]
  ui_updates?: SofiaUIUpdate[]
  menu_items?: any[]
  tables?: any[]
  context?: Record<string, any>
}

// Action that Sofia can suggest
export interface SofiaAction {
  type: string
  label: string
  icon?: string
  payload: any
  primary?: boolean
}

// Quick action button
export interface SofiaQuickAction {
  id: string
  label: string
  icon?: string
  action: string
}

// UI update instruction from Sofia
export interface SofiaUIUpdate {
  component: string
  action: string
  data: any
}

// Attachment (image, menu item, reservation, etc.)
export interface SofiaAttachment {
  type: 'image' | 'menu_item' | 'reservation' | 'order' | 'link'
  data: any
}

// Restaurant-specific context
export interface RestaurantSofiaContext {
  // User info
  user_id?: string
  customer_name?: string
  customer_phone?: string

  // Current navigation
  current_view?: string
  current_menu_category?: string
  current_restaurant_id?: string

  // Reservation context
  has_reservation?: boolean
  reservation_id?: string
  reservation_date?: string
  reservation_time?: string
  party_size?: number

  // Order context
  has_order?: boolean
  order_id?: string
  order_items?: any[]
  order_total?: number
  order_type?: 'dine-in' | 'takeout' | 'delivery'

  // Preferences
  dietary_restrictions?: string[]    // ['vegetarian', 'gluten-free', 'vegan']
  cuisine_preference?: string[]      // ['italian', 'asian', 'brazilian']
  spice_level?: 'mild' | 'medium' | 'spicy'
  favorite_dishes?: string[]
  allergens?: string[]

  // Session info
  session_start?: string
  last_interaction?: string
  updated_at?: string

  // Behavioral signals
  visit_frequency?: 'first-time' | 'occasional' | 'regular'
  avg_spending?: number
  preferred_table?: string           // 'window', 'outdoor', 'private'
}

// Sofia configuration for Restaurant
export interface RestaurantSofiaConfig {
  tenant_id: string
  restaurant_id?: string
  user_id?: string
  language?: string
  personality?: 'professional' | 'friendly' | 'casual'
  voice_enabled?: boolean
  proactive_suggestions?: boolean
  show_menu_items?: boolean
  enable_reservations?: boolean
}

// Sofia state for Vue composable
export interface SofiaState {
  initialized: boolean
  loading: boolean
  listening: boolean
  speaking: boolean
  error: string | null
  messages: SofiaMessage[]
  context: RestaurantSofiaContext
  quickActions: SofiaQuickAction[]
  suggestions: string[]
}

// Sofia events
export type SofiaEvent =
  | 'initialized'
  | 'message_sent'
  | 'message_received'
  | 'action_executed'
  | 'error'
  | 'listening_started'
  | 'listening_stopped'
  | 'speaking_started'
  | 'speaking_stopped'
  | 'reservation_made'
  | 'order_placed'

// Event payload
export interface SofiaEventPayload {
  event: SofiaEvent
  data?: any
  timestamp: Date
}

// Sofia analytics
export interface SofiaAnalytics {
  total_interactions: number
  successful_intents: number
  failed_intents: number
  average_confidence: number
  top_intents: Array<{ intent: string; count: number }>
  reservations_via_sofia?: number
  orders_via_sofia?: number
  conversion_rate?: number
}
