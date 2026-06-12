import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * `base` é a ÚNICA fonte de verdade de onde o app é servido.
 *  - Web (Vercel): /   (servido na raiz do domínio)
 *  - Nativo (Capacitor): ./   (defina VITE_DEPLOY_TARGET=native ao gerar o bundle nativo)
 * Todo o resto (React Router, start_url do PWA, assets) deriva daqui via import.meta.env.BASE_URL.
 */
const isNative = process.env.VITE_DEPLOY_TARGET === 'native'
const base = isNative ? './' : '/'

export default defineConfig({
  base,
  // Expõe o dev server na rede local (0.0.0.0) — abra pelo IP da máquina no
  // celular, ex.: http://192.168.x.x:5173. Útil pra testar o microfone no telefone.
  server: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Afinador',
        short_name: 'Afinador',
        description: 'Afinador de violão, guitarra, ukulele e baixo pelo microfone do celular.',
        lang: 'pt-BR',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0b0b',
        theme_color: '#0b0b0b',
        start_url: isNative ? './' : '/',
        scope: isNative ? './' : '/',
        categories: ['music', 'utilities'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
