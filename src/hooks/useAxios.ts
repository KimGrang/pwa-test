import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenManager } from '../utils/token-manager';
import { TokenRefreshManager } from '../utils/token-refresh';

/**
 * 보안 강화된 axios HTTP 통신 훅
 * 자동 토큰 갱신 및 재시도 로직 포함
 */

interface UseAxiosState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAxiosReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  request: (config: AxiosRequestConfig) => Promise<T | null>;
  get: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  del: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  clearError: () => void;
  clearData: () => void;
  reset: () => void;
}

export const useAxios = <T = unknown>(baseURL?: string): UseAxiosReturn<T> => {
  const [state, setState] = useState<UseAxiosState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // axios 인스턴스 생성
  const axiosInstance = axios.create({
    baseURL: baseURL || '',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터 - 보안 강화된 토큰 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 자동 토큰 갱신 로직
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 401 에러이고 아직 재시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 토큰 갱신 시도
          const refreshSuccess = await TokenRefreshManager.handleTokenRefresh();

          if (refreshSuccess) {
            // 갱신 성공시 원본 요청 재시도
            return axiosInstance.request(originalRequest);
          } else {
            // 갱신 실패시 에러 반환
            return Promise.reject(new Error('인증이 필요합니다.'));
          }
        } catch {
          return Promise.reject(new Error('인증이 필요합니다.'));
        }
      }

      // 401이 아닌 다른 에러들 처리
      let errorMessage = '요청 중 오류가 발생했습니다.';

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = '잘못된 요청입니다.';
            break;
          case 403:
            errorMessage = '접근 권한이 없습니다.';
            break;
          case 404:
            errorMessage = '요청한 리소스를 찾을 수 없습니다.';
            break;
          case 429:
            errorMessage = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
            break;
          case 500:
            errorMessage = '서버 내부 오류가 발생했습니다.';
            break;
          default:
            errorMessage = (error.response.data as { message?: string })?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      return Promise.reject(new Error(errorMessage));
    }
  );

  // 공통 요청 함수
  const request = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axiosInstance.request<T>(config);
        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
          error: null,
        }));
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        console.error('API 요청 오류:', error);
        return null;
      }
    },
    [axiosInstance]
  );

  // GET 요청
  const get = useCallback(
    (url: string, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'GET', url });
    },
    [request]
  );

  // POST 요청
  const post = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'POST', url, data });
    },
    [request]
  );

  // PUT 요청
  const put = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'PUT', url, data });
    },
    [request]
  );

  // PATCH 요청
  const patch = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'PATCH', url, data });
    },
    [request]
  );

  // DELETE 요청
  const del = useCallback(
    (url: string, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'DELETE', url });
    },
    [request]
  );

  // 에러 초기화
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 데이터 초기화
  const clearData = useCallback(() => {
    setState((prev) => ({ ...prev, data: null }));
  }, []);

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    request,
    get,
    post,
    put,
    patch,
    del,
    clearError,
    clearData,
    reset,
  };
};

export default useAxios;
