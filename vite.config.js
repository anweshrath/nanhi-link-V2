import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          qr: ['qrcode'],
          forms: ['react-hook-form']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-hook-form', 'recharts', 'qrcode']
  }
})
