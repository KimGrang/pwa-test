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
        // Background Sync, Periodic Sync, Push Notifications 지원
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24시간
              },
            },
          },
        ],
        // 오프라인 지원 강화
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
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
    // JavaScript 번들 최적화 설정
    minify: 'terser', // Terser를 사용한 고급 최소화
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
        drop_debugger: true, // debugger 문 제거
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 순수 함수 제거
        passes: 2, // 압축 패스 수 증가
        unsafe: true, // 안전하지 않은 최적화 활성화
        unsafe_comps: true, // 비교 연산 최적화
        unsafe_Function: true, // Function 생성자 최적화
        unsafe_math: true, // 수학 연산 최적화
        unsafe_proto: true, // 프로토타입 최적화
        unsafe_regexp: true, // 정규식 최적화
      },
      mangle: {
        safari10: true, // Safari 10+ 호환성
        toplevel: true, // 최상위 함수명 난독화
      },
      format: {
        comments: false, // 주석 제거
      },
    },
    rollupOptions: {
      external: [],
      output: {
        // 청크 최적화
        manualChunks: (id) => {
          // node_modules 의존성을 별도 청크로 분리
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@wllama')) {
              return 'wllama-vendor';
            }
            return 'vendor';
          }
        },
        // 청크 파일명 최적화
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 청크 크기 최적화
        compact: true,
        // 사용하지 않는 export 제거
        exports: 'named',
      },
      // 트리 쉐이킹 최적화
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 10000, // 10MB로 증가
    // 소스맵 생성 (프로덕션 디버깅용)
    sourcemap: false,
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // 타겟 브라우저 설정
    target: 'esnext',
    // 빌드 최적화
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['@wllama/wllama'],
    // 의존성 최적화
    force: true,
    // ESBuild 최적화
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true,
        'dynamic-import': true,
      },
    },
  },
  // ESBuild 최적화
  esbuild: {
    target: 'esnext',
    supported: {
      bigint: true,
      'dynamic-import': true,
    },
  },
});
