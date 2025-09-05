import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 사용자 정보 인터페이스 (API 응답과 일치)
 */
interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER';
  hospitalId?: number;
  SNS?: string;
  isTestAccount?: boolean;
}

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

  // 액션
  setCurrentUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  clearUser: () => void;
  clearAll: () => void;
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

      // 액션
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
        }),
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
