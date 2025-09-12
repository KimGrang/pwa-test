import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiInstance } from '../config/axios-config';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse, LoginCredentials, TokenCredentials, User } from '../types';

/**
 * 인증 토큰 인터페이스
 */
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * 소셜 로그인 요청 인터페이스
 */
interface SocialLoginRequest {
  userId: string;
  provider: 'GOOGLE' | 'KAKAO' | 'APPLE' | 'TEST';
  accessToken: string;
  refreshToken: string;
  socialUser: {
    email: string;
    name: string;
  };
}

/**
 * 회원가입 요청 인터페이스
 */
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 인증 응답 인터페이스
 */
interface AuthResponse {
  user: User;
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
  user: User | null;

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 기본 액션
  setAuthTokens: (tokens: AuthTokens | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  clearAll: () => void;

  // API 액션
  login: (credentials: LoginCredentials | TokenCredentials) => Promise<AuthResponse | null>;
  register: (credentials: RegisterRequest) => Promise<AuthResponse | null>;
  socialLogin: (socialData: SocialLoginRequest) => Promise<AuthResponse | null>;
  kakaoLogin: (kakaoData: SocialLoginRequest) => Promise<AuthResponse | null>;
  testLogin: () => Promise<AuthResponse | null>;
  refreshToken: (refreshToken: string) => Promise<AuthResponse | null>;
  logoutAPI: () => Promise<boolean>;
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
      user: null,
      isLoading: false,
      error: null,

      // 기본 액션
      setAuthTokens: (tokens: AuthTokens | null) =>
        set({
          tokens,
          isAuthenticated: !!tokens,
        }),

      setUser: (user: User | null) => set({ user }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () =>
        set({
          tokens: null,
          isAuthenticated: false,
          user: null,
          error: null,
        }),

      clearAll: () =>
        set({
          tokens: null,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }),

      // API 액션들
      login: async (credentials: LoginCredentials | TokenCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // TokenCredentials인 경우 직접 토큰 설정
          if ('accessToken' in credentials && 'refreshToken' in credentials) {
            const tokens = {
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken,
            };

            set({
              tokens,
              isAuthenticated: true,
              isLoading: false,
            });

            // 현재 사용자가 없는 경우 빈 사용자 객체 반환
            const currentUser = { id: 0, name: '', email: '', role: 'USER' as const };
            return { user: currentUser, accessToken: credentials.accessToken, refreshToken: credentials.refreshToken };
          }

          // LoginCredentials인 경우 API 호출
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      register: async (credentials: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, credentials);

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      socialLogin: async (socialData: SocialLoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(
            API_ENDPOINTS.USERS.SOCIAL_LOGIN,
            socialData
          );

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '소셜 로그인 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      kakaoLogin: async (kakaoData: SocialLoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.KAKAO, kakaoData);

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '카카오 로그인 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      testLogin: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.USERS.TEST_LOGIN, {});

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '테스트 로그인 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      refreshToken: async (refreshToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken,
          });

          if (response.data?.data) {
            const authData = response.data.data;
            const tokens = {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };

            set({
              tokens,
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return authData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '토큰 갱신 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      logoutAPI: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {});

          set({
            tokens: null,
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
