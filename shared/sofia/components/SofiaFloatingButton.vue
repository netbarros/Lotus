<!--
  Sofia Floating Button Component
  Universal floating action button to trigger Sofia chat from any page
-->

<template>
  <Teleport to="body">
    <div class="sofia-floating">
      <!-- Main Floating Button -->
      <button
        v-show="!chatOpen"
        class="sofia-floating__button"
        :class="{ 'sofia-floating__button--badge': hasUnread }"
        @click="toggleChat"
        :title="`Conversar com Sofia - ${petalaLabel}`"
      >
        <!-- Avatar -->
        <SofiaAvatar
          :petala="petala"
          :status="sofiaStatus"
          size="medium"
          :animated="true"
          :show-status="true"
        />

        <!-- Unread Badge -->
        <div v-if="hasUnread" class="sofia-floating__badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </div>

        <!-- Pulse Animation -->
        <div v-if="pulsating" class="sofia-floating__pulse" />
      </button>

      <!-- Mini Chat Window (when open) -->
      <Transition name="sofia-chat-slide">
        <div
          v-show="chatOpen"
          class="sofia-floating__chat"
          :class="{ 'sofia-floating__chat--minimized': isMinimized }"
        >
          <!-- Chat Header -->
          <div class="sofia-floating__chat-header">
            <div class="sofia-floating__chat-header-left">
              <SofiaAvatar
                :petala="petala"
                :status="sofiaStatus"
                size="small"
                :animated="true"
              />
              <div class="sofia-floating__chat-title">
                <div class="sofia-floating__chat-name">Sofia</div>
                <div class="sofia-floating__chat-subtitle">{{ petalaLabel }}</div>
              </div>
            </div>

            <div class="sofia-floating__chat-actions">
              <button
                class="sofia-floating__chat-action"
                @click="toggleMinimize"
                :title="isMinimized ? 'Expandir' : 'Minimizar'"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    v-if="!isMinimized"
                    d="M19 13H5v-2h14v2z"
                    fill="currentColor"
                  />
                  <path
                    v-else
                    d="M7 14l5-5 5 5z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <button
                class="sofia-floating__chat-action"
                @click="toggleChat"
                title="Fechar"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Chat Content (full chat component) -->
          <div v-show="!isMinimized" class="sofia-floating__chat-content">
            <SofiaChat
              :petala="petala"
              :messages="messages"
              :quick-actions="quickActions"
              :voice-enabled="voiceEnabled"
              :closeable="false"
              @send-message="handleMessage"
              @action="handleAction"
            />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SofiaAvatar from './SofiaAvatar.vue'
import SofiaChat from './SofiaChat.vue'

interface Message {
  id: string
  role: 'user' | 'sofia'
  content: string
  timestamp: Date
}

interface QuickAction {
  id: string
  label: string
  icon?: string
  action: string
}

interface Props {
  petala: string
  messages?: Message[]
  quickActions?: QuickAction[]
  voiceEnabled?: boolean
  hasUnread?: boolean
  unreadCount?: number
  pulsating?: boolean
  sofiaStatus?: 'idle' | 'thinking' | 'listening' | 'speaking' | 'offline'
  initialOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  quickActions: () => [],
  voiceEnabled: true,
  hasUnread: false,
  unreadCount: 0,
  pulsating: false,
  sofiaStatus: 'idle',
  initialOpen: false
})

const emit = defineEmits<{
  (e: 'send-message', message: string): void
  (e: 'action', action: string): void
  (e: 'open'): void
  (e: 'close'): void
}>()

// State
const chatOpen = ref(props.initialOpen)
const isMinimized = ref(false)

// Petala labels
const petalaLabels: Record<string, string> = {
  fashion: 'Assistente de Moda',
  restaurant: 'Assistente de Restaurante',
  healthcare: 'Assistente de Saúde',
  realestate: 'Assistente Imobiliário',
  education: 'Assistente Educacional',
  finance: 'Assistente Financeiro',
  travel: 'Assistente de Viagens',
  fitness: 'Assistente de Fitness',
  automotive: 'Assistente Automotivo',
  legal: 'Assistente Jurídico',
  logistics: 'Assistente de Logística',
  entertainment: 'Assistente de Entretenimento'
}

const petalaLabel = computed(() => {
  return petalaLabels[props.petala] || 'Sua Assistente Virtual'
})

// Toggle chat
const toggleChat = () => {
  chatOpen.value = !chatOpen.value
  isMinimized.value = false

  if (chatOpen.value) {
    emit('open')
  } else {
    emit('close')
  }
}

// Toggle minimize
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

// Handle message
const handleMessage = (message: string) => {
  emit('send-message', message)
}

// Handle action
const handleAction = (action: string) => {
  emit('action', action)
}

// Expose methods
defineExpose({
  open: () => {
    chatOpen.value = true
    isMinimized.value = false
  },
  close: () => {
    chatOpen.value = false
  },
  minimize: () => {
    isMinimized.value = true
  }
})
</script>

<style scoped>
.sofia-floating {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

/* Floating Button */
.sofia-floating__button {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  padding: 8px;
}

.sofia-floating__button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.sofia-floating__button:active {
  transform: scale(0.95);
}

/* Unread Badge */
.sofia-floating__badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #EF5350;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: badge-bounce 0.5s ease;
}

@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Pulse Animation */
.sofia-floating__pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 3px solid #667EEA;
  animation: floating-pulse 2s ease-out infinite;
}

@keyframes floating-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Chat Window */
.sofia-floating__chat {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 600px;
  max-height: calc(100vh - 48px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height 0.3s ease;
}

.sofia-floating__chat--minimized {
  height: 64px;
}

/* Chat Header */
.sofia-floating__chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: white;
  flex-shrink: 0;
}

.sofia-floating__chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sofia-floating__chat-title {
  display: flex;
  flex-direction: column;
}

.sofia-floating__chat-name {
  font-size: 16px;
  font-weight: 600;
}

.sofia-floating__chat-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.sofia-floating__chat-actions {
  display: flex;
  gap: 8px;
}

.sofia-floating__chat-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.sofia-floating__chat-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Chat Content */
.sofia-floating__chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Animations */
.sofia-chat-slide-enter-active,
.sofia-chat-slide-leave-active {
  transition: all 0.3s ease;
}

.sofia-chat-slide-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.sofia-chat-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .sofia-floating {
    bottom: 16px;
    right: 16px;
  }

  .sofia-floating__button {
    width: 56px;
    height: 56px;
  }

  .sofia-floating__chat {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .sofia-floating__chat--minimized {
    bottom: 16px;
    right: 16px;
    left: auto;
    width: 250px;
    height: 64px;
    border-radius: 32px;
  }
}
</style>
