/**
 * 병원 타입 (백엔드 API 응답 구조에 맞춤)
 */
export interface Hospital {
  id: number;
  name: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  services: string[];
  facilities: string[];
  latitude: number;
  longitude: number;
  userInfo?: {
    id: number;
    name: string;
    role: string;
    email: string;
  };
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
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  services: string[];
  facilities: string[];
  latitude: number;
  longitude: number;
}

/**
 * 병원 업데이트 요청 타입
 */
export interface UpdateHospitalRequest {
  name?: string;
  licenseNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  latitude?: number;
  longitude?: number;
}
