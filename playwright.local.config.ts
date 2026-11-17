import { defineConfig, devices } from '@playwright/test';

// DoD da Etapa 6.5 contra o stack REAL local (fiapx-infra/local + auth + video-api + processor + notification),
// com o Vite já rodando (`npm run dev`). Não roda no CI. Veja o README, "Fluxo ponta a ponta local".
export default defineConfig({
  testDir: './e2e-local',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    acceptDownloads: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
