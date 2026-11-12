import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5173 dan boshlaydi; band bo'lsa Vite o'zi 5174, 5175... ga o'tadi
  server: { port: 5173 },
})
