import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 진료 기록 인터페이스 (백엔드 API 응답 구조에 맞춤)
 */
interface MedicalRecord {
  id: number;
  petId: number;
  hospitalId: number;
  vetId: number;
  visitDate: string;
  chiefComplaint: string;
  examinationNotes: string;
  treatmentPlan: string;
  followUp: string;
  createdAt: string;
}

/**
 * 진료 기록 상태 인터페이스
 */
interface RecordState {
  // 진료 기록 목록
  records: MedicalRecord[];

  // 선택된 기록
  selectedRecord: MedicalRecord | null;

  // 필터링 및 검색
  filters: {
    petId?: number;
    dateRange?: {
      start: string;
      end: string;
    };
    hospitalId?: number;
  };

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setRecords: (records: MedicalRecord[]) => void;
  setSelectedRecord: (record: MedicalRecord | null) => void;
  addRecord: (record: MedicalRecord) => void;
  updateRecord: (id: number, updates: Partial<MedicalRecord>) => void;
  removeRecord: (id: number) => void;
  setFilters: (filters: Partial<RecordState['filters']>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 유틸리티 함수
  getRecordsByDate: (date: string) => MedicalRecord[];
  getRecordsByPet: (petId: number) => MedicalRecord[];
  getRecordsByHospital: (hospitalId: number) => MedicalRecord[];
}

/**
 * 진료 기록 스토어 생성
 */
export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      records: [],
      selectedRecord: null,
      filters: {},
      isLoading: false,
      error: null,

      // 액션
      setRecords: (records: MedicalRecord[]) => set({ records }),

      setSelectedRecord: (record: MedicalRecord | null) => set({ selectedRecord: record }),

      addRecord: (record: MedicalRecord) => {
        const { records } = get();
        set({ records: [...records, record] });
      },

      updateRecord: (id: number, updates: Partial<MedicalRecord>) => {
        const { records, selectedRecord } = get();
        const updatedRecords = records.map((record) => (record.id === id ? { ...record, ...updates } : record));

        set({ records: updatedRecords });

        // selectedRecord도 업데이트
        if (selectedRecord?.id === id) {
          set({ selectedRecord: { ...selectedRecord, ...updates } });
        }
      },

      removeRecord: (id: number) => {
        const { records, selectedRecord } = get();
        const filteredRecords = records.filter((record) => record.id !== id);

        set({ records: filteredRecords });

        // selectedRecord 정리
        if (selectedRecord?.id === id) {
          set({ selectedRecord: null });
        }
      },

      setFilters: (filters: Partial<RecordState['filters']>) => {
        const { filters: currentFilters } = get();
        set({ filters: { ...currentFilters, ...filters } });
      },

      clearFilters: () => set({ filters: {} }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      // 유틸리티 함수
      getRecordsByDate: (date: string) => {
        const { records } = get();
        return records.filter((record) => record.visitDate.startsWith(date));
      },

      getRecordsByPet: (petId: number) => {
        const { records } = get();
        return records.filter((record) => record.petId === petId);
      },

      getRecordsByHospital: (hospitalId: number) => {
        const { records } = get();
        return records.filter((record) => record.hospitalId === hospitalId);
      },
    }),
    {
      name: 'record-store',
      partialize: (state) => ({
        records: state.records,
        selectedRecord: state.selectedRecord,
        filters: state.filters,
      }),
    }
  )
);
