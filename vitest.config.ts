import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['tests/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}', 'components/**/*.test.{ts,tsx}', 'utils/**/*.test.{ts,tsx}', 'actions/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      'node_modules_trash',
      '.next',
      '.git',
      '.npm_cache',
      '.npm-cache',
      '.npm-local',
      'temp_modules',
      'temp_node_modules',
      '.cache'
    ],
    alias: {
      '@': path.resolve(__dirname, './'),
      // Stub Next.js server-only directive for Vitest
      'server-only': path.resolve(__dirname, './tests/__mocks__/server-only.ts'),
    },
  },
})
