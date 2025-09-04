import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 반려동물 인터페이스 (백엔드 API 응답 구조에 맞춤)
 */
interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  weight: number;
  color: string;
  birthDate: string;
  microchipNumber?: string;
  ownerId: number;
  hospitalId: number;
  createdAt: string;
  updatedAt: string;
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

  // 액션
  setPets: (pets: Pet[]) => void;
  setSelectedPet: (pet: Pet | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: number, updates: Partial<Pet>) => void;
  removePet: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 유틸리티 함수
  getPetById: (id: number) => Pet | undefined;
  getPetsByOwner: (ownerId: number) => Pet[];
  getPetsByHospital: (hospitalId: number) => Pet[];
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

      // 유틸리티 함수
      getPetById: (id: number) => {
        const { pets } = get();
        return pets.find((pet) => pet.id === id);
      },

      getPetsByOwner: (ownerId: number) => {
        const { pets } = get();
        return pets.filter((pet) => pet.ownerId === ownerId);
      },

      getPetsByHospital: (hospitalId: number) => {
        const { pets } = get();
        return pets.filter((pet) => pet.hospitalId === hospitalId);
      },
    }),
    {
      name: 'pet-store',
      partialize: (state) => ({
        pets: state.pets,
        selectedPet: state.selectedPet,
      }),
    }
  )
);
