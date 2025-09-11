/**
 * 사용자 타입 (DB users 테이블 기반)
 */
export interface User {
  id: number;
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  address?: string;
  social_id?: string;
  SNS?: 'GOOGLE' | 'KAKAO' | 'APPLE' | 'TEST';
  role: 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER';
  hospitalId?: number;
  isTestAccount?: boolean;
  createdAt: string; // API 가이드와 일치하도록 camelCase로 변경
  updatedAt?: string;
}

/**
 * 사용자 생성 요청 타입
 */
export interface CreateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  address?: string;
  social_id?: string;
  SNS?: string;
}

/**
 * 사용자 업데이트 요청 타입
 */
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  hospitalId?: number;
}
