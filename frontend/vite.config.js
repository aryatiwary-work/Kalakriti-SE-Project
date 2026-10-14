import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Where the backend runs: localhost on your own machine, "backend" inside Docker.
const backend = process.env.API_PROXY_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Lets a temporary share link (cloudflared tunnel) open the site.
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // The API docs page (/api/docs) loads its schema from here.
      '/openapi.json': { target: backend, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
