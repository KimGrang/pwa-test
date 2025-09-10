import { useState, useCallback } from 'react';
import useAxios from './useAxios';
import { Pet, CreatePetRequest, UpdatePetRequest, PetResponse, PetListResponse } from '../types';
import { getCurrentConfig } from '../config/dwon-store-config';

/**
 * 반려동물 API 전용 훅
 * API 문서에 맞춰 구현된 반려동물 관련 기능들을 제공
 */

interface UsePetAPIReturn {
  // 상태
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  error: string | null;

  // CRUD 작업
  createPet: (petData: CreatePetRequest) => Promise<Pet | null>;
  updatePet: (id: number, petData: UpdatePetRequest) => Promise<Pet | null>;
  deletePet: (id: number) => Promise<Pet | null>;

  // 조회 작업
  fetchMyPets: (page?: number, limit?: number) => Promise<Pet[] | null>;
  fetchPetById: (id: number) => Promise<Pet | null>;
  fetchAllPets: (page?: number, limit?: number) => Promise<Pet[] | null>;

  // 유틸리티
  clearError: () => void;
  clearPets: () => void;
  setCurrentPet: (pet: Pet | null) => void;
}

export const usePetAPIHook = (): UsePetAPIReturn => {
  const { loading, error, get, post, patch, del, clearError } = useAxios<PetResponse | PetListResponse>(
    `${getCurrentConfig().BASE_URL}/pets`
  );
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);

  // 반려동물 등록
  const createPet = useCallback(
    async (petData: CreatePetRequest): Promise<Pet | null> => {
      const response = await post('/', petData);
      if (response && 'data' in response && !Array.isArray(response.data)) {
        // PetResponse인 경우
        const newPet = response.data;
        setPets((prev) => [...prev, newPet]);
        return newPet;
      }
      return null;
    },
    [post]
  );

  // 반려동물 정보 수정
  const updatePet = useCallback(
    async (id: number, petData: UpdatePetRequest): Promise<Pet | null> => {
      const response = await patch(`/${id}`, petData);
      if (response && 'data' in response && !Array.isArray(response.data)) {
        const updatedPet = response.data;
        setPets((prev) => prev.map((pet) => (pet.id === id ? updatedPet : pet)));
        if (currentPet?.id === id) {
          setCurrentPet(updatedPet);
        }
        return updatedPet;
      }
      return null;
    },
    [patch, currentPet]
  );

  // 반려동물 삭제
  const deletePet = useCallback(
    async (id: number): Promise<Pet | null> => {
      const response = await del(`/${id}`);
      if (response && 'data' in response && !Array.isArray(response.data)) {
        const deletedPet = response.data;
        setPets((prev) => prev.filter((pet) => pet.id !== id));
        if (currentPet?.id === id) {
          setCurrentPet(null);
        }
        return deletedPet;
      }
      return null;
    },
    [del, currentPet]
  );

  // 내 반려동물 목록 조회
  const fetchMyPets = useCallback(
    async (page: number = 1, limit: number = 10): Promise<Pet[] | null> => {
      try {
        const response = await get(`/my-pets?page=${page}&limit=${limit}`);
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          setPets(response.data);
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('반려동물 목록 조회 오류:', error);
        return null;
      }
    },
    [get]
  );

  // 특정 반려동물 조회
  const fetchPetById = useCallback(
    async (id: number): Promise<Pet | null> => {
      const response = await get(`/${id}`);
      if (response && 'data' in response && !Array.isArray(response.data)) {
        const pet = response.data;
        setCurrentPet(pet);
        return pet;
      }
      return null;
    },
    [get]
  );

  // 전체 반려동물 조회 (관리자용)
  const fetchAllPets = useCallback(
    async (page: number = 1, limit: number = 10): Promise<Pet[] | null> => {
      const response = await get(`?page=${page}&limit=${limit}`);
      if (response && 'data' in response && Array.isArray(response.data)) {
        setPets(response.data);
        return response.data;
      }
      return null;
    },
    [get]
  );

  // 에러 초기화 (useAxios에서 가져온 clearError 사용)

  // 반려동물 목록 초기화
  const clearPets = useCallback(() => {
    setPets([]);
    setCurrentPet(null);
  }, []);

  return {
    // 상태
    pets,
    currentPet,
    loading,
    error,

    // CRUD 작업
    createPet,
    updatePet,
    deletePet,

    // 조회 작업
    fetchMyPets,
    fetchPetById,
    fetchAllPets,

    // 유틸리티
    clearError,
    clearPets,
    setCurrentPet,
  };
};

export default usePetAPIHook;
