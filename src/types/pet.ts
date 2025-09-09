/**
 * 반려동물 타입 (백엔드 API 응답 기반)
 * API 문서에 맞춰 수정
 */
export interface Pet {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  weight?: number;
  neutered: boolean;
  birthDate?: string;
  medicalHistory?: string;
  profileImageUrl?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 반려동물 생성 요청 타입
 * API 문서에 맞춰 수정
 */
export interface CreatePetRequest {
  name: string; // 필수: 반려동물 이름
  gender: 'MALE' | 'FEMALE'; // 필수: 성별
  weight?: number; // 선택: 체중 (kg)
  neutered?: boolean; // 선택: 중성화 여부 (기본값: false)
  birthDate?: string; // 선택: 출생일
  medicalHistory?: string; // 선택: 의료 기록
  profileImageUrl?: string | null; // 선택: 프로필 이미지 URL
}

/**
 * 반려동물 업데이트 요청 타입
 * API 문서에 맞춰 수정 (모든 필드 선택사항)
 */
export interface UpdatePetRequest {
  name?: string;
  weight?: number;
  neutered?: boolean;
  birthDate?: string;
  medicalHistory?: string;
  profileImageUrl?: string | null;
}

/**
 * 반려동물 목록 조회 응답 타입
 */
export interface PetListResponse {
  success: boolean;
  data: Pet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * 반려동물 단일 조회 응답 타입
 */
export interface PetResponse {
  success: boolean;
  data: Pet;
  message: string;
}

/**
 * 병원 정보 타입 (진료기록에 포함)
 */
export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
}

/**
 * 수의사 정보 타입 (진료기록에 포함)
 */
export interface Vet {
  id: number;
  name: string;
  licenseNumber: string;
  specialization: string;
}

/**
 * 진료기록이 포함된 반려동물 타입 (N+1 문제 해결용)
 */
export interface PetWithMedicalRecords extends Pet {
  medicalRecords: Array<{
    id: number;
    petId: number;
    hospitalId: number;
    vetId: number;
    visitDate: string;
    chiefComplaint: string;
    examinationNotes: string;
    treatmentPlan: string;
    followUp: string;
    createdAt: string;
    updatedAt: string;
    hospital: Hospital;
    vet: Vet;
  }>;
}

/**
 * 반려동물과 진료기록 함께 조회 응답 타입
 */
export interface PetWithRecordsResponse {
  success: boolean;
  data: PetWithMedicalRecords[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
