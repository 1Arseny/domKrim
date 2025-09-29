import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        pricing: resolve(__dirname, 'pricing.html'),
      },
    },
  },
})
