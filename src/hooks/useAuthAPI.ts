import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse, LoginCredentials, User } from '../types';
import apiInstance from '../config/axios-config';

/**
 * 인증 관련 API 훅
 */

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

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

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
}

interface KakaoAuthUrlResponse {
  authUrl: string;
}

export const useAuthAPI = () => {
  const { data, loading, error, post, clearError } = useApiClient<ApiResponse<AuthResponse>>();

  const register = useCallback(
    (credentials: RegisterRequest) => {
      return post(API_ENDPOINTS.AUTH.REGISTER, credentials);
    },
    [post]
  );

  const login = useCallback(
    (credentials: LoginCredentials) => {
      return post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },
    [post]
  );

  const socialLogin = useCallback(
    (socialData: SocialLoginRequest) => {
      return post(API_ENDPOINTS.USERS.SOCIAL_LOGIN, socialData);
    },
    [post]
  );

  const getKakaoAuthUrl = useCallback(async (): Promise<KakaoAuthUrlResponse> => {
    // 임시 해결책: 프론트엔드에서 직접 카카오 로그인 URL 생성
    const kakaoClientId = '7e2fa6066f238c3d8ec02875d6bd7bd1'; // 카카오 앱 키
    const redirectUri = 'https://www.dwon.store/api/auth/kakao/callback'; // 올바른 redirect_uri

    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=account_email+profile_nickname`;

    return { authUrl };
  }, []);

  const testLogin = useCallback(async () => {
    // API 문서에 따르면 테스트 로그인은 POST /api/users/test-login
    const response = await apiInstance.post('/users/test-login', {
      email: 'test@example.com',
    });
    return response.data;
  }, []);

  const refreshToken = useCallback(async (refreshToken: string) => {
    // API 문서에 따르면 토큰 갱신은 POST /api/auth/refresh
    const response = await apiInstance.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    // API 문서에 따르면 로그아웃은 POST /api/auth/logout
    const response = await apiInstance.post('/auth/logout');
    return response.data;
  }, []);

  const logoutAllDevices = useCallback(async () => {
    // API 문서에 따르면 모든 기기 로그아웃은 POST /api/auth/logout-all-devices
    const response = await apiInstance.post('/auth/logout-all-devices');
    return response.data;
  }, []);

  return {
    // 상태
    authData: data?.data || null,
    loading,
    error,

    // 인증 액션
    register,
    login,
    socialLogin,
    getKakaoAuthUrl,
    testLogin,
    refreshToken,
    logout,
    logoutAllDevices,

    // 유틸리티
    clearError,
  };
};

export default useAuthAPI;
