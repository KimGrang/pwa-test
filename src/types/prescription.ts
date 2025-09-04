/**
 * 처방전 타입 (DB prescriptions 테이블 기반)
 */
export interface Prescription {
  id: number;
  record_id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  special_instructions?: string;
  created_at: string;
}

/**
 * 처방전 생성 요청 타입
 */
export interface CreatePrescriptionRequest {
  record_id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  special_instructions?: string;
}

/**
 * 처방전 업데이트 요청 타입
 */
export interface UpdatePrescriptionRequest {
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration_days?: number;
  special_instructions?: string;
}
