<!--
  Sofia Avatar Component
  Universal animated avatar that adapts to context and state
-->

<template>
  <div
    class="sofia-avatar"
    :class="[
      `sofia-avatar--${size}`,
      `sofia-avatar--${status}`,
      { 'sofia-avatar--animated': animated }
    ]"
  >
    <!-- Main Avatar Circle -->
    <div class="sofia-avatar__circle">
      <!-- Animated Gradient Background -->
      <div class="sofia-avatar__gradient" />

      <!-- Petala-specific Icon/Image -->
      <div class="sofia-avatar__content">
        <svg
          v-if="!customImage"
          viewBox="0 0 24 24"
          class="sofia-avatar__icon"
        >
          <!-- Sofia's signature sparkle icon -->
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>

        <img
          v-else
          :src="customImage"
          :alt="`Sofia - ${petala} assistant`"
          class="sofia-avatar__image"
        />
      </div>

      <!-- Pulse Animation Rings -->
      <div v-if="status === 'thinking' || status === 'listening'" class="sofia-avatar__pulse">
        <div class="sofia-avatar__pulse-ring sofia-avatar__pulse-ring--1" />
        <div class="sofia-avatar__pulse-ring sofia-avatar__pulse-ring--2" />
        <div class="sofia-avatar__pulse-ring sofia-avatar__pulse-ring--3" />
      </div>
    </div>

    <!-- Status Indicator -->
    <div v-if="showStatus" class="sofia-avatar__status-badge">
      <div class="sofia-avatar__status-dot" />
    </div>

    <!-- Tooltip -->
    <div v-if="tooltip" class="sofia-avatar__tooltip">
      {{ tooltip }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  petala: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  status?: 'idle' | 'thinking' | 'listening' | 'speaking' | 'offline'
  animated?: boolean
  showStatus?: boolean
  customImage?: string
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  status: 'idle',
  animated: true,
  showStatus: true
})

// Petala-specific gradient colors
const gradientColors = computed(() => {
  const colorMap: Record<string, { start: string; end: string }> = {
    fashion: { start: '#FF6B9D', end: '#C44569' },
    restaurant: { start: '#FFA726', end: '#FB8C00' },
    healthcare: { start: '#42A5F5', end: '#1E88E5' },
    realestate: { start: '#26A69A', end: '#00897B' },
    education: { start: '#AB47BC', end: '#8E24AA' },
    finance: { start: '#66BB6A', end: '#43A047' },
    travel: { start: '#29B6F6', end: '#039BE5' },
    fitness: { start: '#EF5350', end: '#E53935' },
    automotive: { start: '#78909C', end: '#546E7A' },
    legal: { start: '#8D6E63', end: '#6D4C41' },
    logistics: { start: '#FFB74D', end: '#FB8C00' },
    entertainment: { start: '#BA68C8', end: '#9C27B0' },
    default: { start: '#667EEA', end: '#764BA2' }
  }

  return colorMap[props.petala] || colorMap.default
})
</script>

<style scoped>
.sofia-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Sizes */
.sofia-avatar--small {
  width: 32px;
  height: 32px;
}

.sofia-avatar--medium {
  width: 48px;
  height: 48px;
}

.sofia-avatar--large {
  width: 64px;
  height: 64px;
}

.sofia-avatar--xlarge {
  width: 96px;
  height: 96px;
}

/* Avatar Circle */
.sofia-avatar__circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Gradient Background */
.sofia-avatar__gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    v-bind('gradientColors.start') 0%,
    v-bind('gradientColors.end') 100%
  );
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

/* Avatar Content */
.sofia-avatar__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  z-index: 1;
}

.sofia-avatar__icon {
  width: 60%;
  height: 60%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.sofia-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Pulse Animation */
.sofia-avatar__pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sofia-avatar__pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid v-bind('gradientColors.start');
  opacity: 0;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.sofia-avatar__pulse-ring--1 {
  animation-delay: 0s;
}

.sofia-avatar__pulse-ring--2 {
  animation-delay: 0.5s;
}

.sofia-avatar__pulse-ring--3 {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* Status Badge */
.sofia-avatar__status-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30%;
  height: 30%;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sofia-avatar__status-dot {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: #4CAF50;
}

.sofia-avatar--idle .sofia-avatar__status-dot {
  background: #4CAF50;
}

.sofia-avatar--thinking .sofia-avatar__status-dot {
  background: #2196F3;
  animation: blink 1s ease-in-out infinite;
}

.sofia-avatar--listening .sofia-avatar__status-dot {
  background: #FF9800;
  animation: blink 0.5s ease-in-out infinite;
}

.sofia-avatar--speaking .sofia-avatar__status-dot {
  background: #9C27B0;
  animation: speak-pulse 0.3s ease-in-out infinite alternate;
}

.sofia-avatar--offline .sofia-avatar__status-dot {
  background: #9E9E9E;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes speak-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.3); }
}

/* Tooltip */
.sofia-avatar__tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.sofia-avatar:hover .sofia-avatar__tooltip {
  opacity: 1;
}

/* Animated State */
.sofia-avatar--animated .sofia-avatar__circle {
  transition: transform 0.3s ease;
}

.sofia-avatar--animated:hover .sofia-avatar__circle {
  transform: scale(1.1);
}
</style>
