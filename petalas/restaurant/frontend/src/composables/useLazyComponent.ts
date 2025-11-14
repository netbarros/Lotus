/**
 * useLazyComponent - Lazy load heavy components on demand
 * Improves initial bundle size and Time to Interactive
 */

import { defineAsyncComponent, ref, onMounted } from 'vue';
import type { Component } from 'vue';

interface LazyComponentOptions {
  loadingComponent?: Component;
  errorComponent?: Component;
  delay?: number;
  timeout?: number;
  suspensible?: boolean;
}

/**
 * Lazy load a component with loading and error states
 *
 * @example
 * const SofiaChat = useLazyComponent(() => import('@shared/sofia/components/SofiaChat.vue'))
 */
export function useLazyComponent(loader: () => Promise<any>, options: LazyComponentOptions = {}) {
  const { delay = 200, timeout = 10000, suspensible = false } = options;

  return defineAsyncComponent({
    loader,
    delay,
    timeout,
    suspensible,

    // Default loading component
    loadingComponent: options.loadingComponent || {
      template: `
        <div class="flex items-center justify-center p-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      `,
    },

    // Default error component
    errorComponent: options.errorComponent || {
      template: `
        <div class="p-4 bg-red-50 text-red-800 rounded-lg">
          <p>Erro ao carregar componente. Por favor, recarregue a página.</p>
        </div>
      `,
    },

    // Handle loading error
    onError(error, retry, fail, attempts) {
      if (attempts <= 3) {
        console.log(`Retrying component load (attempt ${attempts})...`);
        retry();
      } else {
        console.error('Failed to load component after 3 attempts', error);
        fail();
      }
    },
  });
}

/**
 * Preload a component (for better UX on predictable interactions)
 *
 * @example
 * preloadComponent(() => import('@/views/Checkout.vue'))
 */
export function preloadComponent(loader: () => Promise<any>) {
  return loader();
}

/**
 * Composable for intersection observer based lazy loading
 * Load component when element enters viewport
 *
 * @example
 * const { isVisible, observerRef } = useIntersectionObserver()
 * <div ref="observerRef">
 *   <HeavyComponent v-if="isVisible" />
 * </div>
 */
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const isVisible = ref(false);
  const observerRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    if (!observerRef.value) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true;
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element enters viewport
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(observerRef.value);
  });

  return {
    isVisible,
    observerRef,
  };
}

/**
 * Prefetch components on user interaction hints
 * Improves perceived performance
 */
export function usePrefetch() {
  const prefetchOnHover = (loader: () => Promise<any>) => {
    return {
      onMouseenter: () => preloadComponent(loader),
      onFocus: () => preloadComponent(loader),
    };
  };

  const prefetchOnVisible = (loader: () => Promise<any>) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    // Note: Actual implementation would need the chunk URL
    document.head.appendChild(link);
  };

  return {
    prefetchOnHover,
    prefetchOnVisible,
  };
}

/**
 * Lazy load Sofia components (heaviest components)
 */
export const LazySofiaChat = useLazyComponent(
  () => import('@/../../shared/sofia/components/SofiaChat.vue')
);

export const LazySofiaFloatingButton = useLazyComponent(
  () => import('@/../../shared/sofia/components/SofiaFloatingButton.vue')
);

export const LazySofiaAvatar = useLazyComponent(
  () => import('@/../../shared/sofia/components/SofiaAvatar.vue')
);

export const LazySofiaVoiceControls = useLazyComponent(
  () => import('@/../../shared/sofia/components/SofiaVoiceControls.vue')
);

/**
 * Lazy load heavy third-party components
 */
export const LazyARViewer = useLazyComponent(
  () => import('@/components/ARViewer.vue'),
  { timeout: 15000 } // AR viewer may take longer
);

export const LazyImageGallery = useLazyComponent(() => import('@/components/ImageGallery.vue'));

export const LazyProductReviews = useLazyComponent(() => import('@/components/ProductReviews.vue'));
