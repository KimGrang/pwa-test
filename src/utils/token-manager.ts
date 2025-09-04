/**
 * dwon.store API 토큰 관리 유틸리티
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'dwon_access_token',
  REFRESH_TOKEN: 'dwon_refresh_token',
  USER_DATA: 'dwon_user_data',
} as const;

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
}

export class TokenManager {
  // 토큰 저장
  static saveTokens(tokens: LoginTokens): void {
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      if (tokens.user) {
        localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(tokens.user));
      }
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  // Access Token 조회
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Access Token 조회 실패:', error);
      return null;
    }
  }

  // Refresh Token 조회
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Refresh Token 조회 실패:', error);
      return null;
    }
  }

  // 사용자 데이터 조회
  static getUserData(): unknown | null {
    try {
      const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
      return null;
    }
  }

  // 모든 토큰 제거
  static clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);

      // 기존 토큰도 제거 (호환성)
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('토큰 제거 실패:', error);
    }
  }

  // 토큰 존재 확인
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(accessToken && refreshToken);
  }

  // Access Token만 업데이트
  static updateAccessToken(accessToken: string): void {
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    } catch (error) {
      console.error('Access Token 업데이트 실패:', error);
    }
  }

  // 사용자 데이터만 업데이트
  static updateUserData(userData: unknown): void {
    try {
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('사용자 데이터 업데이트 실패:', error);
    }
  }
}

export default TokenManager;
