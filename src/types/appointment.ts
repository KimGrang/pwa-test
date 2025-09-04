/**
 * 예약 타입 (DB appointments 테이블 기반)
 */
export interface Appointment {
  id: number;
  hospital_id: number;
  pet_id: number;
  user_id: number;
  vet_id?: number;
  schedule_time: string;
  purpose: string;
  symptoms?: string;
  notes?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  confirmation_code?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 예약 생성 요청 타입
 */
export interface CreateAppointmentRequest {
  hospital_id: number;
  pet_id: number;
  user_id: number;
  vet_id?: number;
  schedule_time: string;
  purpose: string;
  symptoms?: string;
  notes?: string;
}

/**
 * 예약 업데이트 요청 타입
 */
export interface UpdateAppointmentRequest {
  vet_id?: number;
  schedule_time?: string;
  purpose?: string;
  symptoms?: string;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
