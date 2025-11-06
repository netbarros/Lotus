# Pétala Fashion - Frontend

Vue 3 + TypeScript + Vite + Tailwind CSS + Metronic 9

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** Vue Router 4
- **State Management:** Pinia
- **Styling:** Tailwind CSS + Metronic 9 SCSS
- **HTTP Client:** Axios
- **Form Validation:** VeeValidate + Zod
- **Charts:** ApexCharts
- **Testing:** Vitest + Playwright

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, styles)
├── components/      # Reusable components
├── composables/     # Vue composables (hooks)
├── layouts/         # Layout components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── types/           # TypeScript types
├── utils/           # Utility functions
├── views/           # Page components
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## License

Proprietary - Copyright © 2025 Software Lotus
