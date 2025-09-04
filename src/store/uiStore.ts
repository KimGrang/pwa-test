import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI 상태 인터페이스
 */
interface UIState {
  // 모달 상태
  modals: {
    datePicker: boolean;
    hospitalSelector: boolean;
    recordDetail: boolean;
    settings: boolean;
    help: boolean;
  };

  // 사이드바 상태
  sidebar: {
    isOpen: boolean;
    activeTab: string;
  };

  // 알림 상태
  notifications: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  };

  // 로딩 상태
  loadingStates: {
    [key: string]: boolean;
  };

  // 액션
  openModal: (modalName: keyof UIState['modals']) => void;
  closeModal: (modalName: keyof UIState['modals']) => void;
  closeAllModals: () => void;

  toggleSidebar: () => void;
  setSidebarTab: (tab: string) => void;

  showNotification: (message: string, type?: UIState['notifications']['type'], duration?: number) => void;
  hideNotification: () => void;

  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
}

/**
 * UI 스토어 생성
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      modals: {
        datePicker: false,
        hospitalSelector: false,
        recordDetail: false,
        settings: false,
        help: false,
      },

      sidebar: {
        isOpen: false,
        activeTab: 'home',
      },

      notifications: {
        isVisible: false,
        message: '',
        type: 'info',
        duration: 3000,
      },

      loadingStates: {},

      // 액션
      openModal: (modalName: keyof UIState['modals']) => {
        const { modals } = get();
        set({
          modals: { ...modals, [modalName]: true },
        });
      },

      closeModal: (modalName: keyof UIState['modals']) => {
        const { modals } = get();
        set({
          modals: { ...modals, [modalName]: false },
        });
      },

      closeAllModals: () =>
        set({
          modals: {
            datePicker: false,
            hospitalSelector: false,
            recordDetail: false,
            settings: false,
            help: false,
          },
        }),

      toggleSidebar: () => {
        const { sidebar } = get();
        set({ sidebar: { ...sidebar, isOpen: !sidebar.isOpen } });
      },

      setSidebarTab: (tab: string) => {
        const { sidebar } = get();
        set({ sidebar: { ...sidebar, activeTab: tab } });
      },

      showNotification: (message: string, type: UIState['notifications']['type'] = 'info', duration: number = 3000) => {
        set({
          notifications: {
            isVisible: true,
            message,
            type,
            duration,
          },
        });

        // 자동으로 숨기기
        setTimeout(() => {
          get().hideNotification();
        }, duration);
      },

      hideNotification: () =>
        set({
          notifications: {
            isVisible: false,
            message: '',
            type: 'info',
            duration: 3000,
          },
        }),

      setLoading: (key: string, loading: boolean) => {
        const { loadingStates } = get();
        set({
          loadingStates: { ...loadingStates, [key]: loading },
        });
      },

      clearLoading: (key: string) => {
        const { loadingStates } = get();
        const rest = { ...loadingStates };
        delete rest[key];
        set({ loadingStates: rest });
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebar: state.sidebar,
        modals: state.modals,
      }),
    }
  )
);
