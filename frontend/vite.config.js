import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_URL = process.env.RENDER
  ? 'https://disease-llm-app.onrender.com'
  : 'http://localhost:10000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
      },
    },
  },
  define: {
    __API_BASE__: JSON.stringify(API_URL),
  },
})
