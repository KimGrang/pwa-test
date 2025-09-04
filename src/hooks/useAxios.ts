import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * 범용 axios HTTP 통신을 위한 커스텀 훅
 * 모든 컴포넌트에서 재사용 가능한 axios 통신 관리
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

  // 요청 인터셉터 - 토큰 자동 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      // example.com API를 위한 토큰 관리
      const accessToken = localStorage.getItem('dwon_access_token') || localStorage.getItem('authToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 에러 처리
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      let errorMessage = '요청 중 오류가 발생했습니다.';

      if (error.response) {
        // 서버 응답이 있는 경우
        switch (error.response.status) {
          case 400:
            errorMessage = '잘못된 요청입니다.';
            break;
          case 401:
            errorMessage = '인증이 필요합니다.';
            // 토큰 및 사용자 데이터 제거
            localStorage.removeItem('authToken');
            localStorage.removeItem('dwon_access_token');
            localStorage.removeItem('dwon_refresh_token');
            localStorage.removeItem('dwon_user_data');
            // 페이지 새로고침 없이 인증 상태 변경을 알리기 위한 이벤트 발생
            window.dispatchEvent(new CustomEvent('auth-error'));
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
        // 네트워크 오류
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else {
        // 기타 오류
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
