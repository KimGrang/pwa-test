/**
 * 병원 타입 (API 응답 구조 기반)
 */
export interface Hospital {
  id: number;
  name: string;
  licenseNumber: string; // API 응답에서는 camelCase
  address: string;
  phone: string;
  email?: string;
  business_hours?: Record<string, unknown>; // JSON 타입 (기존 호환성 유지)
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  latitude?: number;
  longitude?: number;
}

/**
 * 내 병원 정보 응답 타입
 */
export interface MyHospitalResponse {
  hospital: Hospital;
  userInfo: {
    id: number;
    name: string;
    role: string;
    email: string;
  };
}

/**
 * 병원 생성 요청 타입
 */
export interface CreateHospitalRequest {
  name: string;
  licenseNumber: string; // API 가이드와 일치하도록 camelCase로 변경
  address: string;
  phone: string;
  email?: string;
  description?: string; // API 가이드에 맞춰 추가
  specialties: string[]; // API 가이드에 맞춰 필수로 변경
  services: string[]; // API 가이드에 맞춰 필수로 변경
  facilities: string[]; // API 가이드에 맞춰 필수로 변경
  latitude: number; // API 가이드에 맞춰 필수로 변경
  longitude: number; // API 가이드에 맞춰 필수로 변경
}

/**
 * 병원 업데이트 요청 타입
 */
export interface UpdateHospitalRequest {
  name?: string;
  licenseNumber?: string; // API 가이드와 일치하도록 camelCase로 변경
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  latitude?: number;
  longitude?: number;
}
