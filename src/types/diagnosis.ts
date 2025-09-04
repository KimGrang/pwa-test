/**
 * 수의사 진단서 타입 (실제 진단서 양식 기반)
 */
export interface VeterinaryDiagnosis {
  id: number;

  // 동물 소유자(관리인) 정보
  owner: {
    name: string;
    address: string;
    phone: string;
    id_number?: string; // 신분증 번호
  };

  // 사육 장소
  breeding_location: {
    address: string;
    type: '가정' | '농장' | '시설' | '기타';
    description?: string;
  };

  // 동물의 표시
  animal_identification: {
    species: string; // 종류 (개, 고양이, 토끼 등)
    breed: string; // 품종
    animal_name: string; // 동물명
    gender: 'MALE' | 'FEMALE' | 'NEUTERED_MALE' | 'SPAYED_FEMALE';
    age: {
      years?: number;
      months?: number;
      birth_date?: string;
    };
    characteristics: string; // 특징 (털색, 크기, 특이사항 등)
    identification_method?: '마이크로칩' | '등록번호' | '기타';
    identification_number?: string;
  };

  // 진단 관련 정보
  diagnosis_info: {
    disease_name: string; // 병명
    disease_code?: string; // 질병 코드
    onset_date?: string; // 발병 연월일
    diagnosis_date: string; // 진단 연월일
    prognosis: '양호' | '주의' | '불량' | '회복' | '기타'; // 예후 소견
    prognosis_details?: string; // 예후 상세 내용
  };

  // 진단 세부 사항
  clinical_findings: {
    symptoms: string[]; // 임상 증상
    examination_results: string; // 검사 결과
    diagnostic_method: string[]; // 진단 방법
    treatment_plan?: string; // 치료 계획
  };

  // 그 밖의 사항
  additional_notes?: {
    quarantine_required?: boolean; // 격리 필요 여부
    reporting_required?: boolean; // 신고 필요 여부
    follow_up_date?: string; // 재진 날짜
    special_instructions?: string; // 특별 지시사항
    other_remarks?: string; // 기타 사항
  };

  // 발급 정보
  issuance_info: {
    hospital_id: number;
    vet_id: number;
    issue_date: string; // 발급일
    purpose: string; // 발급 목적
    validity_period?: string; // 유효기간
  };

  // 시스템 정보
  created_at: string;
  updated_at: string;
}

/**
 * 진단서 생성 요청 타입
 */
export interface CreateDiagnosisRequest {
  owner: VeterinaryDiagnosis['owner'];
  breeding_location: VeterinaryDiagnosis['breeding_location'];
  animal_identification: VeterinaryDiagnosis['animal_identification'];
  diagnosis_info: VeterinaryDiagnosis['diagnosis_info'];
  clinical_findings: VeterinaryDiagnosis['clinical_findings'];
  additional_notes?: VeterinaryDiagnosis['additional_notes'];
  issuance_info: Omit<VeterinaryDiagnosis['issuance_info'], 'issue_date'>;
}

/**
 * 진단서 업데이트 요청 타입
 */
export interface UpdateDiagnosisRequest {
  owner?: Partial<VeterinaryDiagnosis['owner']>;
  breeding_location?: Partial<VeterinaryDiagnosis['breeding_location']>;
  animal_identification?: Partial<VeterinaryDiagnosis['animal_identification']>;
  diagnosis_info?: Partial<VeterinaryDiagnosis['diagnosis_info']>;
  clinical_findings?: Partial<VeterinaryDiagnosis['clinical_findings']>;
  additional_notes?: Partial<VeterinaryDiagnosis['additional_notes']>;
  issuance_info?: Partial<VeterinaryDiagnosis['issuance_info']>;
}

/**
 * 진단서 조회 필터 타입
 */
export interface DiagnosisFilter {
  hospital_id?: number;
  vet_id?: number;
  owner_name?: string;
  animal_name?: string;
  disease_name?: string;
  diagnosis_date_from?: string;
  diagnosis_date_to?: string;
  prognosis?: VeterinaryDiagnosis['diagnosis_info']['prognosis'];
}

/**
 * 진단서 목록 조회 응답 타입
 */
export interface DiagnosisListResponse {
  diagnoses: VeterinaryDiagnosis[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}
