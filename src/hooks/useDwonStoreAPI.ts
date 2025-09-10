import { useCallback } from 'react';
import useAxios from './useAxios';
import { getCurrentConfig, DWON_STORE_ENDPOINTS, DWON_STORE_PAGINATION } from '../config/dwon-store-config';
import { ApiResponse, User, LoginCredentials, ChatMessage } from '../types';
import { CreatePetRequest, PetWithRecordsResponse } from '../types/pet';
import { CreateMedicalRecordRequest } from '../types/medical-record';
import { CreateVetRequest } from '../types/vet';

/**
 * example.com 백엔드 API와 통신하기 위한 커스텀 훅들
 * 백엔드 API 가이드를 기반으로 구현
 */

// 기존 타입에 없는 것들만 추가 정의
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface SocialLoginRequest {
  userId: string;
  provider: 'GOOGLE' | 'KAKAO' | 'APPLE' | 'TEST';
  accessToken: string;
  refreshToken: string;
  socialUser: {
    email: string;
    name: string;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

// =================================
// 인증 관련 API Hook
// =================================

export const useDwonStoreAuth = () => {
  const { data, loading, error, post, clearError } = useAxios<ApiResponse<unknown>>(getCurrentConfig().BASE_URL);

  const register = useCallback(
    (credentials: RegisterRequest) => post(DWON_STORE_ENDPOINTS.AUTH.REGISTER, credentials),
    [post]
  );

  const login = useCallback(
    (credentials: LoginCredentials) => post(DWON_STORE_ENDPOINTS.AUTH.LOGIN, credentials),
    [post]
  );

  const socialLogin = useCallback(
    (socialData: SocialLoginRequest) => post(DWON_STORE_ENDPOINTS.USERS.SOCIAL_LOGIN, socialData),
    [post]
  );

  const kakaoLogin = useCallback(
    (kakaoData: SocialLoginRequest) => post(DWON_STORE_ENDPOINTS.AUTH.KAKAO, kakaoData),
    [post]
  );

  const testLogin = useCallback(() => post(DWON_STORE_ENDPOINTS.USERS.TEST_LOGIN, {}), [post]);

  const refreshToken = useCallback(
    (refreshToken: string) => post(DWON_STORE_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken }),
    [post]
  );

  const logout = useCallback(() => post(DWON_STORE_ENDPOINTS.AUTH.LOGOUT, {}), [post]);

  return {
    authData: data?.data || null,
    loading,
    error,
    register,
    login,
    socialLogin,
    kakaoLogin,
    testLogin,
    refreshToken,
    logout,
    clearError,
  };
};

// =================================
// 사용자 관련 API Hook
// =================================

export const useDwonStoreUser = () => {
  const { data, loading, error, get, patch, del, clearError } = useAxios<ApiResponse<User>>(
    getCurrentConfig().BASE_URL
  );

  const getProfile = useCallback(() => get(DWON_STORE_ENDPOINTS.USERS.PROFILE), [get]);

  const updateProfile = useCallback(
    (profileData: Partial<User>) => patch(DWON_STORE_ENDPOINTS.USERS.PROFILE, profileData),
    [patch]
  );

  const changePassword = useCallback(
    (passwords: { currentPassword: string; newPassword: string }) =>
      patch(DWON_STORE_ENDPOINTS.USERS.CHANGE_PASSWORD, passwords),
    [patch]
  );

  const deleteUser = useCallback(() => del(DWON_STORE_ENDPOINTS.USERS.PROFILE), [del]);

  return {
    userData: data?.data || null,
    loading,
    error,
    getProfile,
    updateProfile,
    changePassword,
    deleteUser,
    clearError,
  };
};

// =================================
// 반려동물 관련 API Hook
// =================================

export const useDwonStorePets = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useAxios<ApiResponse<unknown>>(
    getCurrentConfig().BASE_URL
  );

  // 기존 반려동물 조회 (주석처리 예정)
  const getMyPets = useCallback(
    (params: PaginationParams = {}) => {
      const { page = DWON_STORE_PAGINATION.DEFAULT_PAGE, limit = DWON_STORE_PAGINATION.DEFAULT_LIMIT } = params;
      return get(`${DWON_STORE_ENDPOINTS.PETS.MY_PETS}?page=${page}&limit=${limit}`);
    },
    [get]
  );

  // 새로운 API: 반려동물과 진료기록 함께 조회 (N+1 문제 해결)
  const getMyPetsWithRecords = useCallback(() => {
    // 백엔드 API는 페이지네이션을 지원하지 않음 (전체 데이터 반환)
    return get(DWON_STORE_ENDPOINTS.PETS.MY_PETS_WITH_RECORDS) as Promise<PetWithRecordsResponse | null>;
  }, [get]);

  const getPetById = useCallback((id: number) => get(DWON_STORE_ENDPOINTS.PETS.DETAIL(id)), [get]);

  const createPet = useCallback((petData: CreatePetRequest) => post(DWON_STORE_ENDPOINTS.PETS.CREATE, petData), [post]);

  const updatePet = useCallback(
    (id: number, petData: Partial<CreatePetRequest>) => patch(DWON_STORE_ENDPOINTS.PETS.DETAIL(id), petData),
    [patch]
  );

  const deletePet = useCallback((id: number) => del(DWON_STORE_ENDPOINTS.PETS.DETAIL(id)), [del]);

  return {
    petsData: data?.data || null,
    loading,
    error,
    getMyPets, // 기존 함수 (주석처리 예정)
    getMyPetsWithRecords, // 새로운 함수
    getPetById,
    createPet,
    updatePet,
    deletePet,
    clearError,
  };
};

// =================================
// AI 상담 및 채팅 관련 API Hook
// =================================

export const useDwonStoreChat = () => {
  const { data, loading, error, get, post, clearError } = useAxios<ApiResponse<ChatMessage>>(
    getCurrentConfig().BASE_URL
  );

  const getMyConsultations = useCallback(
    (params: PaginationParams = {}) => {
      const { page = DWON_STORE_PAGINATION.DEFAULT_PAGE, limit = DWON_STORE_PAGINATION.DEFAULT_LIMIT } = params;
      return get(`${DWON_STORE_ENDPOINTS.AI_CONSULTATIONS.MY_CONSULTATIONS}?page=${page}&limit=${limit}`);
    },
    [get]
  );

  const createConsultation = useCallback(
    (consultationData: { petId: number; question: string; answer: string; notes?: string }) =>
      post(DWON_STORE_ENDPOINTS.AI_CONSULTATIONS.CREATE, consultationData),
    [post]
  );

  const getConsultationById = useCallback((id: number) => get(DWON_STORE_ENDPOINTS.AI_CONSULTATIONS.DETAIL(id)), [get]);

  const sendMessage = useCallback(
    (messageData: { message: string; sessionId?: string; timestamp?: string }) =>
      post(DWON_STORE_ENDPOINTS.CHAT.SEND_MESSAGE, messageData),
    [post]
  );

  const getChatSessions = useCallback(() => get(DWON_STORE_ENDPOINTS.CHAT.SESSIONS), [get]);

  const getSessionMessages = useCallback(
    (sessionId: string) => get(DWON_STORE_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId)),
    [get]
  );

  const createChatSession = useCallback(() => post(DWON_STORE_ENDPOINTS.CHAT.CREATE_SESSION, {}), [post]);

  return {
    chatData: data?.data || null,
    loading,
    error,
    getMyConsultations,
    createConsultation,
    getConsultationById,
    sendMessage,
    getChatSessions,
    getSessionMessages,
    createChatSession,
    clearError,
  };
};

// =================================
// 진료기록 관련 API Hook
// =================================

export const useDwonStoreMedicalRecords = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useAxios<ApiResponse<unknown>>(
    getCurrentConfig().BASE_URL
  );

  const getRecordsByPet = useCallback(
    (petId: number, params: PaginationParams = {}) => {
      const { page = DWON_STORE_PAGINATION.DEFAULT_PAGE, limit = DWON_STORE_PAGINATION.DEFAULT_LIMIT } = params;
      return get(`${DWON_STORE_ENDPOINTS.MEDICAL_RECORDS.BY_PET(petId)}?page=${page}&limit=${limit}`);
    },
    [get]
  );

  const createRecord = useCallback(
    (recordData: CreateMedicalRecordRequest) => post(DWON_STORE_ENDPOINTS.MEDICAL_RECORDS.CREATE, recordData),
    [post]
  );

  const getRecordById = useCallback((id: number) => get(DWON_STORE_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)), [get]);

  const updateRecord = useCallback(
    (id: number, recordData: Partial<CreateMedicalRecordRequest>) =>
      patch(DWON_STORE_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id), recordData),
    [patch]
  );

  const deleteRecord = useCallback((id: number) => del(DWON_STORE_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)), [del]);

  return {
    recordsData: data?.data || null,
    loading,
    error,
    getRecordsByPet,
    createRecord,
    getRecordById,
    updateRecord,
    deleteRecord,
    clearError,
  };
};

// =================================
// 수의사 관련 API Hook
// =================================

export const useDwonStoreVet = () => {
  const { data, loading, error, get, post, patch, del, clearError } = useAxios<ApiResponse<unknown>>(
    getCurrentConfig().BASE_URL
  );

  const getVets = useCallback(() => get(DWON_STORE_ENDPOINTS.VET.LIST), [get]);

  const getVetById = useCallback((id: number) => get(DWON_STORE_ENDPOINTS.VET.DETAIL(id)), [get]);

  const createVet = useCallback((vetData: CreateVetRequest) => post(DWON_STORE_ENDPOINTS.VET.CREATE, vetData), [post]);

  const updateVet = useCallback(
    (id: number, vetData: Partial<CreateVetRequest>) => patch(DWON_STORE_ENDPOINTS.VET.DETAIL(id), vetData),
    [patch]
  );

  const deleteVet = useCallback((id: number) => del(DWON_STORE_ENDPOINTS.VET.DETAIL(id)), [del]);

  return {
    vetData: data?.data || null,
    loading,
    error,
    getVets,
    getVetById,
    createVet,
    updateVet,
    deleteVet,
    clearError,
  };
};

// =================================
// 병원 관련 API Hook
// =================================

export const useDwonStoreHospitals = () => {
  const { data, loading, error, get, clearError } = useAxios<ApiResponse<unknown>>(getCurrentConfig().BASE_URL);

  const getHospitals = useCallback(
    (params: PaginationParams = {}) => {
      const { page = DWON_STORE_PAGINATION.DEFAULT_PAGE, limit = DWON_STORE_PAGINATION.DEFAULT_LIMIT } = params;
      return get(`${DWON_STORE_ENDPOINTS.HOSPITALS.LIST}?page=${page}&limit=${limit}`);
    },
    [get]
  );

  const getHospitalById = useCallback((id: number) => get(DWON_STORE_ENDPOINTS.HOSPITALS.DETAIL(id)), [get]);

  const getMyHospital = useCallback(() => get(DWON_STORE_ENDPOINTS.HOSPITALS.MY_HOSPITAL), [get]);

  return {
    hospitalsData: data?.data || null,
    loading,
    error,
    getHospitals,
    getHospitalById,
    getMyHospital,
    clearError,
  };
};
