import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 인증 토큰 인터페이스
 */
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  // 인증 토큰
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // 액션
  setAuthTokens: (tokens: AuthTokens | null) => void;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  clearTokens: () => void;
}

/**
 * 인증 스토어 생성
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      tokens: null,
      isAuthenticated: false,

      // 액션
      setAuthTokens: (tokens: AuthTokens | null) => set({ tokens, isAuthenticated: !!tokens }),

      login: (tokens: AuthTokens) => set({ tokens, isAuthenticated: true }),

      logout: () => set({ tokens: null, isAuthenticated: false }),

      clearTokens: () => set({ tokens: null, isAuthenticated: false }),
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
