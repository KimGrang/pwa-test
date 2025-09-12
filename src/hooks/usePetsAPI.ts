import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { API_ENDPOINTS, buildPaginatedEndpoint } from '../config/api-endpoints';
import { ApiResponse } from '../types';
import { CreatePetRequest, PetWithRecordsResponse } from '../types/pet';

/**
 * 반려동물 관련 API 훅
 */

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const usePetsAPI = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useApiClient<ApiResponse<unknown>>();

  // 내 반려동물 목록 조회 (기존 API)
  const getMyPets = useCallback(
    (params: PaginationParams = {}) => {
      const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.PETS.MY_PETS, params.page, params.limit);
      return get(endpoint);
    },
    [get]
  );

  // 내 반려동물과 진료기록 함께 조회 (N+1 문제 해결)
  const getMyPetsWithRecords = useCallback(() => {
    return get(API_ENDPOINTS.PETS.MY_PETS_WITH_RECORDS) as Promise<PetWithRecordsResponse | null>;
  }, [get]);

  // 특정 반려동물 조회
  const getPetById = useCallback(
    (id: number) => {
      return get(API_ENDPOINTS.PETS.DETAIL(id));
    },
    [get]
  );

  // 반려동물 등록
  const createPet = useCallback(
    (petData: CreatePetRequest) => {
      return post(API_ENDPOINTS.PETS.CREATE, petData);
    },
    [post]
  );

  // 반려동물 정보 수정
  const updatePet = useCallback(
    (id: number, petData: Partial<CreatePetRequest>) => {
      return patch(API_ENDPOINTS.PETS.DETAIL(id), petData);
    },
    [patch]
  );

  // 반려동물 삭제
  const deletePet = useCallback(
    (id: number) => {
      return del(API_ENDPOINTS.PETS.DETAIL(id));
    },
    [del]
  );

  // 전체 반려동물 조회 (관리자용)
  const getAllPets = useCallback(
    (params: PaginationParams = {}) => {
      const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.PETS.LIST, params.page, params.limit);
      return get(endpoint);
    },
    [get]
  );

  return {
    // 상태
    petsData: data?.data || null,
    loading,
    error,

    // 조회 액션
    getMyPets,
    getMyPetsWithRecords,
    getPetById,
    getAllPets,

    // CRUD 액션
    createPet,
    updatePet,
    deletePet,

    // 유틸리티
    clearError,
  };
};

export default usePetsAPI;
