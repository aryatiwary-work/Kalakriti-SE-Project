import { defineConfig } from '@playwright/test'

// End-to-end tests run against the full Docker Compose stack
// (React on :5173 -> FastAPI on :8000 -> PostgreSQL).
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 860 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
})
