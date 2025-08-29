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
        id: 'webllm-pwa-app',
        launch_handler: {
          client_mode: 'navigate-existing',
        },
        screenshots: [
          {
            src: 'Screenshot_20250829_145348_Edge.jpg',
            sizes: '1280x720',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'AI 채팅 인터페이스 - 데스크톱',
          },
          {
            src: 'Screenshot_2025-08-29 145510.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'AI 채팅 인터페이스 - 모바일',
          },
        ],
        categories: ['productivity', 'utilities', 'education'],
        dir: 'ltr',
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        prefer_related_applications: false,
        related_applications: [],
        scope_extensions: [],
        icons: [
          { src: 'pwa-64x64.svg', sizes: '64x64', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
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
