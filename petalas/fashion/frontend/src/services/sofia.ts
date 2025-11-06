/**
 * Sofia Service for Pétala Fashion
 * Integrates Sofia AI assistant with Fashion-specific features
 */

import apiClient from './api'
import type {
  SofiaMessage,
  SofiaIntent,
  SofiaResponse,
  SofiaQuickAction,
  FashionSofiaContext
} from '../types/sofia'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default'

export class SofiaService {
  private conversationId: string | null = null
  private context: FashionSofiaContext = {}
  private messageHistory: SofiaMessage[] = []

  /**
   * Initialize Sofia session
   */
  async initialize(userId?: string): Promise<void> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/session', {
        user_id: userId,
        tenant_id: TENANT_ID,
        petala: 'fashion'
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
      const response = await apiClient.post('/petalas/fashion/sofia/message', {
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
   * Classify user intent
   */
  async classifyIntent(message: string): Promise<SofiaIntent> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/intent', {
        message,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Failed to classify intent:', error)
      return {
        intent: 'general_inquiry',
        confidence: 0.5,
        entities: {},
        context: {}
      }
    }
  }

  /**
   * Search products via Sofia
   */
  async searchProducts(query: string, filters?: any): Promise<any[]> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/search', {
        conversation_id: this.conversationId,
        query,
        filters,
        context: this.context
      })

      return response.data.products || []
    } catch (error) {
      console.error('Sofia product search failed:', error)
      return []
    }
  }

  /**
   * Get personalized recommendations from Sofia
   */
  async getRecommendations(type?: string): Promise<any[]> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/recommendations', {
        conversation_id: this.conversationId,
        type,
        context: this.context
      })

      return response.data.recommendations || []
    } catch (error) {
      console.error('Sofia recommendations failed:', error)
      return []
    }
  }

  /**
   * Get outfit suggestions based on item
   */
  async getOutfitSuggestions(productId: string): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/outfits', {
        conversation_id: this.conversationId,
        product_id: productId,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia outfit suggestions failed:', error)
      return { outfits: [] }
    }
  }

  /**
   * Track order via Sofia
   */
  async trackOrder(orderId?: string): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/track', {
        conversation_id: this.conversationId,
        order_id: orderId,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia order tracking failed:', error)
      throw error
    }
  }

  /**
   * Get cart assistance from Sofia
   */
  async getCartAssistance(): Promise<SofiaResponse> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/cart-assist', {
        conversation_id: this.conversationId,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia cart assistance failed:', error)
      throw error
    }
  }

  /**
   * Get checkout guidance from Sofia
   */
  async getCheckoutGuidance(step: string): Promise<SofiaResponse> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/checkout-assist', {
        conversation_id: this.conversationId,
        step,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia checkout guidance failed:', error)
      throw error
    }
  }

  /**
   * Execute action suggested by Sofia
   */
  async executeAction(actionType: string, payload: any): Promise<any> {
    try {
      const response = await apiClient.post('/petalas/fashion/sofia/action', {
        conversation_id: this.conversationId,
        action_type: actionType,
        payload,
        context: this.context
      })

      return response.data
    } catch (error) {
      console.error('Sofia action execution failed:', error)
      throw error
    }
  }

  /**
   * Update context (e.g., when user navigates or performs action)
   */
  updateContext(newContext: Partial<FashionSofiaContext>): void {
    this.context = {
      ...this.context,
      ...newContext,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Get current context
   */
  getContext(): FashionSofiaContext {
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
        await apiClient.delete(`/petalas/fashion/sofia/session/${this.conversationId}`)
      } catch (error) {
        console.error('Failed to clear Sofia conversation:', error)
      }
    }

    this.conversationId = null
    this.context = {}
    this.messageHistory = []
  }

  /**
   * Get Fashion-specific quick actions
   */
  getQuickActions(): SofiaQuickAction[] {
    const baseActions: SofiaQuickAction[] = [
      {
        id: 'search',
        label: 'Buscar produtos',
        icon: '🔍',
        action: 'search_products'
      },
      {
        id: 'recommendations',
        label: 'Ver recomendações',
        icon: '✨',
        action: 'get_recommendations'
      },
      {
        id: 'track',
        label: 'Rastrear pedido',
        icon: '📦',
        action: 'track_order'
      }
    ]

    // Add context-specific actions
    if (this.context.current_view === 'product_detail' && this.context.current_product_id) {
      baseActions.push({
        id: 'outfit',
        label: 'Ver looks',
        icon: '👗',
        action: 'get_outfit_suggestions'
      })
    }

    if (this.context.cart_items && this.context.cart_items.length > 0) {
      baseActions.push({
        id: 'cart_assist',
        label: 'Ajuda com carrinho',
        icon: '🛒',
        action: 'cart_assistance'
      })
    }

    return baseActions
  }

  /**
   * Get Fashion-specific suggestions based on context
   */
  getSuggestions(): string[] {
    const suggestions: string[] = []

    // Context-based suggestions
    if (this.context.current_view === 'home') {
      suggestions.push(
        'Mostre novidades',
        'O que está em promoção?',
        'Recomende algo para mim'
      )
    } else if (this.context.current_view === 'catalog') {
      suggestions.push(
        'Filtrar por preço',
        'Mostrar vestidos',
        'Ver promoções'
      )
    } else if (this.context.current_view === 'product_detail') {
      suggestions.push(
        'Adicionar ao carrinho',
        'Ver tamanhos disponíveis',
        'Sugerir looks'
      )
    } else if (this.context.current_view === 'cart') {
      suggestions.push(
        'Aplicar cupom',
        'Calcular frete',
        'Finalizar compra'
      )
    } else if (this.context.current_view === 'account') {
      suggestions.push(
        'Ver meus pedidos',
        'Rastrear entrega',
        'Atualizar dados'
      )
    }

    return suggestions
  }
}

// Export singleton instance
export const sofiaService = new SofiaService()

// Export default
export default sofiaService
