# 🤖 wllama AI 채팅 PWA

React, Vite, TypeScript로 구축된 Progressive Web App과 wllama를 사용한 온디바이스 Large Language Model 통합 프로젝트입니다.

## 🚀 주요 기능

- **온디바이스 LLM**: wllama를 사용한 브라우저 기반 AI 추론
- **로컬 모델 지원**: GGUF 파일을 직접 로드하여 사용
- **PWA 지원**: 오프라인 작동, 홈 화면 설치, 자동 업데이트
- **실시간 채팅**: 스트리밍 응답으로 자연스러운 대화
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## ⚡ 빠른 시작

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── LLMChat.tsx     # 메인 채팅 인터페이스
│   ├── PWAInstallButton.tsx  # PWA 설치 버튼
│   └── PWAUpdatePrompt.tsx   # PWA 업데이트 프롬프트
├── hooks/              # 커스텀 훅
│   └── useWllama.ts    # wllama 통합 훅
├── types/              # TypeScript 타입 정의
│   └── pwa.ts          # PWA 관련 타입
└── config/             # 설정 파일
    └── wllama-config.js # wllama 설정
```

## 🎯 wllama 모델 사용법

### 1. 모델 선택

- **원격 모델**: wllama에서 제공하는 사전 정의된 모델
- **로컬 모델**: 사용자가 직접 준비한 GGUF 파일

### 2. 사용 가능한 모델들

- `/models/euro_gguf.gguf` - 로컬 Euro 모델 (1.7GB)

### 3. 성능 팁

- 첫 번째 로딩은 시간이 걸릴 수 있습니다 (모델 다운로드/로딩)
- WebAssembly를 사용하여 브라우저에서 직접 실행됩니다
- 로컬 모델은 네트워크 없이도 사용할 수 있습니다

## ✅ wllama 특징

- **로컬 파일 지원**: GGUF 파일을 직접 로드 가능
- **WebAssembly 기반**: 브라우저에서 네이티브 성능
- **네트워크 독립적**: 오프라인에서도 사용 가능
- **단순한 API**: 직관적인 인터페이스

## 🚀 Vercel 배포

### 배포 방법

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 자동 배포 완료

### Vercel 설정

- `vercel.json`에서 CORS 헤더 설정
- WASM 파일 지원을 위한 헤더 구성
- PWA 관련 파일 라우팅 설정

### 주의사항

- **SharedArrayBuffer 지원**: Vercel에서 `Cross-Origin-Embedder-Policy` 헤더 설정 필요
- **WASM 파일**: CDN에서 wllama WASM 파일 로드
- **모델 파일**: 로컬 모델은 별도 호스팅 필요 (Vercel 파일 크기 제한)

## 🔧 문제 해결

### 모델 로딩 실패

- 브라우저 콘솔에서 에러 메시지 확인
- 네트워크 연결 상태 확인
- 모델 파일 경로 확인

### 채팅 응답 없음

- 모델이 완전히 로드되었는지 확인
- 브라우저 메모리 부족 여부 확인
- WebAssembly 지원 브라우저 사용

### PWA 설치 안됨

- HTTPS 환경에서 테스트
- 브라우저 PWA 지원 확인
- manifest.webmanifest 파일 확인

## 📦 의존성

### 핵심 의존성

- `@wllama/wllama`: WebAssembly 기반 LLM 추론
- `react`: UI 프레임워크
- `vite`: 빌드 도구
- `vite-plugin-pwa`: PWA 지원

### 개발 의존성

- `typescript`: 타입 안전성
- `@types/react`: React 타입 정의
- `@vitejs/plugin-react`: React 플러그인

## 📝 스크립트

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- [wllama](https://github.com/ngxson/wllama) - WebAssembly 기반 LLM 추론
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - 효율적인 LLM 추론
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구
- [React](https://react.dev/) - UI 프레임워크
