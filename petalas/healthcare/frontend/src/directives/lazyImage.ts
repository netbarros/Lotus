/**
 * v-lazy-image directive
 * Lazy load images when they enter the viewport
 * Improves initial page load and Core Web Vitals (LCP)
 *
 * @example
 * <img v-lazy-image="imageUrl" alt="Product" />
 * <img v-lazy-image="{ src: imageUrl, placeholder: '/placeholder.jpg' }" />
 */

import type { Directive, DirectiveBinding } from 'vue';

interface LazyImageOptions {
  src: string;
  placeholder?: string;
  rootMargin?: string;
  threshold?: number;
}

const imageCache = new Set<string>();

function loadImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

const lazyImageObserver = new Map<HTMLElement, IntersectionObserver>();

export const vLazyImage: Directive = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding<string | LazyImageOptions>) {
    const options: LazyImageOptions =
      typeof binding.value === 'string' ? { src: binding.value } : binding.value;

    const {
      src,
      placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ELoading...%3C/text%3E%3C/svg%3E',
      rootMargin = '50px',
      threshold = 0.01,
    } = options;

    // Set placeholder immediately
    el.src = placeholder;
    el.classList.add('lazy-image');

    // Create intersection observer
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const imgEl = entry.target as HTMLImageElement;

            try {
              // Preload image
              await loadImage(src);

              // Add fade-in transition class
              imgEl.classList.add('lazy-image-loading');

              // Set real image
              imgEl.src = src;

              // Remove loading class after image loads
              imgEl.onload = () => {
                imgEl.classList.remove('lazy-image-loading');
                imgEl.classList.add('lazy-image-loaded');
              };

              // Disconnect observer
              observer.disconnect();
              lazyImageObserver.delete(imgEl);
            } catch (error) {
              console.error('Failed to load image:', src, error);
              imgEl.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23fee" width="400" height="300"/%3E%3Ctext fill="%23c00" x="50%" y="50%" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
            }
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(el);
    lazyImageObserver.set(el, observer);
  },

  updated(el: HTMLImageElement, binding: DirectiveBinding<string | LazyImageOptions>) {
    // Handle dynamic src changes
    const options: LazyImageOptions =
      typeof binding.value === 'string' ? { src: binding.value } : binding.value;

    const { src } = options;

    if (el.src !== src && !el.src.includes('data:image')) {
      // Image already loaded and src changed, update immediately
      el.src = src;
    }
  },

  unmounted(el: HTMLImageElement) {
    // Cleanup observer
    const observer = lazyImageObserver.get(el);
    if (observer) {
      observer.disconnect();
      lazyImageObserver.delete(el);
    }
  },
};

/**
 * v-lazy-background directive
 * Lazy load background images
 *
 * @example
 * <div v-lazy-background="imageUrl" class="hero-section"></div>
 */
export const vLazyBackground: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const src = binding.value;

    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const divEl = entry.target as HTMLElement;

            try {
              await loadImage(src);
              divEl.style.backgroundImage = `url(${src})`;
              divEl.classList.add('lazy-background-loaded');
              observer.disconnect();
            } catch (error) {
              console.error('Failed to load background image:', src, error);
            }
          }
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    lazyImageObserver.set(el, observer);
  },

  unmounted(el: HTMLElement) {
    const observer = lazyImageObserver.get(el);
    if (observer) {
      observer.disconnect();
      lazyImageObserver.delete(el);
    }
  },
};

/**
 * Global styles for lazy loading
 * Add to your main.css or global stylesheet
 */
export const lazyImageStyles = `
.lazy-image {
  background: #f0f0f0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image-loading {
  opacity: 0;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-background-loaded {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
`;
