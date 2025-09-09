/**
 * example.com 전용 API 설정 및 엔드포인트 상수
 */

// =================================
// API 설정
// =================================

export const DWON_STORE_CONFIG = {
  // 프로덕션 환경
  PRODUCTION: {
    BASE_URL: 'https://example.com/api',
    TIMEOUT: 10000,
  },
  // 개발 환경
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:4000/api',
    TIMEOUT: 10000,
  },
  // 스테이징 환경
  STAGING: {
    BASE_URL: 'https://staging.example.com/api',
    TIMEOUT: 10000,
  },
};

// 현재 환경에 따른 설정 선택
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return DWON_STORE_CONFIG.PRODUCTION;
    case 'staging':
      return DWON_STORE_CONFIG.STAGING;
    default:
      return DWON_STORE_CONFIG.DEVELOPMENT;
  }
};

// =================================
// API 엔드포인트 상수
// =================================

export const DWON_STORE_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
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
  },

  // 병원 관련
  HOSPITALS: {
    LIST: '/hospitals',
    MY_HOSPITAL: '/hospitals/my-hospital',
    DETAIL: (id: number) => `/hospitals/${id}`,
  },

  // 반려동물 관련
  PETS: {
    MY_PETS: '/pets/my-pets',
    MY_PETS_WITH_RECORDS: '/pets/my-pets-with-records', // N+1 문제 해결을 위한 새로운 엔드포인트
    CREATE: '/pets',
    DETAIL: (id: number) => `/pets/${id}`,
  },

  // 진료기록 관련
  MEDICAL_RECORDS: {
    BY_PET: (petId: number) => `/medical-records/pet/${petId}`,
    CREATE: '/medical-records',
    DETAIL: (id: number) => `/medical-records/${id}`,
  },

  // AI 상담 관련
  AI_CONSULTATIONS: {
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
};

// =================================
// 요청 헤더 및 기본값
// =================================

export const DWON_STORE_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const DWON_STORE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// =================================
// 토큰 관리 상수
// =================================

export const DWON_STORE_TOKENS = {
  ACCESS_TOKEN_KEY: 'dwon_access_token',
  REFRESH_TOKEN_KEY: 'dwon_refresh_token',
  USER_DATA_KEY: 'dwon_user_data',
  TOKEN_PREFIX: 'Bearer',
};

// =================================
// API 응답 상태 코드
// =================================

export const DWON_STORE_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// =================================
// 에러 메시지
// =================================

export const DWON_STORE_ERROR_MESSAGES = {
  [DWON_STORE_STATUS_CODES.BAD_REQUEST]: '잘못된 요청입니다.',
  [DWON_STORE_STATUS_CODES.UNAUTHORIZED]: '인증이 필요합니다.',
  [DWON_STORE_STATUS_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
  [DWON_STORE_STATUS_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [DWON_STORE_STATUS_CODES.TOO_MANY_REQUESTS]: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  [DWON_STORE_STATUS_CODES.INTERNAL_SERVER_ERROR]: '서버 오류가 발생했습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;
