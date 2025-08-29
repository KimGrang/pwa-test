# 🤖 WebLLM 온디바이스 LLM 채팅 PWA

온디바이스에서 AI 모델을 실행하는 Progressive Web App입니다. [WebLLM](https://github.com/mlc-ai/web-llm)을 사용하여 브라우저에서 직접 LLM을 실행할 수 있습니다.

## ✨ 주요 기능

- 🌐 **온디바이스 실행**: 인터넷 연결 없이도 AI 모델 실행
- 📱 **PWA 지원**: 홈 화면에 설치 가능
- 🔄 **자동 업데이트**: 새 버전 자동 감지 및 설치
- 🚀 **WebLLM 통합**: 고성능 브라우저 내 LLM 추론 엔진
- 🎯 **다양한 모델 지원**: Llama-2, Mistral, Phi-2, TinyLlama 등
- ⚡ **WebGPU 가속**: GPU 가속을 통한 빠른 추론

## 🚀 빠른 시작

### 1. 개발 서버 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 브라우저에서 http://localhost:5173 접속
```

### 2. 프로덕션 빌드

```bash
# 빌드
pnpm build

# 미리보기
pnpm preview
```

## 📁 프로젝트 구조

```
pwa_test/
├── src/
│   ├── components/
│   │   ├── LLMChat.tsx           # 메인 채팅 컴포넌트
│   │   ├── PWAInstallButton.tsx  # PWA 설치 버튼
│   │   └── PWAUpdatePrompt.tsx   # 업데이트 알림
│   ├── hooks/
│   │   ├── useWebLLM.ts          # WebLLM 훅
│   │   ├── usePWA.ts             # PWA 훅
│   │   └── useInstallPrompt.ts   # 설치 프롬프트 훅
│   ├── types/
│   │   └── pwa.ts                # 타입 정의
│   └── App.tsx                   # 메인 앱 컴포넌트
├── public/
│   ├── manifest.webmanifest      # PWA 매니페스트
│   └── icons/                    # PWA 아이콘들
├── vite.config.ts                # Vite 설정
└── package.json
```

## 🔧 WebLLM 모델 사용법

### 1. 모델 선택 및 로딩

1. **모델 선택**: 드롭다운에서 원하는 모델을 선택합니다
2. **모델 로드**: "모델 로드" 버튼을 클릭하여 모델을 다운로드하고 초기화합니다
3. **채팅 시작**: 모델 로딩이 완료되면 채팅 인터페이스가 나타납니다

### 2. 사용 가능한 모델들

- **TinyLlama-1.1B-Chat-v1.0-q4f16_1**: 빠른 응답, 경량 모델 (권장)
- **Phi-2-q4f16_1**: Microsoft의 효율적인 모델
- **Mistral-7B-Instruct-v0.2-q4f16_1**: 고품질 응답, 중간 크기
- **Llama-2-7b-chat-q4f16_1**: Meta의 안정적인 모델
- **Llama-2-13b-chat-q4f16_1**: 더 큰 모델 (고품질)
- **NeuralHermes-2.5-Mistral-7B-q4f16_1**: 특화된 모델

### 3. 성능 최적화

- **첫 번째 로딩**: 모델 다운로드로 인해 시간이 걸릴 수 있습니다
- **WebGPU 지원**: WebGPU를 지원하는 브라우저에서 더 빠른 성능
- **브라우저 캐시**: 모델은 브라우저 캐시에 저장되어 다음 로딩 시 더 빠릅니다

## 🚀 WebLLM 특징

### 1. 고성능 브라우저 내 추론

- **WebGPU 가속**: GPU 가속을 통한 빠른 추론
- **메모리 효율성**: 브라우저 메모리를 효율적으로 사용
- **오프라인 지원**: 인터넷 연결 없이도 AI 모델 실행

### 2. OpenAI API 호환성

- **완전 호환**: OpenAI API와 동일한 인터페이스
- **스트리밍 지원**: 실시간 토큰 스트리밍
- **다양한 모델**: Llama-2, Mistral, Phi-2 등 다양한 모델 지원

### 3. PWA 통합

- **홈 화면 설치**: 모바일/데스크탑 홈 화면에 설치 가능
- **오프라인 동작**: 서비스 워커를 통한 오프라인 지원
- **자동 업데이트**: 새 버전 자동 감지 및 설치

## 🔍 문제 해결

### 모델 로딩 실패

**해결 방법**:

1. **브라우저 확인**: Chrome, Edge, Firefox 최신 버전 사용
2. **WebGPU 지원**: WebGPU를 지원하는 브라우저에서 더 빠른 성능
3. **메모리 정리**: 브라우저 새로고침으로 메모리 정리
4. **네트워크 확인**: 모델 다운로드를 위한 안정적인 인터넷 연결

### 채팅 응답 오류

**해결 방법**:

1. **모델 재로딩**: 모델을 다시 로드해보세요
2. **브라우저 캐시**: 브라우저 캐시를 지우고 다시 시도
3. **다른 모델**: 더 작은 모델로 테스트 (예: TinyLlama)
4. **메모리 부족**: 다른 탭을 닫고 메모리 확보

### PWA 설치 문제

**해결 방법**:

1. **HTTPS 환경**: PWA 설치를 위해서는 HTTPS 환경이 필요합니다
2. **브라우저 지원**: Chrome, Edge, Safari에서 PWA 설치 지원
3. **매니페스트 확인**: `manifest.webmanifest` 파일이 올바르게 설정되었는지 확인

## 🛠️ 개발

### 의존성

- React 19
- Vite 7
- TypeScript 5.8
- WebLLM 0.2.79
- PWA 플러그인

### 스크립트

```bash
# 개발 서버
pnpm dev

# 타입 체크
pnpm type-check

# 빌드
pnpm build

# 미리보기
pnpm preview

# 린트
pnpm lint
```

## 📄 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. **nginx 사용**: 가장 안정적인 방법
2. **모델 크기**: 512MB 이하 청크 권장
3. **브라우저**: Chrome 최신 버전 권장
4. **메모리**: 충분한 RAM 확보 (8GB 이상 권장)

---

**참고**: 이 프로젝트는 wllama 라이브러리를 사용하여 브라우저에서 직접 LLM을 실행합니다. 대용량 모델의 경우 충분한 메모리와 시간이 필요할 수 있습니다.
