/**
 * useSofia Composable for Restaurant
 * Vue 3 composable for integrating Sofia AI assistant
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sofiaService } from '../services/sofia'
import type {
  SofiaMessage,
  SofiaState,
  SofiaResponse,
  RestaurantSofiaContext,
  SofiaEventPayload
} from '../types/sofia'

export function useSofia(userId?: string) {
  const router = useRouter()
  const route = useRoute()

  // State
  const state = ref<SofiaState>({
    initialized: false,
    loading: false,
    listening: false,
    speaking: false,
    error: null,
    messages: [],
    context: {},
    quickActions: [],
    suggestions: []
  })

  // Computed
  const isActive = computed(() => state.value.initialized && !state.value.error)
  const hasMessages = computed(() => state.value.messages.length > 0)
  const lastMessage = computed(() => state.value.messages[state.value.messages.length - 1])

  /**
   * Initialize Sofia
   */
  const initialize = async () => {
    try {
      state.value.loading = true
      state.value.error = null

      await sofiaService.initialize(userId)

      state.value.initialized = true
      state.value.context = sofiaService.getContext()
      state.value.quickActions = sofiaService.getQuickActions()
      state.value.suggestions = sofiaService.getSuggestions()

      // Add welcome message
      state.value.messages.push({
        id: 'welcome',
        role: 'sofia',
        content: 'Olá! Sou a Sofia, sua assistente pessoal do restaurante. Como posso ajudar você hoje?',
        timestamp: new Date(),
        suggestions: state.value.suggestions
      })

      emitEvent('initialized')
    } catch (error: any) {
      console.error('Failed to initialize Sofia:', error)
      state.value.error = error.message || 'Falha ao inicializar Sofia'
      emitEvent('error', { error: state.value.error })
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Send message to Sofia
   */
  const sendMessage = async (message: string): Promise<SofiaResponse | null> => {
    if (!message.trim()) return null

    try {
      state.value.loading = true
      state.value.error = null

      // Add user message to UI immediately
      const userMessage: SofiaMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }
      state.value.messages.push(userMessage)

      emitEvent('message_sent', { message })

      // Send to Sofia
      const response = await sofiaService.sendMessage(message)

      // Add Sofia's response
      const sofiaMessage: SofiaMessage = {
        id: `sofia-${Date.now()}`,
        role: 'sofia',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
        suggestions: response.suggestions
      }
      state.value.messages.push(sofiaMessage)

      // Update state
      state.value.context = sofiaService.getContext()
      state.value.quickActions = sofiaService.getQuickActions()
      state.value.suggestions = response.suggestions || sofiaService.getSuggestions()

      emitEvent('message_received', { response })

      // Execute UI updates if any
      if (response.ui_updates) {
        executeUIUpdates(response.ui_updates)
      }

      return response
    } catch (error: any) {
      console.error('Failed to send message:', error)
      state.value.error = error.message || 'Falha ao enviar mensagem'
      emitEvent('error', { error: state.value.error })
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Make a reservation via Sofia
   */
  const makeReservation = async (details?: any) => {
    try {
      state.value.loading = true
      const result = await sofiaService.makeReservation(details)
      emitEvent('reservation_made', result)
      return result
    } catch (error: any) {
      state.value.error = error.message
      emitEvent('error', { error: state.value.error })
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Place order via Sofia
   */
  const placeOrder = async (orderType: 'dine-in' | 'takeout' | 'delivery') => {
    try {
      state.value.loading = true
      const result = await sofiaService.placeOrder(orderType)
      emitEvent('order_placed', result)
      return result
    } catch (error: any) {
      state.value.error = error.message
      emitEvent('error', { error: state.value.error })
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Get menu recommendations
   */
  const getMenuRecommendations = async (preferences?: any) => {
    try {
      state.value.loading = true
      return await sofiaService.getMenuRecommendations(preferences)
    } catch (error: any) {
      state.value.error = error.message
      return []
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Execute action from Sofia
   */
  const executeAction = async (actionType: string, payload?: any) => {
    try {
      state.value.loading = true
      state.value.error = null

      // Handle specific restaurant actions
      switch (actionType) {
        case 'make_reservation':
          return await makeReservation(payload)

        case 'view_menu':
          router.push('/menu')
          break

        case 'place_order':
          return await placeOrder(payload?.order_type || 'dine-in')

        case 'check_availability':
          if (payload) {
            return await sofiaService.checkTableAvailability(
              payload.date,
              payload.time,
              payload.party_size
            )
          }
          break

        case 'get_recommendations':
          return await getMenuRecommendations(payload)

        default:
          console.log('Unhandled action:', actionType, payload)
      }

      emitEvent('action_executed', { actionType, payload })
    } catch (error: any) {
      console.error('Failed to execute action:', error)
      state.value.error = error.message || 'Falha ao executar ação'
      emitEvent('error', { error: state.value.error })
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Start voice input
   */
  const startListening = () => {
    state.value.listening = true
    emitEvent('listening_started')
  }

  /**
   * Stop voice input
   */
  const stopListening = () => {
    state.value.listening = false
    emitEvent('listening_stopped')
  }

  /**
   * Handle voice transcript
   */
  const handleVoiceTranscript = async (transcript: string) => {
    stopListening()
    await sendMessage(transcript)
  }

  /**
   * Update context when user navigates or performs actions
   */
  const updateContext = (newContext: Partial<RestaurantSofiaContext>) => {
    sofiaService.updateContext(newContext)
    state.value.context = sofiaService.getContext()
    state.value.quickActions = sofiaService.getQuickActions()
    state.value.suggestions = sofiaService.getSuggestions()
  }

  /**
   * Clear conversation
   */
  const clearConversation = async () => {
    await sofiaService.clearConversation()
    state.value.messages = []
    state.value.context = {}
    state.value.suggestions = []
  }

  /**
   * Execute UI updates from Sofia
   */
  const executeUIUpdates = (updates: any[]) => {
    updates.forEach(update => {
      console.log('Executing UI update:', update)
      window.dispatchEvent(new CustomEvent('sofia:ui-update', { detail: update }))
    })
  }

  /**
   * Emit event
   */
  const emitEvent = (event: string, data?: any) => {
    const payload: SofiaEventPayload = {
      event: event as any,
      data,
      timestamp: new Date()
    }

    window.dispatchEvent(new CustomEvent('sofia:event', { detail: payload }))
  }

  /**
   * Track route changes to update context
   */
  watch(() => route.path, (newPath) => {
    if (!state.value.initialized) return

    const viewMap: Record<string, string> = {
      '/': 'home',
      '/menu': 'menu',
      '/reservation': 'reservation',
      '/order': 'order',
      '/account': 'account'
    }

    let currentView = 'other'
    for (const [path, view] of Object.entries(viewMap)) {
      if (newPath.startsWith(path)) {
        currentView = view
        break
      }
    }

    updateContext({
      current_view: currentView,
      last_interaction: new Date().toISOString()
    })
  })

  // Initialize on mount
  onMounted(() => {
    initialize()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    // Clean up if needed
  })

  return {
    // State
    state,
    isActive,
    hasMessages,
    lastMessage,

    // Methods
    initialize,
    sendMessage,
    makeReservation,
    placeOrder,
    getMenuRecommendations,
    executeAction,
    startListening,
    stopListening,
    handleVoiceTranscript,
    updateContext,
    clearConversation
  }
}

export default useSofia
