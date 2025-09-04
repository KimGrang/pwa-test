/**
 * AI 상담 및 채팅 관련 타입들
 */

// 채팅 메시지 타입 (실시간 채팅용)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  sessionId?: string;
}

// 채팅 세션 타입
export interface ChatSession {
  id: string;
  userId: number;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// AI 상담 기록 타입 (DB 저장용)
export interface AIConsultation {
  id: number;
  user_id: number;
  session_id: string;
  query: string;
  response: string;
  metadata?: {
    model?: string;
    tokens_used?: number;
    response_time?: number;
    confidence_score?: number;
  };
  was_helpful?: boolean;
  feedback_comment?: string;
  created_at: string;
  updated_at: string;
}

// 메시지 전송 요청 타입
export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  userId?: number;
  timestamp?: string;
}

// 메시지 전송 응답 타입
export interface SendMessageResponse {
  message: ChatMessage;
  sessionId: string;
  success: boolean;
}

// AI 상담 생성 요청 타입
export interface CreateAIConsultationRequest {
  user_id: number;
  session_id: string;
  query: string;
  response: string;
  metadata?: AIConsultation['metadata'];
}

// 피드백 요청 타입
export interface SubmitFeedbackRequest {
  consultation_id: number;
  was_helpful: boolean;
  feedback_comment?: string;
}

// 채팅 상태 타입 (컴포넌트용)
export interface ChatState {
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}
