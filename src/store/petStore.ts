import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiInstance } from '../config/axios-config';
import { API_ENDPOINTS, buildPaginatedEndpoint } from '../config/api-endpoints';
import { ApiResponse } from '../types';
import { Pet, CreatePetRequest, PetWithRecordsResponse } from '../types/pet';

/**
 * 페이지네이션 파라미터
 */
interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 반려동물 상태 인터페이스
 */
interface PetState {
  // 반려동물 목록
  pets: Pet[];

  // 선택된 반려동물
  selectedPet: Pet | null;

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 데이터 새로고침 필요 여부
  needsRefresh: boolean;

  // 페이지네이션 정보
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // 기본 액션
  setPets: (pets: Pet[]) => void;
  setSelectedPet: (pet: Pet | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: number, updates: Partial<Pet>) => void;
  removePet: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setPagination: (pagination: { page: number; limit: number; total: number }) => void;
  setNeedsRefresh: (needsRefresh: boolean) => void;

  // 유틸리티 함수
  getPetById: (id: number) => Pet | undefined;
  getPetsByUserId: (userId: number) => Pet[];

  // 전체 데이터 삭제
  clearAll: () => void;

  // API 액션
  getMyPets: (params?: PaginationParams) => Promise<Pet[] | null>;
  getMyPetsWithRecords: () => Promise<PetWithRecordsResponse | null>;
  getPetByIdAPI: (id: number) => Promise<Pet | null>;
  createPet: (petData: CreatePetRequest) => Promise<Pet | null>;
  updatePetAPI: (id: number, petData: Partial<CreatePetRequest>) => Promise<Pet | null>;
  deletePetAPI: (id: number) => Promise<boolean>;
  getAllPets: (params?: PaginationParams) => Promise<Pet[] | null>;
}

/**
 * 반려동물 스토어 생성
 */
export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      pets: [],
      selectedPet: null,
      isLoading: false,
      error: null,
      needsRefresh: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },

      // 기본 액션
      setPets: (pets: Pet[]) => set({ pets }),

      setSelectedPet: (pet: Pet | null) => set({ selectedPet: pet }),

      addPet: (pet: Pet) => {
        const { pets } = get();
        set({ pets: [...pets, pet] });
      },

      updatePet: (id: number, updates: Partial<Pet>) => {
        const { pets, selectedPet } = get();
        const updatedPets = pets.map((pet) => (pet.id === id ? { ...pet, ...updates } : pet));

        set({ pets: updatedPets });

        // selectedPet도 업데이트
        if (selectedPet?.id === id) {
          set({ selectedPet: { ...selectedPet, ...updates } });
        }
      },

      removePet: (id: number) => {
        const { pets, selectedPet } = get();
        const filteredPets = pets.filter((pet) => pet.id !== id);

        set({ pets: filteredPets });

        // selectedPet 정리
        if (selectedPet?.id === id) {
          set({ selectedPet: null });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      setPagination: (pagination: { page: number; limit: number; total: number }) => set({ pagination }),

      setNeedsRefresh: (needsRefresh: boolean) => set({ needsRefresh }),

      // 유틸리티 함수
      getPetById: (id: number) => {
        const { pets } = get();
        return pets.find((pet) => pet.id === id);
      },

      getPetsByUserId: (userId: number) => {
        const { pets } = get();
        return pets.filter((pet) => pet.userId === userId);
      },

      clearAll: () =>
        set({
          pets: [],
          selectedPet: null,
          isLoading: false,
          error: null,
          needsRefresh: false,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
          },
        }),

      // API 액션들
      getMyPets: async (params: PaginationParams = {}) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.PETS.MY_PETS, params.page, params.limit);
          const response = await apiInstance.get<ApiResponse<Pet[]>>(endpoint);

          if (response.data?.data) {
            const pets = response.data.data;
            set({
              pets,
              isLoading: false,
            });
            return pets;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '반려동물 목록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      getMyPetsWithRecords: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.get<PetWithRecordsResponse>(API_ENDPOINTS.PETS.MY_PETS_WITH_RECORDS);

          if (response.data) {
            // PetWithRecordsResponse의 구조에 따라 pets 데이터 추출
            const pets = response.data.data || response.data;
            if (Array.isArray(pets)) {
              set({
                pets,
                isLoading: false,
              });
            }
            return response.data;
          }
          return null;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '반려동물과 진료기록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      getPetByIdAPI: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.get<ApiResponse<Pet>>(API_ENDPOINTS.PETS.DETAIL(id));

          if (response.data?.data) {
            const pet = response.data.data;
            set({
              selectedPet: pet,
              isLoading: false,
            });
            return pet;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '반려동물 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      createPet: async (petData: CreatePetRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<Pet>>(API_ENDPOINTS.PETS.CREATE, petData);

          if (response.data?.data) {
            const newPet = response.data.data;
            const { pets } = get();
            set({
              pets: [...pets, newPet],
              isLoading: false,
            });
            return newPet;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '반려동물 등록 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      updatePetAPI: async (id: number, petData: Partial<CreatePetRequest>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.patch<ApiResponse<Pet>>(API_ENDPOINTS.PETS.DETAIL(id), petData);

          if (response.data?.data) {
            const updatedPet = response.data.data;
            const { pets, selectedPet } = get();

            const updatedPets = pets.map((pet) => (pet.id === id ? updatedPet : pet));

            set({
              pets: updatedPets,
              selectedPet: selectedPet?.id === id ? updatedPet : selectedPet,
              isLoading: false,
            });
            return updatedPet;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '반려동물 수정 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      deletePetAPI: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.delete(API_ENDPOINTS.PETS.DETAIL(id));

          const { pets, selectedPet } = get();
          const filteredPets = pets.filter((pet) => pet.id !== id);

          set({
            pets: filteredPets,
            selectedPet: selectedPet?.id === id ? null : selectedPet,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '반려동물 삭제 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      getAllPets: async (params: PaginationParams = {}) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.PETS.LIST, params.page, params.limit);
          const response = await apiInstance.get<ApiResponse<Pet[]>>(endpoint);

          if (response.data?.data) {
            const pets = response.data.data;
            set({
              pets,
              isLoading: false,
            });
            return pets;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '전체 반려동물 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: 'pet-store',
      partialize: (state) => ({
        pets: state.pets,
        selectedPet: state.selectedPet,
        pagination: state.pagination,
      }),
    }
  )
);
