/**
 * 반려동물 타입 (백엔드 API 응답 기반)
 */
export interface Pet {
  id: number;
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER'; // API 가이드에 맞춰 추가
  breed: string; // API 가이드에 맞춰 추가
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  weight?: number;
  neutered: boolean;
  medicalHistory?: string; // API 가이드에 맞춰 추가
  profileImageUrl?: string | null;
  userId: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 반려동물 생성 요청 타입
 */
export interface CreatePetRequest {
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER'; // API 가이드에 맞춰 추가
  breed: string; // API 가이드에 맞춰 추가
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  weight?: number;
  neutered: boolean;
  medicalHistory?: string; // API 가이드에 맞춰 추가
  profileImageUrl?: string;
}

/**
 * 반려동물 업데이트 요청 타입
 */
export interface UpdatePetRequest {
  name?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  weight?: number;
  neutered?: boolean;
  profileImageUrl?: string;
}
