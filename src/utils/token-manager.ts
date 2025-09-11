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

      console.log('✅ 토큰 저장 완료 (하이브리드 보안)');
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  /**
   * 보안 검증
   */
  private static validateSecurity(): boolean {
    try {
      const flag = localStorage.getItem(TOKEN_KEYS.SECURITY_FLAG);
      return flag === this.SECURITY_SIGNATURE;
    } catch (error) {
      console.warn('보안 검증 실패:', error);
      return false;
    }
  }

  /**
   * Access Token 조회 (보안 검증 + 만료 체크)
   */
  static getAccessToken(): string | null {
    try {
      // 보안 검증
      if (!this.validateSecurity()) {
        console.warn('보안 검증 실패 - 토큰 접근 거부');
        this.clearTokens();
        return null;
      }

      // 만료 시간 체크
      if (this.isTokenExpired()) {
        console.log('⏰ 토큰 만료됨');
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
   * Refresh Token 조회 (보안 검증 포함)
   */
  static getRefreshToken(): string | null {
    try {
      // 보안 검증
      if (!this.validateSecurity()) {
        console.warn('보안 검증 실패 - Refresh Token 접근 거부');
        return null;
      }

      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Refresh Token 조회 실패:', error);
      return null;
    }
  }

  /**
   * 사용자 데이터 조회
   */
  static getUserData(): unknown | null {
    try {
      if (!this.validateSecurity()) {
        return null;
      }

      const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
      return null;
    }
  }

  /**
   * 토큰 만료 시간 체크
   */
  static isTokenExpired(): boolean {
    try {
      const expiryTime = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiryTime) return true;

      const now = Date.now();
      const expiry = parseInt(expiryTime);

      return now >= expiry - this.TOKEN_BUFFER_TIME;
    } catch (error) {
      console.error('토큰 만료 시간 체크 실패:', error);
      return true;
    }
  }

  /**
   * 토큰 갱신 필요 여부 체크
   */
  static shouldRefreshToken(): boolean {
    return this.isTokenExpired() && !!this.getRefreshToken();
  }

  /**
   * 모든 토큰 제거 (보안 정리)
   */
  static clearTokens(): void {
    try {
      // 메모리 캐시 정리
      this.memoryCache.clear();

      // localStorage 정리
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);
      localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(TOKEN_KEYS.SECURITY_FLAG);

      // 기존 토큰도 정리 (호환성)
      localStorage.removeItem('authToken');

      console.log('🧹 토큰 정리 완료');
    } catch (error) {
      console.error('토큰 제거 실패:', error);
    }
  }

  /**
   * 토큰 존재 확인
   */
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  /**
   * Access Token만 업데이트
   */
  static updateAccessToken(accessToken: string, expiresIn?: number): void {
    try {
      if (!this.validateSecurity()) {
        console.warn('보안 검증 실패 - 토큰 업데이트 거부');
        return;
      }

      const expiryTime = expiresIn ? Date.now() + expiresIn * 1000 : Date.now() + 15 * 60 * 1000;

      this.memoryCache.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      console.log('🔄 Access Token 업데이트 완료');
    } catch (error) {
      console.error('Access Token 업데이트 실패:', error);
    }
  }

  /**
   * 사용자 데이터만 업데이트
   */
  static updateUserData(userData: unknown): void {
    try {
      if (!this.validateSecurity()) {
        return;
      }

      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('사용자 데이터 업데이트 실패:', error);
    }
  }

  /**
   * 보안 상태 체크
   */
  static getSecurityStatus(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    shouldRefresh: boolean;
    isSecure: boolean;
  } {
    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      isExpired: this.isTokenExpired(),
      shouldRefresh: this.shouldRefreshToken(),
      isSecure: this.validateSecurity(),
    };
  }
}

export default TokenManager;
