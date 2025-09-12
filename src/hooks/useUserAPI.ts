import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse, User, UpdateUserRequest } from '../types';

/**
 * 사용자 관련 API 훅
 */

export const useUserAPI = () => {
  const { data, loading, error, get, patch, del, clearError } = useApiClient<ApiResponse<User>>();

  const getProfile = useCallback(() => {
    return get(API_ENDPOINTS.USERS.PROFILE);
  }, [get]);

  const updateProfile = useCallback(
    (profileData: UpdateUserRequest) => {
      return patch(API_ENDPOINTS.USERS.PROFILE, profileData);
    },
    [patch]
  );

  const changePassword = useCallback(
    (passwords: { currentPassword: string; newPassword: string }) => {
      return patch(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwords);
    },
    [patch]
  );

  const deleteUser = useCallback(() => {
    return del(API_ENDPOINTS.USERS.PROFILE);
  }, [del]);

  const withdraw = useCallback(() => {
    return del(API_ENDPOINTS.USERS.WITHDRAW);
  }, [del]);

  const updateHospital = useCallback(
    (hospitalId: number) => {
      return patch(API_ENDPOINTS.USERS.PROFILE, { hospitalId });
    },
    [patch]
  );

  const getHospitals = useCallback(
    (params?: { page?: number; limit?: number }) => {
      const endpoint = params
        ? `${API_ENDPOINTS.HOSPITALS.LIST}?page=${params.page || 1}&limit=${params.limit || 10}`
        : API_ENDPOINTS.HOSPITALS.LIST;
      return get(endpoint);
    },
    [get]
  );

  const getMyHospital = useCallback(() => {
    return get(API_ENDPOINTS.HOSPITALS.MY_HOSPITAL);
  }, [get]);

  return {
    // 상태
    userData: data?.data || null,
    loading,
    error,

    // 사용자 액션
    getProfile,
    updateProfile,
    changePassword,
    deleteUser,
    withdraw,
    updateHospital,

    // 병원 관련 액션
    getHospitals,
    getMyHospital,

    // 유틸리티
    clearError,
  };
};

export default useUserAPI;
