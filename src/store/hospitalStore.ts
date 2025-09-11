import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hospital } from '../types/hospital';

/**
 * 병원 상태 인터페이스
 */
interface HospitalState {
  // 병원 목록
  hospitals: Hospital[];

  // 사용자의 병원
  myHospital: Hospital | null;

  // 선택된 병원
  selectedHospital: Hospital | null;

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setHospitals: (hospitals: Hospital[]) => void;
  setMyHospital: (hospital: Hospital | null) => void;
  setSelectedHospital: (hospital: Hospital | null) => void;
  addHospital: (hospital: Hospital) => void;
  updateHospital: (id: number, updates: Partial<Hospital>) => void;
  removeHospital: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAll: () => void;
}

/**
 * 병원 스토어 생성
 */
export const useHospitalStore = create<HospitalState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      hospitals: [],
      myHospital: null,
      selectedHospital: null,
      isLoading: false,
      error: null,

      // 액션
      setHospitals: (hospitals: Hospital[]) => set({ hospitals }),

      setMyHospital: (hospital: Hospital | null) => set({ myHospital: hospital }),

      setSelectedHospital: (hospital: Hospital | null) => set({ selectedHospital: hospital }),

      addHospital: (hospital: Hospital) => {
        const { hospitals } = get();
        set({ hospitals: [...hospitals, hospital] });
      },

      updateHospital: (id: number, updates: Partial<Hospital>) => {
        const { hospitals, myHospital } = get();
        const updatedHospitals = hospitals.map((hospital) =>
          hospital.id === id ? { ...hospital, ...updates } : hospital
        );

        set({ hospitals: updatedHospitals });

        // myHospital도 업데이트
        if (myHospital?.id === id) {
          set({ myHospital: { ...myHospital, ...updates } });
        }
      },

      removeHospital: (id: number) => {
        const { hospitals, myHospital, selectedHospital } = get();
        const filteredHospitals = hospitals.filter((hospital) => hospital.id !== id);

        set({ hospitals: filteredHospitals });

        // 관련 상태 정리
        if (myHospital?.id === id) {
          set({ myHospital: null });
        }
        if (selectedHospital?.id === id) {
          set({ selectedHospital: null });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      clearAll: () =>
        set({
          hospitals: [],
          myHospital: null,
          selectedHospital: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'hospital-store',
      partialize: (state) => ({
        hospitals: state.hospitals,
        myHospital: state.myHospital,
        selectedHospital: state.selectedHospital,
      }),
    }
  )
);

// Hospital 타입 re-export
export type { Hospital } from '../types/hospital';
