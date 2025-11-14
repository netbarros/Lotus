/**
 * useSofia Composable
 * Vue 3 composable for integrating Sofia AI assistant
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { sofiaService } from '../services/sofia';
import type {
  SofiaMessage,
  SofiaState,
  SofiaResponse,
  FashionSofiaContext,
  SofiaEventPayload,
  FashionIntent,
} from '../types/sofia';

export function useSofia(userId?: string) {
  const router = useRouter();
  const route = useRoute();

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
    suggestions: [],
  });

  // Computed
  const isActive = computed(() => state.value.initialized && !state.value.error);
  const hasMessages = computed(() => state.value.messages.length > 0);
  const lastMessage = computed(() => state.value.messages[state.value.messages.length - 1]);

  /**
   * Initialize Sofia
   */
  const initialize = async () => {
    try {
      state.value.loading = true;
      state.value.error = null;

      await sofiaService.initialize(userId);

      state.value.initialized = true;
      state.value.context = sofiaService.getContext();
      state.value.quickActions = sofiaService.getQuickActions();
      state.value.suggestions = sofiaService.getSuggestions();

      // Add welcome message
      state.value.messages.push({
        id: 'welcome',
        role: 'sofia',
        content: 'Olá! Sou a Sofia, sua assistente pessoal de moda. Como posso ajudar você hoje?',
        timestamp: new Date(),
        suggestions: state.value.suggestions,
      });

      emitEvent('initialized');
    } catch (error: any) {
      console.error('Failed to initialize Sofia:', error);
      state.value.error = error.message || 'Falha ao inicializar Sofia';
      emitEvent('error', { error: state.value.error });
    } finally {
      state.value.loading = false;
    }
  };

  /**
   * Send message to Sofia
   */
  const sendMessage = async (message: string): Promise<SofiaResponse | null> => {
    if (!message.trim()) return null;

    try {
      state.value.loading = true;
      state.value.error = null;

      // Add user message to UI immediately
      const userMessage: SofiaMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      state.value.messages.push(userMessage);

      emitEvent('message_sent', { message });

      // Send to Sofia
      const response = await sofiaService.sendMessage(message);

      // Add Sofia's response
      const sofiaMessage: SofiaMessage = {
        id: `sofia-${Date.now()}`,
        role: 'sofia',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
        suggestions: response.suggestions,
      };
      state.value.messages.push(sofiaMessage);

      // Update state
      state.value.context = sofiaService.getContext();
      state.value.quickActions = sofiaService.getQuickActions();
      state.value.suggestions = response.suggestions || sofiaService.getSuggestions();

      emitEvent('message_received', { response });

      // Execute UI updates if any
      if (response.ui_updates) {
        executeUIUpdates(response.ui_updates);
      }

      return response;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      state.value.error = error.message || 'Falha ao enviar mensagem';
      emitEvent('error', { error: state.value.error });
      return null;
    } finally {
      state.value.loading = false;
    }
  };

  /**
   * Execute action from Sofia
   */
  const executeAction = async (actionType: string, payload?: any) => {
    try {
      state.value.loading = true;
      state.value.error = null;

      const result = await sofiaService.executeAction(actionType, payload);

      emitEvent('action_executed', { actionType, result });

      // Handle specific actions
      switch (actionType) {
        case 'navigate':
          if (result.path) {
            router.push(result.path);
          }
          break;

        case 'add_to_cart':
          // Handled by cart store
          break;

        case 'apply_coupon':
          // Handled by checkout flow
          break;

        case 'search_products':
          router.push({ name: 'catalog', query: { q: result.query } });
          break;

        case 'view_product':
          router.push({ name: 'product-detail', params: { id: result.product_id } });
          break;

        default:
          console.log('Unhandled action:', actionType, result);
      }

      return result;
    } catch (error: any) {
      console.error('Failed to execute action:', error);
      state.value.error = error.message || 'Falha ao executar ação';
      emitEvent('error', { error: state.value.error });
      return null;
    } finally {
      state.value.loading = false;
    }
  };

  /**
   * Start voice input
   */
  const startListening = () => {
    state.value.listening = true;
    emitEvent('listening_started');
  };

  /**
   * Stop voice input
   */
  const stopListening = () => {
    state.value.listening = false;
    emitEvent('listening_stopped');
  };

  /**
   * Handle voice transcript
   */
  const handleVoiceTranscript = async (transcript: string) => {
    stopListening();
    await sendMessage(transcript);
  };

  /**
   * Update context when user navigates or performs actions
   */
  const updateContext = (newContext: Partial<FashionSofiaContext>) => {
    sofiaService.updateContext(newContext);
    state.value.context = sofiaService.getContext();
    state.value.quickActions = sofiaService.getQuickActions();
    state.value.suggestions = sofiaService.getSuggestions();
  };

  /**
   * Clear conversation
   */
  const clearConversation = async () => {
    await sofiaService.clearConversation();
    state.value.messages = [];
    state.value.context = {};
    state.value.suggestions = [];
  };

  /**
   * Execute UI updates from Sofia
   */
  const executeUIUpdates = (updates: any[]) => {
    updates.forEach((update) => {
      console.log('Executing UI update:', update);
      // Emit event for components to handle
      window.dispatchEvent(new CustomEvent('sofia:ui-update', { detail: update }));
    });
  };

  /**
   * Emit event
   */
  const emitEvent = (event: string, data?: any) => {
    const payload: SofiaEventPayload = {
      event: event as any,
      data,
      timestamp: new Date(),
    };

    window.dispatchEvent(new CustomEvent('sofia:event', { detail: payload }));
  };

  /**
   * Track route changes to update context
   */
  watch(
    () => route.path,
    (newPath) => {
      if (!state.value.initialized) return;

      const viewMap: Record<string, string> = {
        '/': 'home',
        '/catalog': 'catalog',
        '/product': 'product_detail',
        '/cart': 'cart',
        '/checkout': 'checkout',
        '/account': 'account',
      };

      let currentView = 'other';
      for (const [path, view] of Object.entries(viewMap)) {
        if (newPath.startsWith(path)) {
          currentView = view;
          break;
        }
      }

      updateContext({
        current_view: currentView,
        last_interaction: new Date().toISOString(),
      });
    }
  );

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    // Clean up if needed
  });

  return {
    // State
    state,
    isActive,
    hasMessages,
    lastMessage,

    // Methods
    initialize,
    sendMessage,
    executeAction,
    startListening,
    stopListening,
    handleVoiceTranscript,
    updateContext,
    clearConversation,
  };
}

export default useSofia;
