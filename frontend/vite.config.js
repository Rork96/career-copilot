import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['cv.wealthifai.xyz'], // Додаємо твій домен сюди
    host: true,
    port: 5173
  }
})
