import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 채팅 메시지 인터페이스
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelId?: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    modelResponse?: Record<string, unknown>;
  };
}

/**
 * 채팅 세션 인터페이스
 */
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * 채팅 상태 인터페이스
 */
interface ChatState {
  // 채팅 세션
  sessions: ChatSession[];
  currentSessionId: string | null;

  // 모델 정보
  selectedModel: string;
  availableModels: string[];

  // 채팅 상태
  isTyping: boolean;
  isModelLoading: boolean;
  modelLoadingProgress: number;

  // 설정
  settings: {
    maxTokens: number;
    temperature: number;
    topP: number;
    repetitionPenalty: number;
    autoSave: boolean;
    maxHistory: number;
  };

  // 액션
  createSession: (title?: string) => string;
  setCurrentSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  clearSession: (sessionId: string) => void;

  setSelectedModel: (modelId: string) => void;
  setAvailableModels: (models: string[]) => void;

  setTyping: (typing: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setModelLoadingProgress: (progress: number) => void;

  updateSettings: (settings: Partial<ChatState['settings']>) => void;

  // 유틸리티 함수
  getCurrentSession: () => ChatSession | null;
  getSessionById: (sessionId: string) => ChatSession | null;
  getSessionMessages: (sessionId: string) => ChatMessage[];

  // 전체 데이터 삭제
  clearAll: () => void;
}

/**
 * 채팅 스토어 생성
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      sessions: [],
      currentSessionId: null,
      selectedModel: '',
      availableModels: [],
      isTyping: false,
      isModelLoading: false,
      modelLoadingProgress: 0,
      settings: {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        repetitionPenalty: 1.1,
        autoSave: true,
        maxHistory: 100,
      },

      // 액션
      createSession: (title?: string) => {
        const sessionId = `session_${Date.now()}`;
        const newSession: ChatSession = {
          id: sessionId,
          title: title || `새 대화 ${get().sessions.length + 1}`,
          messages: [],
          modelId: get().selectedModel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: sessionId,
        }));

        return sessionId;
      },

      setCurrentSession: (sessionId: string) => set({ currentSessionId: sessionId }),

      deleteSession: (sessionId: string) => {
        const { sessions, currentSessionId } = get();
        const filteredSessions = sessions.filter((session) => session.id !== sessionId);

        set({ sessions: filteredSessions });

        // 현재 세션이 삭제된 경우 첫 번째 세션으로 이동
        if (currentSessionId === sessionId) {
          set({ currentSessionId: filteredSessions[0]?.id || null });
        }
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        const { sessions } = get();
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId ? { ...session, title, updatedAt: new Date().toISOString() } : session
        );
        set({ sessions: updatedSessions });
      },

      addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const { sessions } = get();
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        const updatedSessions = sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, newMessage],
                updatedAt: new Date().toISOString(),
              }
            : session
        );

        set({ sessions: updatedSessions });
      },

      updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
        const { sessions } = get();
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: session.messages.map((message) =>
                  message.id === messageId ? { ...message, ...updates } : message
                ),
                updatedAt: new Date().toISOString(),
              }
            : session
        );
        set({ sessions: updatedSessions });
      },

      deleteMessage: (sessionId: string, messageId: string) => {
        const { sessions } = get();
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: session.messages.filter((message) => message.id !== messageId),
                updatedAt: new Date().toISOString(),
              }
            : session
        );
        set({ sessions: updatedSessions });
      },

      clearSession: (sessionId: string) => {
        const { sessions } = get();
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId ? { ...session, messages: [], updatedAt: new Date().toISOString() } : session
        );
        set({ sessions: updatedSessions });
      },

      setSelectedModel: (modelId: string) => set({ selectedModel: modelId }),

      setAvailableModels: (models: string[]) => set({ availableModels: models }),

      setTyping: (typing: boolean) => set({ isTyping: typing }),

      setModelLoading: (loading: boolean) => set({ isModelLoading: loading }),

      setModelLoadingProgress: (progress: number) => set({ modelLoadingProgress: progress }),

      updateSettings: (settings: Partial<ChatState['settings']>) => {
        const { settings: currentSettings } = get();
        set({ settings: { ...currentSettings, ...settings } });
      },

      // 유틸리티 함수
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((session) => session.id === currentSessionId) || null;
      },

      getSessionById: (sessionId: string) => {
        const { sessions } = get();
        return sessions.find((session) => session.id === sessionId) || null;
      },

      getSessionMessages: (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find((s) => s.id === sessionId);
        return session?.messages || [];
      },

      clearAll: () =>
        set({
          sessions: [],
          currentSessionId: null,
          selectedModel: '',
          availableModels: [],
          isTyping: false,
          isModelLoading: false,
          modelLoadingProgress: 0,
          settings: {
            maxTokens: 512,
            temperature: 0.7,
            topP: 0.9,
            repetitionPenalty: 1.1,
            autoSave: true,
            maxHistory: 100,
          },
        }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        selectedModel: state.selectedModel,
        availableModels: state.availableModels,
        settings: state.settings,
      }),
    }
  )
);
