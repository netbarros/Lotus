import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom/vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
delete (window as any).location
window.location = { href: '', reload: vi.fn() } as any

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
})

beforeAll(() => {
  // Setup
})

afterAll(() => {
  // Teardown
})
