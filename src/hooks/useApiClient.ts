import { useState, useCallback, useRef } from 'react';
import { AxiosRequestConfig } from 'axios';
import { apiInstance } from '../config/axios-config';

/**
 * 통합된 API 클라이언트 훅
 * 모든 API 호출에 대한 표준화된 인터페이스 제공
 */

// =================================
// 타입 정의
// =================================

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiClientReturn<T> {
  // 상태
  data: T | null;
  loading: boolean;
  error: string | null;

  // HTTP 메서드
  get: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  del: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;

  // 유틸리티
  request: (config: AxiosRequestConfig) => Promise<T | null>;
  cancel: () => void;
  clearError: () => void;
  clearData: () => void;
  reset: () => void;
}

export interface UseApiClientOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  transformResponse?: (data: unknown) => unknown;
  retryCount?: number;
  retryDelay?: number;
}

// =================================
// 메인 훅
// =================================

export const useApiClient = <T = unknown>(options: UseApiClientOptions = {}): ApiClientReturn<T> => {
  const { onSuccess, onError, transformResponse, retryCount = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // =================================
  // 유틸리티 함수
  // =================================

  const updateState = useCallback((updates: Partial<ApiState<T>>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const clearData = useCallback(() => {
    updateState({ data: null });
  }, [updateState]);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, [cancel]);

  // =================================
  // 재시도 로직
  // =================================

  const executeWithRetry = useCallback(
    async <R>(operation: () => Promise<R>, currentRetry: number = 0): Promise<R> => {
      try {
        return await operation();
      } catch (error) {
        if (currentRetry < retryCount) {
          // 재시도 지연
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (currentRetry + 1)));
          return executeWithRetry(operation, currentRetry + 1);
        }
        throw error;
      }
    },
    [retryCount, retryDelay]
  );

  // =================================
  // 공통 요청 함수
  // =================================

  const request = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      // 이전 요청 취소
      cancel();

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();
      const requestConfig = {
        ...config,
        signal: abortControllerRef.current.signal,
      };

      updateState({ loading: true, error: null });

      try {
        const response = await executeWithRetry(async () => {
          return apiInstance.request<T>(requestConfig);
        });

        let responseData = response.data;

        // 응답 데이터 변환
        if (transformResponse) {
          responseData = transformResponse(responseData) as T;
        }

        updateState({
          data: responseData,
          loading: false,
          error: null,
        });

        // 성공 콜백 실행
        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (error: unknown) {
        // 요청이 취소된 경우 상태 업데이트 하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

        updateState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        // 에러 콜백 실행
        if (onError) {
          onError(errorMessage);
        }

        // 취소된 요청은 에러로 로깅하지 않음
        if (error instanceof Error && error.name !== 'CanceledError' && error.message !== 'canceled') {
          console.error('API 요청 오류:', error);
        }
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [updateState, cancel, executeWithRetry, transformResponse, onSuccess, onError]
  );

  // =================================
  // HTTP 메서드 래퍼
  // =================================

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'GET', url });
    },
    [request]
  );

  const post = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'POST', url, data });
    },
    [request]
  );

  const put = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'PUT', url, data });
    },
    [request]
  );

  const patch = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'PATCH', url, data });
    },
    [request]
  );

  const del = useCallback(
    (url: string, config?: AxiosRequestConfig): Promise<T | null> => {
      return request({ ...config, method: 'DELETE', url });
    },
    [request]
  );

  return {
    // 상태
    data: state.data,
    loading: state.loading,
    error: state.error,

    // HTTP 메서드
    get,
    post,
    put,
    patch,
    del,

    // 유틸리티
    request,
    cancel,
    clearError,
    clearData,
    reset,
  };
};

export default useApiClient;
