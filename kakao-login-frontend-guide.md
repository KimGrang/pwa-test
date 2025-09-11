# 카카오 로그인 프론트엔드 구현 가이드

> **핵심 원칙**: 백엔드가 모든 로그인/회원가입 로직을 처리하고, 프론트엔드는 결과만 받아서 Zustand에 저장

## 1. 카카오 로그인 버튼 컴포넌트

```typescript
// components/LoginModal.tsx (기존 모달에 카카오 로그인 추가)
import React, { useState } from 'react';
import { useAxios } from '../hooks/useAxios';
import { useDwonStoreAuth } from '../hooks/useDwonStoreAPI';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 훅
  const { testLogin, loading: authLoading } = useDwonStoreAuth();
  const { get: axiosGet } = useAxios(import.meta.env.VITE_API_BASE_URL || 'https://example.com/api');

  // 스토어 훅
  const { login: setAuthTokens } = useAuthStore();
  const { setCurrentUser } = useUserStore();

  /**
   * 카카오 로그인 처리 (백엔드에서 모든 로직 처리)
   */
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 백엔드에서 카카오 로그인 URL 가져오기
      const response = await axiosGet('/auth/kakao/url', {
        baseURL: import.meta.env.VITE_API_BASE_URL || 'https://example.com/api',
      });
      const { authUrl } = response;

      // 카카오 로그인 페이지로 리다이렉트
      window.location.href = authUrl;
    } catch (err) {
      setError('카카오 로그인 URL 가져오기 실패');
      console.error('카카오 로그인 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='login-modal-backdrop' onClick={handleBackdropClick}>
      <div className='login-modal'>
        <div className='login-modal-header'>
          <h2 className='login-modal-title'>로그인</h2>
          <button className='login-modal-close' onClick={onClose}>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        <div className='login-modal-content'>
          <p className='login-modal-description'>로그인 방법을 선택해주세요</p>

          {error && <div className='login-modal-error'>{error}</div>}

          <div className='login-modal-buttons'>
            <button
              className='login-modal-button login-modal-button--kakao'
              onClick={handleKakaoLogin}
              disabled={isLoading || authLoading}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  <span className='login-modal-button-icon'>💬</span>
                  카카오 로그인
                </>
              )}
            </button>

            <button
              className='login-modal-button login-modal-button--test'
              onClick={handleTestLogin}
              disabled={isLoading || authLoading}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  <span className='login-modal-button-icon'>🧪</span>
                  테스트 로그인
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
```

## 2. 카카오 로그인 콜백 처리 컴포넌트

```typescript
// components/KakaoCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { TokenManager } from '../utils/token-manager';

const KakaoCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Zustand 스토어 훅
  const { login: setAuthTokens } = useAuthStore();
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터에서 토큰과 사용자 정보 추출
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');
        const errorParam = searchParams.get('error');
        const messageParam = searchParams.get('message');

        // 에러 처리
        if (errorParam) {
          throw new Error(messageParam || '카카오 로그인에 실패했습니다.');
        }

        // 토큰이 없는 경우
        if (!accessToken || !refreshToken || !userParam) {
          throw new Error('로그인 정보를 받아오지 못했습니다.');
        }

        // 사용자 정보 파싱
        const user = JSON.parse(userParam);

        // Zustand 스토어에 토큰과 사용자 정보 저장
        setAuthTokens({
          accessToken,
          refreshToken,
        });
        setCurrentUser(user);

        // TokenManager에도 저장 (기존 호환성 유지)
        TokenManager.saveTokens({
          accessToken,
          refreshToken,
          user,
        });

        // 메인 페이지로 리다이렉트
        navigate('/');
      } catch (error) {
        console.error('카카오 로그인 콜백 처리 실패:', error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, setAuthTokens, setCurrentUser]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4'></div>
          <p className='text-gray-600'>카카오 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-red-500 text-6xl mb-4'>❌</div>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>로그인 실패</h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/')}
            className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='text-green-500 text-6xl mb-4'>✅</div>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>로그인 성공!</h2>
        <p className='text-gray-600'>잠시 후 메인 페이지로 이동합니다...</p>
      </div>
    </div>
  );
};

export default KakaoCallback;
```

## 3. 라우팅 설정

```typescript
// App.tsx (기존 라우팅에 카카오 콜백 추가)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import MedicalRecords from './screens/MedicalRecords';
import DetailRecord from './screens/DetailRecord';
import LLMChat from './screens/LLMChat';
import MoreScreen from './screens/MoreScreen';
import UserMoreScreen from './screens/UserMoreScreen';
import PetMoreScreen from './screens/PetMoreScreen';
import InstallScreen from './screens/InstallScreen';
import Navigation from './components/Navigation';
import KakaoCallback from './components/KakaoCallback'; // 카카오 콜백 컴포넌트 추가

const App: React.FC = () => {
  return (
    <Router>
      <div className='app-container'>
        <main className='app-main'>
          <Routes>
            {/* 기존 라우트들 */}
            <Route path='/' element={<HomeScreen />} />
            <Route path='/records' element={<MedicalRecords />} />
            <Route path='/record/:recordId' element={<DetailRecord />} />
            <Route path='/chat' element={<LLMChat />} />
            <Route path='/more' element={<MoreScreen />} />
            <Route path='/user-more' element={<UserMoreScreen />} />
            <Route path='/pet-more' element={<PetMoreScreen />} />
            <Route path='/install' element={<InstallScreen />} />

            {/* 카카오 로그인 콜백 라우트 추가 */}
            <Route path='/auth/kakao/callback' element={<KakaoCallback />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
```

## 4. Zustand 인증 상태 관리 (이미 구현됨)

프로젝트에서 이미 Zustand를 사용한 인증 상태 관리가 구현되어 있습니다:

```typescript
// store/authStore.ts (이미 구현됨)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuthTokens: (tokens: AuthTokens | null) => void;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  clearTokens: () => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      isAuthenticated: false,
      setAuthTokens: (tokens: AuthTokens | null) => set({ tokens, isAuthenticated: !!tokens }),
      login: (tokens: AuthTokens) => set({ tokens, isAuthenticated: true }),
      logout: () => set({ tokens: null, isAuthenticated: false }),
      clearTokens: () => set({ tokens: null, isAuthenticated: false }),
      clearAll: () => set({ tokens: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// store/userStore.ts (이미 구현됨)
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
```

## 5. API 요청 인터셉터 (이미 구현됨)

프로젝트에서 이미 useAxios 훅을 통해 API 요청 인터셉터가 구현되어 있습니다:

```typescript
// hooks/useAxios.ts (이미 구현됨)
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { TokenManager } from '../utils/token-manager';

export const useAxios = <T = unknown>(baseURL: string): UseAxiosReturn<T> => {
  const { tokens, logout } = useAuthStore();

  const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터 - 토큰 자동 추가
  api.interceptors.request.use(
    (config) => {
      const token = tokens?.accessToken || TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터 - 토큰 만료 처리
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // 토큰 만료 시 로그아웃 처리
        logout();
        TokenManager.clearTokens();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  // ... 나머지 구현
};
```

## 6. 홈 화면에서 로그인 모달 사용 (이미 구현됨)

```typescript
// screens/HomeScreen.tsx (이미 구현됨)
import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';

const HomeScreen: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 로그인 모달 열기
  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  // 로그인 모달 닫기
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className='screen-container'>
      <div className='screen-header'>
        <div className='header-right'>
          {!isAuthenticated ? (
            <button className='login-button' onClick={handleLogin}>
              <KeyIcon className='size-4' />
              로그인
            </button>
          ) : (
            <button className='user-greeting' onClick={handleUserProfileClick}>
              {currentUser?.name || '사용자'}님
            </button>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>{/* ... 기존 콘텐츠 ... */}</div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
};
```

## 7. 플로우 요약

1. **사용자가 홈 화면에서 로그인 버튼 클릭**

   - `HomeScreen`에서 로그인 모달 열기
   - 모달에서 "카카오 로그인" 버튼 클릭

2. **백엔드에서 카카오 로그인 URL 요청**

   - `LoginModal`에서 `${import.meta.env.VITE_API_BASE_URL}/auth/kakao/url` 호출
   - 백엔드에서 카카오 OAuth URL 반환

3. **카카오 로그인 페이지로 리다이렉트**

   - 사용자가 카카오 계정으로 로그인

4. **카카오에서 백엔드로 콜백**

   - 카카오 → `${import.meta.env.VITE_API_BASE_URL}/auth/kakao/callback?code=xxx`

5. **백엔드에서 OAuth 처리 후 프론트엔드로 리다이렉트**

   - 백엔드 → `http://localhost:5173/auth/kakao/callback?accessToken=...&refreshToken=...&user=...`

6. **프론트엔드에서 토큰 처리**
   - `KakaoCallback` 컴포넌트에서 URL 파라미터에서 토큰 추출
   - **Zustand 스토어에 토큰과 사용자 정보 저장** (핵심!)
   - TokenManager에도 저장 (기존 호환성 유지)
   - 홈 페이지로 리다이렉트

## 8. 환경별 설정

### 현재 개발 환경 (프론트엔드 개발 중, 백엔드 배포 중)

- 백엔드: `${import.meta.env.VITE_API_BASE_URL}` (배포된 상태)
- 프론트엔드: `http://localhost:5173` (개발 중)
- 카카오 Redirect URI: `${import.meta.env.VITE_API_BASE_URL}/auth/kakao/callback`

### 완전한 프로덕션 환경 (향후)

- 백엔드: `${import.meta.env.VITE_API_BASE_URL}`
- 프론트엔드: `https://example.com` (또는 별도 도메인)
- 카카오 Redirect URI: `${import.meta.env.VITE_API_BASE_URL}/auth/kakao/callback`

## 9. 주요 특징

이 구현 방식의 장점:

- ✅ **보안**: 모든 OAuth 처리가 백엔드에서 이루어짐
- ✅ **간단**: 프론트엔드는 결과만 받아서 Zustand에 저장
- ✅ **안전**: 클라이언트 시크릿이 노출되지 않음
- ✅ **사용자 경험**: 로그인 후 자동으로 홈 페이지로 이동
- ✅ **에러 처리**: 로그인 실패 시 적절한 에러 메시지 표시
- ✅ **상태 관리**: Zustand를 통한 중앙화된 인증 상태 관리
- ✅ **호환성**: 기존 TokenManager와의 호환성 유지

## 10. 필요한 패키지 (이미 설치됨)

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.0.0",
    "zustand": "^4.0.0",
    "@heroicons/react": "^2.0.0"
  }
}
```

## 11. 파일 구조 (현재 프로젝트 구조)

```
src/
├── components/
│   ├── LoginModal.tsx          # 로그인 모달 (카카오 + 테스트 로그인)
│   └── KakaoCallback.tsx       # 카카오 로그인 콜백 처리 (추가 필요)
├── screens/
│   └── HomeScreen.tsx          # 홈 화면 (로그인 버튼 포함)
├── store/
│   ├── authStore.ts            # 인증 상태 관리 (Zustand)
│   └── userStore.ts            # 사용자 정보 관리 (Zustand)
├── hooks/
│   ├── useAxios.ts             # API 요청 인터셉터
│   └── useDwonStoreAPI.ts      # 백엔드 API 훅
├── utils/
│   └── token-manager.ts        # 토큰 관리 유틸리티
├── config/
│   └── dwon-store-config.ts    # API 설정
└── App.tsx                     # 라우팅 설정
```

## 12. 구현해야 할 것들

1. **KakaoCallback 컴포넌트 생성** - 가이드의 콜백 처리 컴포넌트
2. **App.tsx에 라우트 추가** - `/auth/kakao/callback` 경로
3. **LoginModal 수정** - 카카오 로그인 로직을 가이드 방식으로 변경

이 가이드를 따라하면 백엔드 중심의 카카오 로그인 기능을 프론트엔드에서 완전히 구현할 수 있습니다.
