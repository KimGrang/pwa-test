import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { API_ENDPOINTS, buildPaginatedEndpoint } from '../config/api-endpoints';
import { ApiResponse } from '../types';
import { CreateMedicalRecordRequest } from '../types/medical-record';

/**
 * 진료기록 관련 API 훅
 */

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const useMedicalRecordsAPI = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useApiClient<ApiResponse<unknown>>();

  // 특정 반려동물의 진료기록 조회
  const getRecordsByPet = useCallback(
    (petId: number, params: PaginationParams = {}) => {
      const baseEndpoint = API_ENDPOINTS.MEDICAL_RECORDS.BY_PET(petId);
      const endpoint = buildPaginatedEndpoint(baseEndpoint, params.page, params.limit);
      return get(endpoint);
    },
    [get]
  );

  // 진료기록 생성
  const createRecord = useCallback(
    (recordData: CreateMedicalRecordRequest) => {
      return post(API_ENDPOINTS.MEDICAL_RECORDS.CREATE, recordData);
    },
    [post]
  );

  // 특정 진료기록 조회
  const getRecordById = useCallback(
    (id: number) => {
      return get(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id));
    },
    [get]
  );

  // 진료기록 수정
  const updateRecord = useCallback(
    (id: number, recordData: Partial<CreateMedicalRecordRequest>) => {
      return patch(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id), recordData);
    },
    [patch]
  );

  // 진료기록 삭제
  const deleteRecord = useCallback(
    (id: number) => {
      return del(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id));
    },
    [del]
  );

  // 진료기록 상세 조회 (추가 정보 포함)
  const getRecordDetail = useCallback(
    (id: number) => {
      return get(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL_WITH_RELATIONS(id));
    },
    [get]
  );

  // 모든 진료기록 조회 (관리자용)
  const getAllRecords = useCallback(
    (params: PaginationParams = {}) => {
      const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.MEDICAL_RECORDS.LIST, params.page, params.limit);
      return get(endpoint);
    },
    [get]
  );

  return {
    // 상태
    recordsData: data?.data || null,
    loading,
    error,

    // 조회 액션
    getRecordsByPet,
    getRecordById,
    getRecordDetail,
    getAllRecords,

    // CRUD 액션
    createRecord,
    updateRecord,
    deleteRecord,

    // 유틸리티
    clearError,
  };
};

export default useMedicalRecordsAPI;
