import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/WRF/',
  root: 'C:/Users/Loribank/Desktop/Progetti GitHub/WRF',
  build: {
    outDir: 'C:/Users/Loribank/Desktop/Progetti GitHub/WRF/dist',
    emptyOutDir: true,
  }
})
