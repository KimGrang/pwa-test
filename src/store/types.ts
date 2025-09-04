/**
 * 상태관리 공통 타입 정의
 */

// 기본 상태 인터페이스
export interface BaseState {
  isLoading: boolean;
  error: string | null;
}

// 기본 액션 인터페이스
export interface BaseActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// API 응답 인터페이스
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 페이지네이션 인터페이스
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 정렬 인터페이스
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// 필터 인터페이스
export interface Filter {
  [key: string]: string | number | boolean | null | undefined;
}

// 검색 인터페이스
export interface SearchParams {
  query: string;
  filters?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}

// 상태 업데이트 함수 타입
export type StateUpdater<T> = (state: T) => Partial<T> | void;

// 액션 함수 타입
export type ActionFunction<T = unknown> = (...args: unknown[]) => T;

// 스토어 생성 함수 타입
export type StoreCreator<T> = (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T;
