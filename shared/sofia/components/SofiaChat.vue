<template>
  <div class="sofia-chat" :class="{ 'sofia-chat--fullscreen': fullscreen, 'sofia-chat--minimized': minimized }">
    <!-- Header -->
    <div class="sofia-chat__header">
      <div class="sofia-chat__avatar-container">
        <SofiaAvatar :animating="isThinking" />
      </div>
      <div class="sofia-chat__header-info">
        <h3 class="sofia-chat__title">Sofia</h3>
        <p class="sofia-chat__subtitle">
          {{ getSubtitle() }}
        </p>
      </div>
      <div class="sofia-chat__header-actions">
        <button
          @click="toggleFullscreen"
          class="sofia-chat__action-btn"
          :title="fullscreen ? 'Restaurar' : 'Tela cheia'"
        >
          <svg v-if="!fullscreen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
        <button
          @click="toggleMinimize"
          class="sofia-chat__action-btn"
          title="Minimizar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          v-if="closeable"
          @click="close"
          class="sofia-chat__action-btn sofia-chat__action-btn--close"
          title="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages Area -->
    <div v-if="!minimized" class="sofia-chat__messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="sofia-chat__empty-state">
        <SofiaAvatar :size="80" :animating="false" />
        <h4>Olá! Sou a Sofia 👋</h4>
        <p>{{ getWelcomeMessage() }}</p>

        <!-- Quick Actions -->
        <div v-if="quickActions.length > 0" class="sofia-chat__quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="handleQuickAction(action)"
            class="sofia-chat__quick-action-btn"
          >
            <span v-if="action.icon">{{ action.icon }}</span>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Message List -->
      <div v-for="message in messages" :key="message.id" class="sofia-chat__message-wrapper">
        <div
          class="sofia-chat__message"
          :class="{
            'sofia-chat__message--user': message.role === 'user',
            'sofia-chat__message--sofia': message.role === 'sofia'
          }"
        >
          <div v-if="message.role === 'sofia'" class="sofia-chat__message-avatar">
            <SofiaAvatar :size="32" :animating="false" />
          </div>

          <div class="sofia-chat__message-content">
            <div class="sofia-chat__message-text" v-html="formatMessage(message.content)"></div>

            <!-- Actions attached to message -->
            <div v-if="message.metadata?.actions && message.metadata.actions.length > 0" class="sofia-chat__message-actions">
              <button
                v-for="(action, idx) in message.metadata.actions"
                :key="idx"
                @click="handleAction(action)"
                class="sofia-chat__action-button"
              >
                {{ action.label || action.type }}
              </button>
            </div>

            <!-- Suggestions -->
            <div v-if="message.metadata?.suggestions && message.metadata.suggestions.length > 0 && isLastMessage(message)" class="sofia-chat__suggestions">
              <button
                v-for="(suggestion, idx) in message.metadata.suggestions"
                :key="idx"
                @click="sendMessage(suggestion)"
                class="sofia-chat__suggestion-chip"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <div class="sofia-chat__message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isThinking" class="sofia-chat__message sofia-chat__message--sofia">
        <div class="sofia-chat__message-avatar">
          <SofiaAvatar :size="32" :animating="true" />
        </div>
        <div class="sofia-chat__typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div v-if="!minimized" class="sofia-chat__input-area">
      <div class="sofia-chat__input-wrapper">
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="inputMessage += '\n'"
          placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
          class="sofia-chat__input"
          rows="1"
          ref="inputField"
        ></textarea>

        <div class="sofia-chat__input-actions">
          <!-- Voice Input -->
          <button
            v-if="voiceEnabled"
            @click="toggleVoice"
            class="sofia-chat__input-btn"
            :class="{ 'sofia-chat__input-btn--active': isListening }"
            :title="isListening ? 'Parar de ouvir' : 'Falar com Sofia'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          <!-- Send Button -->
          <button
            @click="handleSend"
            class="sofia-chat__send-btn"
            :disabled="!inputMessage.trim() || isThinking"
            title="Enviar mensagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import SofiaAvatar from './SofiaAvatar.vue'
import type { SofiaMessage } from '../core/SofiaEngine'

// Props
const props = withDefaults(defineProps<{
  petala: string
  messages?: SofiaMessage[]
  quickActions?: Array<{ id: string; label: string; icon?: string; action: string }>
  voiceEnabled?: boolean
  closeable?: boolean
  initialFullscreen?: boolean
}>(), {
  messages: () => [],
  quickActions: () => [],
  voiceEnabled: true,
  closeable: true,
  initialFullscreen: false
})

// Emits
const emit = defineEmits<{
  (e: 'send-message', message: string): void
  (e: 'action', action: any): void
  (e: 'close'): void
  (e: 'voice-start'): void
  (e: 'voice-end', transcript: string): void
}>()

// State
const inputMessage = ref('')
const isThinking = ref(false)
const isListening = ref(false)
const fullscreen = ref(props.initialFullscreen)
const minimized = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputField = ref<HTMLTextAreaElement>()

// Computed
const messages = computed(() => props.messages)

// Methods
const getSubtitle = () => {
  const subtitles: Record<string, string> = {
    fashion: 'Sua assistente de moda pessoal',
    restaurant: 'Sua assistente gastronômica',
    healthcare: 'Sua assistente de saúde',
    'real-estate': 'Sua assistente imobiliária'
  }
  return subtitles[props.petala] || 'Sua assistente inteligente'
}

const getWelcomeMessage = () => {
  const welcomes: Record<string, string> = {
    fashion: 'Como posso ajudar você a encontrar o look perfeito hoje?',
    restaurant: 'Pronto para descobrir seu próximo prato favorito?',
    healthcare: 'Como posso ajudar com sua saúde hoje?',
    'real-estate': 'Vamos encontrar o imóvel ideal para você?'
  }
  return welcomes[props.petala] || 'Como posso ajudar você hoje?'
}

const handleSend = () => {
  if (!inputMessage.value.trim() || isThinking.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  emit('send-message', message)

  // Auto-resize textarea
  if (inputField.value) {
    inputField.value.style.height = 'auto'
  }
}

const handleQuickAction = (action: any) => {
  emit('action', action)
}

const handleAction = (action: any) => {
  emit('action', action)
}

const toggleVoice = () => {
  if (isListening.value) {
    emit('voice-end', '')
    isListening.value = false
  } else {
    emit('voice-start')
    isListening.value = true
  }
}

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
}

const toggleMinimize = () => {
  minimized.value = !minimized.value
}

const close = () => {
  emit('close')
}

const formatMessage = (content: string) => {
  // Simple markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isLastMessage = (message: SofiaMessage) => {
  return messages.value[messages.value.length - 1]?.id === message.id
}

const sendMessage = (text: string) => {
  emit('send-message', text)
}

// Auto-scroll to bottom
watch(() => messages.value.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

// Focus input on mount
onMounted(() => {
  if (inputField.value) {
    inputField.value.focus()
  }
})
</script>

<style scoped>
.sofia-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 80vh;
  width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.sofia-chat--fullscreen {
  width: 100%;
  height: 100%;
  max-height: 100vh;
  border-radius: 0;
}

.sofia-chat--minimized {
  height: 64px;
  overflow: hidden;
}

/* Header */
.sofia-chat__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
}

.sofia-chat__avatar-container {
  flex-shrink: 0;
}

.sofia-chat__header-info {
  flex: 1;
  min-width: 0;
}

.sofia-chat__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sofia-chat__subtitle {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.sofia-chat__header-actions {
  display: flex;
  gap: 8px;
}

.sofia-chat__action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sofia-chat__action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sofia-chat__action-btn--close:hover {
  background: rgba(239, 68, 68, 0.8);
}

/* Messages */
.sofia-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sofia-chat__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  height: 100%;
}

.sofia-chat__empty-state h4 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #1f2937;
}

.sofia-chat__empty-state p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.sofia-chat__quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.sofia-chat__quick-action-btn {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sofia-chat__quick-action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Message */
.sofia-chat__message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  max-width: 85%;
}

.sofia-chat__message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.sofia-chat__message--sofia {
  align-self: flex-start;
}

.sofia-chat__message-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sofia-chat__message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.sofia-chat__message--user .sofia-chat__message-text {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.sofia-chat__message--sofia .sofia-chat__message-text {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.sofia-chat__message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Typing Indicator */
.sofia-chat__typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.sofia-chat__typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.sofia-chat__typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.sofia-chat__typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Suggestions */
.sofia-chat__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sofia-chat__suggestion-chip {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sofia-chat__suggestion-chip:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f9fafb;
}

/* Input Area */
.sofia-chat__input-area {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.sofia-chat__input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.sofia-chat__input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  transition: border-color 0.2s;
}

.sofia-chat__input:focus {
  outline: none;
  border-color: #667eea;
}

.sofia-chat__input-actions {
  display: flex;
  gap: 8px;
}

.sofia-chat__input-btn,
.sofia-chat__send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sofia-chat__input-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.sofia-chat__input-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.sofia-chat__input-btn--active {
  background: #ef4444;
  color: white;
  animation: pulse 1.5s infinite;
}

.sofia-chat__send-btn {
  background: #667eea;
  color: white;
}

.sofia-chat__send-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.sofia-chat__send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
