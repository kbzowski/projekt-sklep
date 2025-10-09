import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Używamy jsdom jako środowiska testowego (symuluje przeglądarkę)
    environment: 'jsdom',

    // Automatycznie importuj testing-library/jest-dom matchers
    setupFiles: ['./src/test/setup.ts'],

    // Globalne API Vitest (describe, it, expect) bez importowania
    globals: true,

    // Pokrycie kodu (coverage)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})