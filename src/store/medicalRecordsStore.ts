import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicalRecord } from '../types/medical-record';

interface MedicalRecordsState {
  records: MedicalRecord[];
  medicalRecords: MedicalRecord[]; // MoreScreen에서 사용할 속성
  isLoading: boolean;
  error: string | null;
  setRecords: (records: MedicalRecord[]) => void;
  addRecord: (record: MedicalRecord) => void;
  updateRecord: (id: number, record: Partial<MedicalRecord>) => void;
  deleteRecord: (id: number) => void;
  clearRecords: () => void;
  getRecordsByPet: (petId: number) => MedicalRecord[];
  getRecordsByDate: (date: string) => MedicalRecord[];
  fetchMedicalRecords: () => Promise<void>; // API에서 진료기록 가져오기
}

export const useMedicalRecordsStore = create<MedicalRecordsState>()(
  persist(
    (set, get) => ({
      records: [],
      medicalRecords: [], // MoreScreen에서 사용할 속성
      isLoading: false,
      error: null,

      setRecords: (records: MedicalRecord[]) =>
        set({
          records,
          medicalRecords: records, // 동기화
        }),

      addRecord: (record: MedicalRecord) =>
        set((state) => ({
          records: [...state.records, record],
          medicalRecords: [...state.medicalRecords, record], // 동기화
        })),

      updateRecord: (id: number, record: Partial<MedicalRecord>) =>
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...record } : r)),
          medicalRecords: state.medicalRecords.map((r) => (r.id === id ? { ...r, ...record } : r)), // 동기화
        })),

      deleteRecord: (id: number) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          medicalRecords: state.medicalRecords.filter((r) => r.id !== id), // 동기화
        })),

      clearRecords: () => set({ records: [], medicalRecords: [] }),

      getRecordsByPet: (petId: number) => get().records.filter((record) => record.petId === petId),

      getRecordsByDate: (date: string) =>
        get().records.filter((record) => {
          const recordDate = new Date(record.visitDate).toISOString().split('T')[0];
          return recordDate === date;
        }),

      // API에서 진료기록 가져오기 (현재는 목업 데이터 사용)
      fetchMedicalRecords: async () => {
        set({ isLoading: true, error: null });
        try {
          // 실제 API 연동 시에는 여기서 API 호출
          // const response = await api.get('/medical-records');

          // 현재는 목업 데이터 사용
          const mockRecords: MedicalRecord[] = [
            {
              id: 1,
              petId: 1,
              hospitalId: 1,
              vetId: 1,
              visitDate: '2024-01-15',
              chiefComplaint: '기침과 재채기',
              examinationNotes: '상부 호흡기 감염 의심',
              treatmentPlan: '항생제 처방',
              followUp: '1주일 후 재진',
              createdAt: '2024-01-15T10:00:00Z',
            },
            {
              id: 2,
              petId: 1,
              hospitalId: 1,
              vetId: 1,
              visitDate: '2024-01-22',
              chiefComplaint: '예방접종',
              examinationNotes: '정기 건강검진',
              treatmentPlan: '종합 예방접종',
              followUp: '1년 후 재접종',
              createdAt: '2024-01-22T14:00:00Z',
            },
            {
              id: 3,
              petId: 1,
              hospitalId: 1,
              vetId: 1,
              visitDate: '2024-02-10',
              chiefComplaint: '식욕부진',
              examinationNotes: '소화기계 검사',
              treatmentPlan: '소화제 처방',
              followUp: '3일 후 상태 확인',
              createdAt: '2024-02-10T09:00:00Z',
            },
          ];

          set({
            records: mockRecords,
            medicalRecords: mockRecords,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '진료기록 로드 실패',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'medical-records-store',
      partialize: (state) => ({
        records: state.records,
        medicalRecords: state.medicalRecords,
      }),
    }
  )
);
