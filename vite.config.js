import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Madhav's Million Coin Challenge",
        short_name: "Madhav's Quiz",
        display: 'fullscreen',
        theme_color: '#FFD43B',
        background_color: '#0f0c29',
        icons: [
          {
            src: '/coin192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/coin512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
