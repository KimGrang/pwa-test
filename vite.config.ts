import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB로 증가
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/models/*.gguf'], // GGUF 파일 제외
      },
      manifest: {
        name: 'WebLLM AI 채팅 PWA',
        short_name: 'WebLLM-PWA',
        description: 'WebLLM을 사용한 온디바이스 AI 모델 채팅 Progressive Web App',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'ko',
        scope: '/',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-64x64.svg', sizes: '64x64', type: 'image/svg+xml' },
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'maskable-icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
    chunkSizeWarningLimit: 10000, // 10MB로 증가
  },
  optimizeDeps: {
    include: ['@wllama/wllama'],
  },
});
