// 웹 PWA용 인증 타입들
import { User } from './user';

export type { User };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenCredentials {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

// PWA용 간소화된 Auth State (Zustand 기반)
export interface AuthState {
  // 상태
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;

  // 액션들
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 인증 액션들
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;

  // 초기화
  checkAuth: () => Promise<void>;
}
