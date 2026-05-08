import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: '/WRF/',
  root: fileURLToPath(new URL('.', import.meta.url)),
})
