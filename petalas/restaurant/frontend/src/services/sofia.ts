/**
 * Sofia Service for Pétala Restaurant
 * Integrates Sofia AI assistant with Restaurant-specific features
 */

import apiClient from './api'
import type {
  SofiaMessage,
  SofiaIntent,
  SofiaResponse,
  SofiaQuickAction,
  RestaurantSofiaContext
} from '../types/sofia'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default'

export class SofiaService {
  private conversationId: string | null = null
  private context: RestaurantSofiaContext = {}
  private messageHistory: SofiaMessage[] = []

  /**
   * Initialize Sofia session
   */
  async initialize(userId?: string): Promise<void> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/session', {
        user_id: userId,
        tenant_id: TENANT_ID,
        petala: 'restaurant'
      })

      this.conversationId = response.data.conversation_id
      this.context = response.data.context || {}
    } catch (error) {
      console.error('Failed to initialize Sofia session:', error)
      throw error
    }
  }

  /**
   * Send message to Sofia
   */
  async sendMessage(message: string): Promise<SofiaResponse> {
    if (!this.conversationId) {
      await this.initialize()
    }

    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/message', {
        conversation_id: this.conversationId,
        message,
        context: this.context
      })

      // Update context with response
      if (response.data.context) {
        this.context = {
          ...this.context,
          ...response.data.context
        }
      }

      // Add to message history
      this.messageHistory.push({
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      })

      this.messageHistory.push({
        id: response.data.message_id,
        role: 'sofia',
        content: response.data.message,
        timestamp: new Date(),
        actions: response.data.actions,
        suggestions: response.data.suggestions
      })

      return response.data
    } catch (error) {
      console.error('Failed to send message to Sofia:', error)
      throw error
    }
  }

  /**
   * Make a reservation via Sofia
   */
  async makeReservation(details?: {
    date?: string
    time?: string
    party_size?: number
    special_requests?: string
  }): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/reservation', {
        conversation_id: this.conversationId,
        details,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia reservation failed:', error)
      throw error
    }
  }

  /**
   * Get menu recommendations from Sofia
   */
  async getMenuRecommendations(preferences?: {
    dietary_restrictions?: string[]
    cuisine_preference?: string
    price_range?: { min: number; max: number }
  }): Promise<any[]> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/menu-recommendations', {
        conversation_id: this.conversationId,
        preferences,
        context: this.context
      })

      return response.data.recommendations || []
    } catch (error) {
      console.error('Sofia menu recommendations failed:', error)
      return []
    }
  }

  /**
   * Place an order via Sofia
   */
  async placeOrder(orderType: 'dine-in' | 'takeout' | 'delivery'): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/order', {
        conversation_id: this.conversationId,
        order_type: orderType,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia order placement failed:', error)
      throw error
    }
  }

  /**
   * Check table availability via Sofia
   */
  async checkTableAvailability(date: string, time: string, partySize: number): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/table-availability', {
        conversation_id: this.conversationId,
        date,
        time,
        party_size: partySize,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia table availability check failed:', error)
      throw error
    }
  }

  /**
   * Get chef recommendations
   */
  async getChefRecommendations(): Promise<any[]> {
    try {
      const response = await apiClient.post('/petalas/restaurant/sofia/chef-recommendations', {
        conversation_id: this.conversationId,
        context: this.context
      })

      return response.data.recommendations || []
    } catch (error) {
      console.error('Sofia chef recommendations failed:', error)
      return []
    }
  }

  /**
   * Update context
   */
  updateContext(newContext: Partial<RestaurantSofiaContext>): void {
    this.context = {
      ...this.context,
      ...newContext,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Get current context
   */
  getContext(): RestaurantSofiaContext {
    return this.context
  }

  /**
   * Get message history
   */
  getMessageHistory(): SofiaMessage[] {
    return this.messageHistory
  }

  /**
   * Clear conversation
   */
  async clearConversation(): Promise<void> {
    if (this.conversationId) {
      try {
        await apiClient.delete(`/petalas/restaurant/sofia/session/${this.conversationId}`)
      } catch (error) {
        console.error('Failed to clear Sofia conversation:', error)
      }
    }

    this.conversationId = null
    this.context = {}
    this.messageHistory = []
  }

  /**
   * Get Restaurant-specific quick actions
   */
  getQuickActions(): SofiaQuickAction[] {
    const baseActions: SofiaQuickAction[] = [
      {
        id: 'reservation',
        label: 'Fazer reserva',
        icon: '📅',
        action: 'make_reservation'
      },
      {
        id: 'menu',
        label: 'Ver cardápio',
        icon: '📖',
        action: 'view_menu'
      },
      {
        id: 'order',
        label: 'Fazer pedido',
        icon: '🍽️',
        action: 'place_order'
      }
    ]

    // Add context-specific actions
    if (this.context.current_view === 'menu') {
      baseActions.push({
        id: 'recommendations',
        label: 'Recomendações',
        icon: '⭐',
        action: 'get_recommendations'
      })
    }

    if (this.context.has_reservation) {
      baseActions.push({
        id: 'modify_reservation',
        label: 'Modificar reserva',
        icon: '✏️',
        action: 'modify_reservation'
      })
    }

    return baseActions
  }

  /**
   * Get Restaurant-specific suggestions based on context
   */
  getSuggestions(): string[] {
    const suggestions: string[] = []

    if (this.context.current_view === 'home') {
      suggestions.push(
        'Fazer uma reserva',
        'Ver cardápio do dia',
        'Ver promoções'
      )
    } else if (this.context.current_view === 'menu') {
      suggestions.push(
        'Qual é o prato do dia?',
        'Recomendar entrada',
        'Opções vegetarianas'
      )
    } else if (this.context.current_view === 'reservation') {
      suggestions.push(
        'Mesa para 2 pessoas',
        'Horários disponíveis hoje',
        'Mesa perto da janela'
      )
    } else if (this.context.has_order) {
      suggestions.push(
        'Status do pedido',
        'Tempo de espera',
        'Adicionar mais itens'
      )
    }

    return suggestions
  }
}

// Export singleton instance
export const sofiaService = new SofiaService()

// Export default
export default sofiaService
