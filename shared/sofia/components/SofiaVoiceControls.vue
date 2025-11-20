<!--
  Sofia Voice Controls Component
  Universal voice input/output controls with visualization
-->

<template>
  <div class="sofia-voice-controls" :class="{ 'sofia-voice-controls--active': isListening }">
    <!-- Voice Input Button -->
    <button
      class="sofia-voice-controls__button"
      :class="{ 'sofia-voice-controls__button--recording': isListening }"
      :disabled="disabled"
      @click="toggleVoice"
      :title="isListening ? 'Stop listening' : 'Start voice input'"
    >
      <!-- Microphone Icon -->
      <svg
        v-if="!isListening"
        viewBox="0 0 24 24"
        class="sofia-voice-controls__icon"
      >
        <path
          d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
          fill="currentColor"
        />
        <path
          d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
          fill="currentColor"
        />
      </svg>

      <!-- Stop Icon -->
      <svg
        v-else
        viewBox="0 0 24 24"
        class="sofia-voice-controls__icon"
      >
        <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
      </svg>

      <!-- Pulse Animation -->
      <div v-if="isListening" class="sofia-voice-controls__pulse" />
    </button>

    <!-- Voice Visualization -->
    <div v-if="isListening" class="sofia-voice-controls__visualizer">
      <div
        v-for="i in 20"
        :key="i"
        class="sofia-voice-controls__bar"
        :style="{ animationDelay: `${i * 0.05}s` }"
      />
    </div>

    <!-- Status Text -->
    <div v-if="statusText" class="sofia-voice-controls__status">
      {{ statusText }}
    </div>

    <!-- Transcript Preview -->
    <div v-if="transcript && showTranscript" class="sofia-voice-controls__transcript">
      <div class="sofia-voice-controls__transcript-label">Você disse:</div>
      <div class="sofia-voice-controls__transcript-text">{{ transcript }}</div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="sofia-voice-controls__error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  disabled?: boolean
  showTranscript?: boolean
  autoSend?: boolean
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showTranscript: true,
  autoSend: true,
  language: 'pt-BR'
})

const emit = defineEmits<{
  (e: 'transcript', transcript: string): void
  (e: 'start'): void
  (e: 'stop'): void
  (e: 'error', error: string): void
}>()

// State
const isListening = ref(false)
const transcript = ref('')
const error = ref('')
const recognition = ref<any>(null)

// Status text
const statusText = computed(() => {
  if (error.value) return ''
  if (isListening.value) return 'Ouvindo...'
  return ''
})

// Initialize speech recognition
onMounted(() => {
  try {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      error.value = 'Seu navegador não suporta reconhecimento de voz'
      return
    }

    recognition.value = new SpeechRecognition()
    recognition.value.continuous = false
    recognition.value.interimResults = true
    recognition.value.lang = props.language

    // Event handlers
    recognition.value.onstart = () => {
      isListening.value = true
      error.value = ''
      transcript.value = ''
      emit('start')
    }

    recognition.value.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart
        } else {
          interimTranscript += transcriptPart
        }
      }

      transcript.value = finalTranscript || interimTranscript

      // Emit final transcript
      if (finalTranscript && props.autoSend) {
        emit('transcript', finalTranscript)
      }
    }

    recognition.value.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)

      const errorMessages: Record<string, string> = {
        'no-speech': 'Nenhuma fala detectada. Tente novamente.',
        'audio-capture': 'Microfone não encontrado. Verifique suas permissões.',
        'not-allowed': 'Permissão de microfone negada.',
        'network': 'Erro de rede. Verifique sua conexão.',
        'aborted': 'Reconhecimento de voz cancelado.'
      }

      error.value = errorMessages[event.error] || 'Erro ao processar áudio'
      emit('error', error.value)
      isListening.value = false
    }

    recognition.value.onend = () => {
      isListening.value = false
      emit('stop')
    }

  } catch (err) {
    console.error('Failed to initialize speech recognition:', err)
    error.value = 'Falha ao inicializar reconhecimento de voz'
  }
})

// Cleanup
onUnmounted(() => {
  if (recognition.value && isListening.value) {
    recognition.value.stop()
  }
})

// Toggle voice input
const toggleVoice = () => {
  if (!recognition.value) {
    error.value = 'Reconhecimento de voz não disponível'
    return
  }

  if (isListening.value) {
    recognition.value.stop()
  } else {
    try {
      recognition.value.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      error.value = 'Erro ao iniciar reconhecimento de voz'
    }
  }
}

// Expose methods
defineExpose({
  toggleVoice,
  stop: () => recognition.value?.stop(),
  start: () => recognition.value?.start()
})
</script>

<style scoped>
.sofia-voice-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Voice Button */
.sofia-voice-controls__button {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.sofia-voice-controls__button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.sofia-voice-controls__button:active:not(:disabled) {
  transform: scale(0.95);
}

.sofia-voice-controls__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sofia-voice-controls__button--recording {
  background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
  animation: recording-pulse 1.5s ease-in-out infinite;
}

@keyframes recording-pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(239, 83, 80, 0.6);
  }
}

.sofia-voice-controls__icon {
  width: 24px;
  height: 24px;
}

/* Pulse Effect */
.sofia-voice-controls__pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid rgba(239, 83, 80, 0.6);
  animation: pulse-expand 1.5s ease-out infinite;
}

@keyframes pulse-expand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Voice Visualizer */
.sofia-voice-controls__visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 40px;
  padding: 0 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
}

.sofia-voice-controls__bar {
  width: 3px;
  height: 10px;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  border-radius: 2px;
  animation: voice-bar 0.8s ease-in-out infinite alternate;
}

@keyframes voice-bar {
  0% {
    height: 10px;
  }
  100% {
    height: 30px;
  }
}

/* Status Text */
.sofia-voice-controls__status {
  font-size: 14px;
  color: #667EEA;
  font-weight: 500;
}

/* Transcript Preview */
.sofia-voice-controls__transcript {
  max-width: 300px;
  padding: 12px;
  background: #F5F5F5;
  border-radius: 8px;
  border-left: 3px solid #667EEA;
}

.sofia-voice-controls__transcript-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.sofia-voice-controls__transcript-text {
  font-size: 14px;
  color: #333;
  font-style: italic;
}

/* Error Message */
.sofia-voice-controls__error {
  padding: 8px 12px;
  background: #FFEBEE;
  color: #C62828;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}
</style>
