/**
 * 토큰 자동 갱신 유틸리티
 */
import { TokenManager } from './token-manager';
import { getCurrentConfig, DWON_STORE_ENDPOINTS } from '../config/dwon-store-config';

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: unknown;
}

/**
 * Refresh Token을 사용하여 Access Token 갱신
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = TokenManager.getRefreshToken();

  if (!refreshToken) {
    console.warn('Refresh Token이 없습니다.');
    return false;
  }

  try {
    // console.log('🔄 토큰 갱신 시도 중...');

    const response = await fetch(`${getCurrentConfig().BASE_URL}${DWON_STORE_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`토큰 갱신 실패: ${response.status}`);
    }

    const data: RefreshResponse = await response.json();

    // 새로운 토큰 저장
    TokenManager.saveTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      user: data.user,
      expiresIn: data.expires_in,
    });

    // console.log('✅ 토큰 갱신 성공');
    return true;
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error);
    return false;
  }
};

/**
 * 로그아웃 처리
 */
export const handleLogout = (): void => {
  // console.log('🔓 로그아웃 처리 중...');
  TokenManager.clearTokens();

  // 인증 상태 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent('auth-error'));
};

/**
 * 토큰 갱신 상태 관리
 */
class TokenRefreshManager {
  private static isRefreshing = false;
  private static failedQueue: Array<{
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
  }> = [];

  static async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      // 이미 갱신 중인 경우 대기
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const success = await refreshAccessToken();

      if (success) {
        // 대기 중인 요청들 처리
        this.failedQueue.forEach(({ resolve }) => resolve(true));
        this.failedQueue = [];
        return true;
      } else {
        // 갱신 실패시 대기 중인 요청들 거부
        this.failedQueue.forEach(({ reject }) => reject(new Error('토큰 갱신 실패')));
        this.failedQueue = [];
        handleLogout();
        return false;
      }
    } catch (error) {
      this.failedQueue.forEach(({ reject }) => reject(error instanceof Error ? error : new Error('토큰 갱신 실패')));
      this.failedQueue = [];
      handleLogout();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  static getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

export { TokenRefreshManager };
