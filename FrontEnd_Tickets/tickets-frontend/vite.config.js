import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SkyNet S.A.',
        short_name: 'SkyNet',
        description: 'Sistema de gestión de tickets y visitas técnicas',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
    enabled: true, // te permite probar el PWA en modo dev
  },
  workbox: {
    navigateFallback: '/index.html', // 🔹 Importante en SPA (React Router)
  },
}),
  ],
  base: '/', // 🔹 necesario para rutas limpias en Azure
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
