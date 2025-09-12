/**
 * 진료 기록 타입 (API 응답 기반)
 */
export interface MedicalRecord {
  id: number;
  petId: number;
  hospitalId: number;
  vetId: number;
  visitDate: string; // API 응답에서는 visitDate 사용
  chiefComplaint: string;
  examinationNotes: string;
  treatmentPlan: string;
  followUp: string;
  createdAt: string;
}

/**
 * 진료 기록 생성 요청 타입
 */
export interface CreateMedicalRecordRequest {
  pet_id: number;
  hospital_id: number;
  vet_id: number;
  visit_date: string;
  chief_complaint: string;
  examination_notes?: string;
  treatment_plan?: string;
  follow_up?: string;
}

/**
 * 진료 기록 업데이트 요청 타입
 */
export interface UpdateMedicalRecordRequest {
  visit_date?: string;
  chief_complaint?: string;
  examination_notes?: string;
  treatment_plan?: string;
  follow_up?: string;
}

/**
 * 진료기록 상세 조회 응답 타입 (diagnosis, prescription 포함)
 */
export interface MedicalRecordDetail {
  diagnosis: Array<{
    id: number;
    recordId: number;
    ownerName: string;
    animalType: string;
    breed: string;
    animalName: string;
    gender: string;
    age: string;
    diseaseName: string;
    diagnosisDate: string;
    prognosis: string;
    shared: boolean;
  }>;
  prescriptions: Array<{
    id: number;
    recordId: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    specialInstructions?: string;
  }>;
}
