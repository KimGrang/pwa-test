import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse, LoginCredentials, User } from '../types';

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
  user: User;
  accessToken: string;
  refreshToken: string;
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

  const kakaoLogin = useCallback(
    (kakaoData: SocialLoginRequest) => {
      return post(API_ENDPOINTS.AUTH.KAKAO, kakaoData);
    },
    [post]
  );

  const testLogin = useCallback(() => {
    return post(API_ENDPOINTS.USERS.TEST_LOGIN, {});
  }, [post]);

  const refreshToken = useCallback(
    (refreshToken: string) => {
      return post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
    },
    [post]
  );

  const logout = useCallback(() => {
    return post(API_ENDPOINTS.AUTH.LOGOUT, {});
  }, [post]);

  return {
    // 상태
    authData: data?.data || null,
    loading,
    error,

    // 인증 액션
    register,
    login,
    socialLogin,
    kakaoLogin,
    testLogin,
    refreshToken,
    logout,

    // 유틸리티
    clearError,
  };
};

export default useAuthAPI;
