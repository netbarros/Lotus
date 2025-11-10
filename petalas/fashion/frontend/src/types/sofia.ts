/**
 * Sofia AI Assistant Types for Pétala Fashion
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

// Fashion-specific intents
export type FashionIntent =
  | 'search_products'
  | 'add_to_cart'
  | 'get_recommendations'
  | 'track_order'
  | 'get_outfit_suggestions'
  | 'apply_coupon'
  | 'calculate_shipping'
  | 'view_product_details'
  | 'filter_products'
  | 'sort_products'
  | 'start_ar_tryon'
  | 'get_size_guide'
  | 'ask_availability'
  | 'request_return'
  | 'general_inquiry'

// Sofia response
export interface SofiaResponse {
  message: string
  intent: SofiaIntent
  actions?: SofiaAction[]
  suggestions?: string[]
  ui_updates?: SofiaUIUpdate[]
  products?: any[]
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

// Attachment (image, product card, etc.)
export interface SofiaAttachment {
  type: 'image' | 'product' | 'order' | 'link'
  data: any
}

// Fashion-specific context
export interface FashionSofiaContext {
  // User info
  user_id?: string
  customer_name?: string
  customer_tier?: string

  // Current navigation
  current_view?: string
  current_product_id?: string
  current_category?: string

  // Shopping context
  cart_items?: any[]
  cart_total?: number
  viewed_products?: string[]
  search_history?: string[]

  // Preferences
  preferred_style?: string[]
  preferred_sizes?: Record<string, string>
  preferred_brands?: string[]
  price_range?: { min: number; max: number }

  // Session info
  session_start?: string
  last_interaction?: string
  updated_at?: string

  // Behavioral signals
  browsing_pattern?: string
  engagement_level?: 'high' | 'medium' | 'low'
  purchase_intent?: 'high' | 'medium' | 'low'
}

// Sofia configuration for Fashion
export interface FashionSofiaConfig {
  tenant_id: string
  user_id?: string
  language?: string
  personality?: 'professional' | 'friendly' | 'casual'
  voice_enabled?: boolean
  proactive_suggestions?: boolean
  show_product_cards?: boolean
  enable_ar_tryon?: boolean
}

// Sofia state for Vue composable
export interface SofiaState {
  initialized: boolean
  loading: boolean
  listening: boolean
  speaking: boolean
  error: string | null
  messages: SofiaMessage[]
  context: FashionSofiaContext
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
  conversion_impact?: {
    sessions_with_sofia: number
    conversion_rate_with_sofia: number
    conversion_rate_without_sofia: number
  }
}
