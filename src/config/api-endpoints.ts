/**
 * 통합된 API 엔드포인트 상수 관리
 */

// =================================
// 기본 API 엔드포인트
// =================================

export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REFRESH_TOKEN: '/auth/refresh',
    KAKAO: '/auth/kakao',
    TOKEN_STATS: '/auth/token-stats',
    CLEANUP_TOKENS: '/auth/cleanup-tokens',
  },

  // 사용자 관련
  USERS: {
    PROFILE: '/users/profile',
    SOCIAL_LOGIN: '/users/social-login',
    TEST_LOGIN: '/users/test-login',
    CHANGE_PASSWORD: '/users/change-password',
    WITHDRAW: '/users/withdraw',
  },

  // 병원 관련
  HOSPITALS: {
    LIST: '/hospitals',
    MY_HOSPITAL: '/hospitals/my-hospital',
    DETAIL: (id: number) => `/hospitals/${id}`,
  },

  // 반려동물 관련
  PETS: {
    LIST: '/pets',
    MY_PETS: '/pets/my-pets',
    MY_PETS_WITH_RECORDS: '/pets/my-pets-with-records',
    CREATE: '/pets',
    DETAIL: (id: number) => `/pets/${id}`,
  },

  // 진료기록 관련
  MEDICAL_RECORDS: {
    LIST: '/medical-records',
    BY_PET: (petId: number) => `/medical-records/pet/${petId}`,
    CREATE: '/medical-records',
    DETAIL: (id: number) => `/medical-records/${id}`,
    DETAIL_WITH_RELATIONS: (id: number) => `/medical-records/detail/${id}`,
  },

  // AI 상담 관련
  AI_CONSULTATIONS: {
    LIST: '/ai-consultations',
    MY_CONSULTATIONS: '/ai-consultations/my-consultations',
    CREATE: '/ai-consultations',
    DETAIL: (id: number) => `/ai-consultations/${id}`,
  },

  // 수의사 관련
  VET: {
    LIST: '/vet',
    CREATE: '/vet',
    DETAIL: (id: number) => `/vet/${id}`,
  },

  // 채팅 관련
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    SESSIONS: '/chat/sessions',
    SESSION_MESSAGES: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
    CREATE_SESSION: '/chat/sessions',
  },
} as const;

// =================================
// 페이지네이션 기본값
// =================================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// =================================
// API 응답 상태 코드
// =================================

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =================================
// 유틸리티 함수
// =================================

/**
 * 페이지네이션 쿼리 스트링 생성
 */
export const createPaginationQuery = (
  page: number = PAGINATION_DEFAULTS.PAGE,
  limit: number = PAGINATION_DEFAULTS.LIMIT
): string => {
  return `?page=${page}&limit=${Math.min(limit, PAGINATION_DEFAULTS.MAX_LIMIT)}`;
};

/**
 * URL 매개변수를 쿼리 스트링으로 변환
 */
export const createQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// =================================
// 엔드포인트 빌더 유틸리티
// =================================

/**
 * 페이지네이션과 함께 엔드포인트 빌드
 */
export const buildPaginatedEndpoint = (
  baseEndpoint: string,
  page?: number,
  limit?: number,
  additionalParams?: Record<string, string | number | boolean | undefined>
): string => {
  const paginationQuery = createPaginationQuery(page, limit);
  const additionalQuery = additionalParams ? createQueryString(additionalParams) : '';

  // 페이지네이션과 추가 파라미터 결합
  if (additionalQuery) {
    const combinedParams = new URLSearchParams(paginationQuery + '&' + additionalQuery.slice(1));
    return `${baseEndpoint}?${combinedParams.toString()}`;
  }

  return baseEndpoint + paginationQuery;
};

export default API_ENDPOINTS;
