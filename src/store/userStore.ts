import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiInstance } from '../config/axios-config';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse, User, UpdateUserRequest } from '../types';

/**
 * 사용자 상태 인터페이스
 */
interface UserState {
  // 사용자 정보
  currentUser: User | null;

  // 사용자 설정
  preferences: {
    notifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacyMode: boolean;
  };

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 기본 액션
  setCurrentUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearUser: () => void;
  clearAll: () => void;

  // API 액션
  getProfile: () => Promise<User | null>;
  updateProfile: (profileData: UpdateUserRequest) => Promise<User | null>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  withdraw: () => Promise<boolean>;
  updateHospital: (hospitalId: number) => Promise<User | null>;
}

/**
 * 사용자 스토어 생성
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentUser: null,
      preferences: {
        notifications: true,
        emailNotifications: true,
        pushNotifications: true,
        privacyMode: false,
      },
      isLoading: false,
      error: null,

      // 기본 액션
      setCurrentUser: (user: User | null) => set({ currentUser: user }),

      updateUserProfile: (updates: Partial<User>) => {
        const { currentUser } = get();
        if (currentUser) {
          set({
            currentUser: { ...currentUser, ...updates },
          });
        }
      },

      updatePreferences: (preferences: Partial<UserState['preferences']>) => {
        const { preferences: currentPreferences } = get();
        set({
          preferences: { ...currentPreferences, ...preferences },
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      clearUser: () => set({ currentUser: null }),

      clearAll: () =>
        set({
          currentUser: null,
          preferences: {
            notifications: true,
            emailNotifications: true,
            pushNotifications: true,
            privacyMode: false,
          },
          isLoading: false,
          error: null,
        }),

      // API 액션들
      getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.get<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE);

          if (response.data?.data) {
            const userData = response.data.data;
            set({
              currentUser: userData,
              isLoading: false,
            });
            return userData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '프로필 조회 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      updateProfile: async (profileData: UpdateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE, profileData);

          if (response.data?.data) {
            const userData = response.data.data;
            set({
              currentUser: userData,
              isLoading: false,
            });
            return userData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '프로필 업데이트 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.patch(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwords);
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      deleteUser: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.delete(API_ENDPOINTS.USERS.PROFILE);
          set({
            currentUser: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '사용자 삭제 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      withdraw: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiInstance.delete(API_ENDPOINTS.USERS.WITHDRAW);
          set({
            currentUser: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '회원 탈퇴 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      updateHospital: async (hospitalId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiInstance.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE, { hospitalId });

          if (response.data?.data) {
            const userData = response.data.data;
            set({
              currentUser: userData,
              isLoading: false,
            });
            return userData;
          }
          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '병원 정보 업데이트 중 오류가 발생했습니다.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        preferences: state.preferences,
      }),
    }
  )
);
