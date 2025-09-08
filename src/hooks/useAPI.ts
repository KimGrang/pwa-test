import useAxios from './useAxios';
import {
  ApiResponse,
  User,
  ChatMessage,
  CreatePetRequest,
  UpdatePetRequest,
  PetListResponse,
  PetResponse,
} from '../types';

// example.com API Hook들 re-export
export {
  useDwonStoreAuth,
  useDwonStoreUser,
  useDwonStoreHospitals,
  useDwonStorePets,
  useDwonStoreChat,
  useDwonStoreMedicalRecords,
  useDwonStoreVet,
} from './useDwonStoreAPI';

/**
 * 프로젝트별 API 통신을 위한 커스텀 훅
 * useAxios를 기반으로 한 특화된 API 통신 관리
 */

// 프로젝트에서 사용하는 기본 데이터 타입들은 types/index.ts에서 import

// 기본 API Hook
export const useAPI = () => {
  return useAxios<ApiResponse<unknown>>('/api');
};

// 사용자 관련 API Hook
export const useUserAPI = () => {
  const { data, loading, error, get, put, del, clearError } = useAxios<ApiResponse<User>>('/api/users');

  return {
    userData: data?.data || null,
    loading,
    error,
    getUserProfile: (userId: number) => get(`/${userId}`),
    updateUserProfile: (userId: number, userData: Partial<User>) => put(`/${userId}`, userData),
    deleteUser: (userId: number) => del(`/${userId}`),
    clearError,
  };
};

// AI 상담 및 채팅 관련 API Hook
export const useChatAPI = () => {
  const { data, loading, error, post, get, clearError } = useAxios<ApiResponse<ChatMessage>>('/api/chat');

  return {
    chatResponse: data?.data || null,
    loading,
    error,
    // 메시지 전송
    sendMessage: (message: string, sessionId?: string) =>
      post('/message', {
        message,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    // 채팅 세션 목록 가져오기
    getChatSessions: () => get('/sessions'),
    // 특정 세션의 메시지 가져오기
    getSessionMessages: (sessionId: string) => get(`/sessions/${sessionId}/messages`),
    // 새 채팅 세션 생성
    createNewSession: () => post('/sessions', {}),
    clearError,
  };
};

// AI 상담 기록 관련 API Hook
export const useAIConsultationAPI = () => {
  const { data, loading, error, get, post, put, clearError } = useAxios<ApiResponse<unknown>>('/api/consultations');

  return {
    consultationData: data?.data || null,
    loading,
    error,
    // 상담 기록 목록 가져오기
    getConsultationHistory: () => get('/'),
    // 특정 상담 기록 가져오기
    getConsultationById: (id: number) => get(`/${id}`),
    // 상담 기록 저장
    saveConsultation: (consultationData: Record<string, unknown>) => post('/', consultationData),
    // 피드백 제출
    submitFeedback: (consultationId: number, feedback: Record<string, unknown>) =>
      put(`/${consultationId}/feedback`, feedback),
    clearError,
  };
};

// 병원 관련 API Hook
export const useHospitalAPI = () => {
  const { data, loading, error, get, post, clearError } = useAxios<ApiResponse<unknown>>('/api/hospital');

  return {
    hospitalData: data?.data || null,
    loading,
    error,
    getHospitalList: () => get('/'),
    searchHospital: (query: string) => get(`/search?q=${encodeURIComponent(query)}`),
    bookAppointment: (appointmentData: Record<string, unknown>) => post('/appointments', appointmentData),
    clearError,
  };
};

// 진료 기록 관련 API Hook
export const useTreatmentAPI = () => {
  const { data, loading, error, get, post, put, del, clearError } = useAxios<ApiResponse<unknown>>('/api/treatments');

  return {
    treatmentData: data?.data || null,
    loading,
    error,
    getTreatmentHistory: () => get('/'),
    getTreatmentById: (id: number) => get(`/${id}`),
    createTreatment: (treatmentData: Record<string, unknown>) => post('/', treatmentData),
    updateTreatment: (id: number, treatmentData: Record<string, unknown>) => put(`/${id}`, treatmentData),
    deleteTreatment: (id: number) => del(`/${id}`),
    clearError,
  };
};

// 반려동물 관련 API Hook
export const usePetAPI = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useAxios<PetResponse | PetListResponse>('/pets');

  return {
    petData: data?.data || null,
    loading,
    error,
    // 반려동물 등록
    createPet: (petData: CreatePetRequest) => post('/', petData),
    // 반려동물 정보 수정
    updatePet: (id: number, petData: UpdatePetRequest) => patch(`/${id}`, petData),
    // 반려동물 삭제
    deletePet: (id: number) => del(`/${id}`),
    // 내 반려동물 목록 조회
    getMyPets: (page: number = 1, limit: number = 10) => get(`/my-pets?page=${page}&limit=${limit}`),
    // 특정 반려동물 조회
    getPetById: (id: number) => get(`/${id}`),
    // 전체 반려동물 조회 (관리자용)
    getAllPets: (page: number = 1, limit: number = 10) => get(`?page=${page}&limit=${limit}`),
    clearError,
  };
};

export default useAPI;
