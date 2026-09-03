import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'VKU Field Survey — Offline Data Collection',
        short_name: 'VKU Survey',
        description: 'Ứng dụng kiểm toán cơ sở vật chất khuôn viên trường VKU, hoạt động 100% Offline',
        theme_color: '#0284c7',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache-First chiến lược cho toàn bộ App Shell tĩnh
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache Google Fonts hoặc Web Fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vku-google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 năm
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache các file hình ảnh và static assets ngoài shell
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vku-static-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 ngày
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Bật Service Worker ngay trong quá trình phát triển để test offline
      }
    }),
    // Plugin Mock API Endpoint /api/sync cho môi trường phát triển & kiểm thử
    {
      name: 'mock-sync-api-plugin',
      configureServer(server) {
        server.middlewares.use('/api/sync', (req, res) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}')
                console.log(' [Mock Server] Received Sync Record:', parsed.id || 'N/A')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                  status: 'OK',
                  message: 'Record synced successfully to VKU Server',
                  syncedId: parsed.id,
                  receivedAt: new Date().toISOString()
                }))
              } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }))
              }
            })
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'VKU Sync API Endpoint Ready' }))
          }
        })
      }
    }
  ]
})
