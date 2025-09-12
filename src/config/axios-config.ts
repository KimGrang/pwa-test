import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * 통합된 Axios 설정 및 인스턴스 관리
 */

// =================================
// 환경별 설정
// =================================

export interface ApiEnvironmentConfig {
  BASE_URL: string;
  TIMEOUT: number;
}

export const API_ENVIRONMENTS = {
  DEVELOPMENT: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://www.dwon.store/api',
    TIMEOUT: 10000,
  },
  STAGING: {
    BASE_URL: import.meta.env.VITE_API_STAGING_URL || 'https://staging.dwon.store/api',
    TIMEOUT: 10000,
  },
  PRODUCTION: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://www.dwon.store/api',
    TIMEOUT: 10000,
  },
} as const;

// 현재 환경 설정 가져오기
export const getCurrentEnvironmentConfig = (): ApiEnvironmentConfig => {
  const env = (import.meta.env.MODE || 'development') as keyof typeof API_ENVIRONMENTS;
  return API_ENVIRONMENTS[env] || API_ENVIRONMENTS.DEVELOPMENT;
};

// =================================
// 기본 헤더 설정
// =================================

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

// =================================
// 에러 메시지 매핑
// =================================

export const HTTP_STATUS_MESSAGES = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '리소스가 이미 존재합니다.',
  422: '입력 데이터를 확인해주세요.',
  429: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  500: '서버 내부 오류가 발생했습니다.',
  502: '서버가 일시적으로 사용할 수 없습니다.',
  503: '서비스를 사용할 수 없습니다.',
  504: '요청 시간이 초과되었습니다.',
} as const;

// =================================
// Axios 인스턴스 생성 및 설정
// =================================

/**
 * 공통 Axios 인스턴스 생성 함수
 */
export const createAxiosInstance = (baseURL?: string, config?: AxiosRequestConfig): AxiosInstance => {
  const environmentConfig = getCurrentEnvironmentConfig();

  const instance = axios.create({
    baseURL: baseURL || environmentConfig.BASE_URL,
    timeout: environmentConfig.TIMEOUT,
    headers: {
      ...DEFAULT_HEADERS,
    },
    ...config,
  });

  // 요청 인터셉터 - 토큰 자동 추가
  instance.interceptors.request.use(
    (config) => {
      // localStorage에서 토큰 가져오기
      const authData = localStorage.getItem('auth-store');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const accessToken = parsed?.state?.tokens?.accessToken;
          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (error) {
          console.error('토큰 파싱 오류:', error);
        }
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 토큰 갱신 및 에러 처리
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // 401 에러이고 재시도하지 않은 경우 토큰 갱신 시도
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const authData = localStorage.getItem('auth-store');
          if (authData) {
            const parsed = JSON.parse(authData);
            const refreshToken = parsed?.state?.tokens?.refreshToken;

            if (refreshToken) {
              // 토큰 갱신 요청
              const refreshResponse = await axios.post(`${getCurrentEnvironmentConfig().BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });

              if (refreshResponse.data?.success && refreshResponse.data?.data) {
                const newTokens = {
                  accessToken: refreshResponse.data.data.access_token,
                  refreshToken: refreshResponse.data.data.refresh_token,
                };

                // localStorage 업데이트
                const updatedAuthData = {
                  ...parsed,
                  state: {
                    ...parsed.state,
                    tokens: newTokens,
                  },
                };
                localStorage.setItem('auth-store', JSON.stringify(updatedAuthData));

                // 원래 요청 재시도
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                }
                return instance.request(originalRequest);
              }
            }
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('auth-store');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/';
        }
      }

      // 에러 메시지 생성
      const errorMessage = getErrorMessage(error);
      const enhancedError = new Error(errorMessage);

      // 원본 에러 정보 보존
      Object.assign(enhancedError, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        originalError: error,
      });

      return Promise.reject(enhancedError);
    }
  );

  return instance;
};

/**
 * 에러 메시지 생성 함수
 */
export const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    const status = error.response.status;
    const serverMessage = (error.response.data as { message?: string })?.message;

    // 서버에서 제공한 메시지가 있으면 우선 사용
    if (serverMessage) {
      return serverMessage;
    }

    // HTTP 상태 코드에 따른 기본 메시지
    return (
      HTTP_STATUS_MESSAGES[status as keyof typeof HTTP_STATUS_MESSAGES] || `요청 중 오류가 발생했습니다. (${status})`
    );
  }

  if (error.request) {
    return '네트워크 연결을 확인해주세요.';
  }

  return error.message || '알 수 없는 오류가 발생했습니다.';
};

// =================================
// 기본 인스턴스 export
// =================================

// 기본 API 인스턴스 (dwon.store API용)
export const apiInstance = createAxiosInstance();

// 외부 API용 인스턴스 (필요시 사용)
export const externalApiInstance = createAxiosInstance('', {
  timeout: 30000,
});

export default apiInstance;
