/**
 * 보안 강화된 토큰 관리 유틸리티
 * localStorage + 메모리 캐시 조합으로 보안과 성능 향상
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'dwon_access_token',
  REFRESH_TOKEN: 'dwon_refresh_token',
  USER_DATA: 'dwon_user_data',
  TOKEN_EXPIRY: 'dwon_token_expiry',
  SECURITY_FLAG: 'dwon_security_flag', // 보안 플래그
} as const;

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
  expiresIn?: number; // 토큰 만료 시간 (초)
}

/**
 * 하이브리드 토큰 관리 클래스
 * localStorage + 메모리 캐시 조합
 */
export class TokenManager {
  // 메모리 캐시 (빠른 접근용)
  private static memoryCache = new Map<string, string>();

  // 토큰 만료 시간 관리
  private static readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5분 전에 갱신

  // 보안 플래그 (XSS 탐지용)
  private static readonly SECURITY_SIGNATURE = 'dwon_secure_2024';

  /**
   * 하이브리드 토큰 저장
   * Access Token: localStorage + 메모리
   * Refresh Token: localStorage만 (nginx 보안 + 짧은 만료시간)
   */
  static saveTokens(tokens: LoginTokens): void {
    try {
      const now = Date.now();
      const expiryTime = tokens.expiresIn ? now + tokens.expiresIn * 1000 : now + 15 * 60 * 1000; // 기본 15분

      // 보안 플래그 설정
      localStorage.setItem(TOKEN_KEYS.SECURITY_FLAG, this.SECURITY_SIGNATURE);

      // Access Token: localStorage + 메모리
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
      this.memoryCache.set(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      // Refresh Token: localStorage (nginx 보안 + 짧은 만료시간)
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      // 사용자 데이터: localStorage
      if (tokens.user) {
        localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(tokens.user));
      }

      // console.log('✅ 토큰 저장 완료 (하이브리드 보안)');
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  /**
   * Access Token 조회 (마이그레이션 체크 + 만료 체크)
   */
  static getAccessToken(): string | null {
    try {
      // 만료 시간 체크
      if (this.isTokenExpired()) {
        // console.log('⏰ 토큰 만료됨');
        return null;
      }

      // 메모리에서 먼저 조회
      let token = this.memoryCache.get(TOKEN_KEYS.ACCESS_TOKEN);

      if (!token) {
        // 메모리에 없으면 localStorage에서 조회
        const storedToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        if (storedToken) {
          // 메모리 캐시에 복원
          this.memoryCache.set(TOKEN_KEYS.ACCESS_TOKEN, storedToken);
          token = storedToken;
        }
      }

      return token || null;
    } catch (error) {
      console.error('Access Token 조회 실패:', error);
      return null;
    }
  }

  /**
   * Refresh Token 조회
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Refresh Token 조회 실패:', error);
      return null;
    }
  }

  /**
   * 토큰 만료 체크
   */
  static isTokenExpired(): boolean {
    try {
      const expiryTime = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiryTime) return true;

      const now = Date.now();
      const expiry = parseInt(expiryTime, 10);

      // 버퍼 시간을 고려하여 만료 체크
      return now >= expiry - this.TOKEN_BUFFER_TIME;
    } catch (error) {
      console.error('토큰 만료 체크 실패:', error);
      return true;
    }
  }

  /**
   * 모든 토큰 삭제
   */
  static clearTokens(): void {
    try {
      // localStorage 정리
      Object.values(TOKEN_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      // 메모리 캐시 정리
      this.memoryCache.clear();

      // console.log('✅ 모든 토큰 삭제 완료');
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  }

  /**
   * 사용자 데이터 조회
   */
  static getUserData(): unknown | null {
    try {
      const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
      return null;
    }
  }

  /**
   * 보안 플래그 검증
   */
  static validateSecurityFlag(): boolean {
    try {
      const flag = localStorage.getItem(TOKEN_KEYS.SECURITY_FLAG);
      return flag === this.SECURITY_SIGNATURE;
    } catch (error) {
      console.error('보안 플래그 검증 실패:', error);
      return false;
    }
  }
}
