# PWA Test App

React + Vite + TypeScript로 구축된 Progressive Web App (PWA)입니다.

## 🚀 주요 기능

- ✅ **오프라인 지원**: 인터넷 연결 없이도 앱 사용 가능
- ✅ **홈 화면 설치**: 모바일 기기의 홈 화면에 앱 설치
- ✅ **자동 업데이트**: 새 버전 자동 감지 및 업데이트
- ✅ **빠른 로딩**: Service Worker를 통한 캐싱

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa + Workbox
- **Package Manager**: pnpm

## 📦 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview
```

## 🌐 배포

### Vercel 배포 (권장)

1. **GitHub 연동**:
   ```bash
   git add .
   git commit -m "Initial PWA setup"
   git push origin main
   ```
   
2. Vercel.com에서 GitHub 저장소 연결
3. 자동 배포 완료

### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 📱 PWA 테스트

1. **개발 환경**: `pnpm dev` 실행 후 브라우저에서 테스트
2. **프로덕션**: 빌드 후 HTTPS 환경에서 테스트
3. **모바일**: Chrome DevTools의 Device Mode 사용

### PWA 기능 확인

- 브라우저 개발자 도구 → Application 탭
- Service Worker 등록 상태 확인
- Manifest 파일 확인
- 오프라인 모드 테스트

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── PWAInstallButton.tsx    # PWA 설치 버튼
│   └── PWAUpdatePrompt.tsx     # 업데이트 알림
├── hooks/
│   ├── usePWA.ts              # PWA 업데이트 훅
│   └── useInstallPrompt.ts    # 설치 프롬프트 훅
├── types/
│   └── pwa.ts                 # PWA 타입 정의
└── App.tsx                    # 메인 앱 컴포넌트

public/
├── pwa-*.svg                  # PWA 아이콘들
└── manifest.webmanifest       # PWA 매니페스트

vite.config.ts                 # Vite + PWA 설정
```

## 🔧 설정 파일

- `vite.config.ts`: PWA 플러그인 및 Workbox 설정
- `vercel.json`: Vercel 배포 설정
- `manifest.webmanifest`: PWA 매니페스트 (자동 생성)

## 📚 참고 자료

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [PWA 가이드](https://web.dev/progressive-web-apps/)

## 📄 라이선스

MIT License
