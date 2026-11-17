/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Desenvolvimento contra o back-end local: o navegador só fala com o Vite (mesma origem, como na AWS, onde o
// API Gateway serve o site e a API). /api/auth/* vai para o fiapx-auth (npm run dev) e o resto de /api para o
// fiapx-video-api. Em produção não há proxy: o API Gateway e o ALB fazem esse papel (ADR-019).
const authUrl = process.env.FIAPX_AUTH_URL ?? 'http://localhost:3001';
const videoApiUrl = process.env.FIAPX_VIDEO_API_URL ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/auth': { target: authUrl, changeOrigin: true },
      '/api': { target: videoApiUrl, changeOrigin: true },
    },
  },
  build: {
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/mocks/browser.ts', 'src/vite-env.d.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
