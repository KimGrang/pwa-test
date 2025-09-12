import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiInstance } from '../config/axios-config';
import { API_ENDPOINTS, buildPaginatedEndpoint } from '../config/api-endpoints';
import { ApiResponse } from '../types';
import { CreateMedicalRecordRequest } from '../types/medical-record';

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
 * 페이지네이션 파라미터
 */
interface PaginationParams {
  page?: number;
  limit?: number;
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

  // 기본 액션
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

  // 전체 데이터 삭제
  clearAll: () => void;

  // API 액션
  getRecordsByPetAPI: (petId: number, params?: PaginationParams) => Promise<MedicalRecord[] | null>;
  createRecord: (recordData: CreateMedicalRecordRequest) => Promise<MedicalRecord | null>;
  getRecordByIdAPI: (id: number) => Promise<MedicalRecord | null>;
  updateRecordAPI: (id: number, recordData: Partial<CreateMedicalRecordRequest>) => Promise<MedicalRecord | null>;
  deleteRecordAPI: (id: number) => Promise<boolean>;
  getRecordDetail: (id: number) => Promise<MedicalRecord | null>;
  getAllRecords: (params?: PaginationParams) => Promise<MedicalRecord[] | null>;
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

      // 기본 액션
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

      clearAll: () =>
        set({
          records: [],
          selectedRecord: null,
          filters: {},
          isLoading: false,
          error: null,
        }),

      // API 액션들
      getRecordsByPetAPI: async (petId: number, params: PaginationParams = {}) => {
        set({ isLoading: true, error: null });
        try {
          const baseEndpoint = API_ENDPOINTS.MEDICAL_RECORDS.BY_PET(petId);
          const endpoint = buildPaginatedEndpoint(baseEndpoint, params.page, params.limit);
          const response = await apiInstance.get<ApiResponse<MedicalRecord[]>>(endpoint);

          if (response.data?.data) {
            const records = response.data.data;
            set({
              records,
              isLoading: false,
            });
            return records;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      createRecord: async (recordData: CreateMedicalRecordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.post<ApiResponse<MedicalRecord>>(
            API_ENDPOINTS.MEDICAL_RECORDS.CREATE,
            recordData
          );

          if (response.data?.data) {
            const newRecord = response.data.data;
            const { records } = get();
            set({
              records: [...records, newRecord],
              isLoading: false,
            });
            return newRecord;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 생성 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      getRecordByIdAPI: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.get<ApiResponse<MedicalRecord>>(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id));

          if (response.data?.data) {
            const record = response.data.data;
            set({
              selectedRecord: record,
              isLoading: false,
            });
            return record;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      updateRecordAPI: async (id: number, recordData: Partial<CreateMedicalRecordRequest>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.patch<ApiResponse<MedicalRecord>>(
            API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id),
            recordData
          );

          if (response.data?.data) {
            const updatedRecord = response.data.data;
            const { records, selectedRecord } = get();

            const updatedRecords = records.map((record) => (record.id === id ? updatedRecord : record));

            set({
              records: updatedRecords,
              selectedRecord: selectedRecord?.id === id ? updatedRecord : selectedRecord,
              isLoading: false,
            });
            return updatedRecord;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 수정 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      deleteRecordAPI: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.delete(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id));

          const { records, selectedRecord } = get();
          const filteredRecords = records.filter((record) => record.id !== id);

          set({
            records: filteredRecords,
            selectedRecord: selectedRecord?.id === id ? null : selectedRecord,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 삭제 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      getRecordDetail: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.get<ApiResponse<MedicalRecord>>(`/medical-records/detail/${id}`);

          if (response.data?.data) {
            const record = response.data.data;
            set({
              selectedRecord: record,
              isLoading: false,
            });
            return record;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '진료기록 상세 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      getAllRecords: async (params: PaginationParams = {}) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = buildPaginatedEndpoint(API_ENDPOINTS.MEDICAL_RECORDS.LIST, params.page, params.limit);
          const response = await apiInstance.get<ApiResponse<MedicalRecord[]>>(endpoint);

          if (response.data?.data) {
            const records = response.data.data;
            set({
              records,
              isLoading: false,
            });
            return records;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '전체 진료기록 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
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
