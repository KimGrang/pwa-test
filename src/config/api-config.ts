/**
 * API 설정 및 엔드포인트 상수
 */

// API 기본 설정
export const API_CONFIG = {
  // example.com 백엔드 API
  DWON_STORE: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    TIMEOUT: 10000,
  },
  // 로컬 개발 환경
  LOCAL_DEV: {
    BASE_URL: 'http://localhost:4000/api',
    TIMEOUT: 10000,
  },
  // 기타 외부 API
  EXTERNAL: {
    TIMEOUT: 30000,
  },
};

// API 엔드포인트 상수
export const API_ENDPOINTS = {
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

  // 채팅 관련 (추가)
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    SESSIONS: '/chat/sessions',
    SESSION_MESSAGES: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
    CREATE_SESSION: '/chat/sessions',
  },
};

// 요청 헤더 기본값
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
};
