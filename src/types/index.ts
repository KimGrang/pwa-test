// PWA 프로젝트 타입 모음

// API 응답 타입
export * from './api';

// 인증 관련 타입 (User 타입 제외)
export type {
  LoginCredentials,
  TokenCredentials,
  RegisterCredentials,
  AuthResponse,
  LoginResponse,
  AuthState,
} from './auth';

// AI 상담 및 채팅 관련 타입
export * from './ai-consultation';

// 네비게이션 타입 (React Router 기반)
export * from './navigation';

// 예약 관련 타입
export * from './appointment';

// 처방전 관련 타입
export * from './prescription';

// PWA 관련 타입
export * from './pwa';

// 반려동물 관련 타입 (Hospital, Vet 타입 제외)
export type {
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  PetListResponse,
  PetResponse,
  PetWithMedicalRecords,
  PetWithRecordsResponse,
} from './pet';

// 병원 관련 타입
export * from './hospital';

// 진단 관련 타입
export * from './diagnosis';

// 의료 기록 관련 타입
export * from './medical-record';

// 사용자 관련 타입
export * from './user';

// 수의사 관련 타입 (Vet 타입은 pet.ts에서도 정의되어 있으므로 제외)
export type { CreateVetRequest, UpdateVetRequest } from './vet';

// 약관 관련 타입
export * from './terms';

// LLM 관련 타입
export * from './llama';
