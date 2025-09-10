import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pet } from '../types/pet';

/**
 * 반려동물 상태 인터페이스
 * API 문서에 맞춰 업데이트
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

  // 액션
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

      // 액션
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
