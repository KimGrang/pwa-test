/**
 * 수의사 타입 (DB vets 테이블 기반)
 */
export interface Vet {
  id: number;
  name: string;
  specialization?: string;
  profile_image_url?: string;
  hospital_id: number;
}

/**
 * 수의사 생성 요청 타입
 */
export interface CreateVetRequest {
  name: string;
  specialization?: string;
  profile_image_url?: string;
  hospital_id: number;
}

/**
 * 수의사 업데이트 요청 타입
 */
export interface UpdateVetRequest {
  name?: string;
  specialization?: string;
  profile_image_url?: string;
}
