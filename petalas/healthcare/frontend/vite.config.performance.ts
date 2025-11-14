import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

/**
 * Vite Performance Configuration for Pétala Fashion
 * Optimized for production builds with maximum performance
 *
 * Targets:
 * - Bundle size < 200KB (main chunk)
 * - Lighthouse score > 95
 * - Core Web Vitals: All Green
 * - First Contentful Paint < 1.8s
 * - Time to Interactive < 3.9s
 */

export default defineConfig({
  plugins: [
    vue(),

    // Compression - Gzip + Brotli
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    // Image optimization
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),

    // Bundle analyzer
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],

  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // Code splitting strategy
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk - external libraries
          vendor: ['vue', 'vue-router', 'pinia'],

          // UI framework chunk
          ui: ['@headlessui/vue', '@heroicons/vue'],

          // Sofia AI chunk - lazy loaded
          sofia: ['@/services/sofia', '@/composables/useSofia'],

          // Utils chunk
          utils: ['axios', 'dayjs', 'lodash-es'],
        },

        // Dynamic chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/chunks/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB

    // Sourcemap for production debugging (optional)
    sourcemap: false, // Set to true if needed for error tracking

    // CSS code splitting
    cssCodeSplit: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: [
      // Exclude large dependencies to be dynamically imported
      '@/../../shared/sofia/components/SofiaChat.vue',
    ],
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true,
    cors: true,
  },

  // Preview configuration
  preview: {
    port: 4173,
    host: true,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/../../../shared',
    },
  },

  // Performance hints
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
