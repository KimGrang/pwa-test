import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 앱 전체 상태 인터페이스
 */
interface AppState {
  // 앱 기본 정보
  appVersion: string;
  isFirstLaunch: boolean;
  lastLaunchDate: Date | null;

  // 테마 및 설정
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';

  // 앱 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setAppVersion: (version: string) => void;
  setFirstLaunch: (isFirst: boolean) => void;
  setLastLaunchDate: (date: Date) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetApp: () => void;
  clearAll: () => void;
}

/**
 * 앱 스토어 생성
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 초기 상태
      appVersion: '1.0.0',
      isFirstLaunch: true,
      lastLaunchDate: null,
      theme: 'system',
      language: 'ko',
      isLoading: false,
      error: null,

      // 액션
      setAppVersion: (version: string) => set({ appVersion: version }),

      setFirstLaunch: (isFirst: boolean) => set({ isFirstLaunch: isFirst }),

      setLastLaunchDate: (date: Date) => set({ lastLaunchDate: date }),

      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),

      setLanguage: (language: 'ko' | 'en') => set({ language }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      resetApp: () =>
        set({
          isFirstLaunch: true,
          lastLaunchDate: null,
          theme: 'system',
          language: 'ko',
          isLoading: false,
          error: null,
        }),

      clearAll: () =>
        set({
          isFirstLaunch: true,
          lastLaunchDate: null,
          theme: 'system',
          language: 'ko',
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'app-store', // localStorage 키
      partialize: (state) => ({
        // 앱 재시작 후에도 유지할 상태만 선택
        appVersion: state.appVersion,
        isFirstLaunch: state.isFirstLaunch,
        lastLaunchDate: state.lastLaunchDate,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
