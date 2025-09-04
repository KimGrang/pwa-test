// React Router 기반 PWA 네비게이션 타입

// 라우트 매개변수 타입들
export interface RouteParams {
  id?: string;
  selectedDate?: string;
  appointmentId?: string;
}

// 현재 PWA에서 사용하는 라우트들
export type AppRoutes =
  | '/' // Home
  | '/treatment' // Treatment Records
  | '/chat' // AI Chat
  | '/more' // More/Settings
  | '/appointment/:id' // Appointment Detail
  | '/prescription/:date' // Prescription Detail
  | '/profile'; // User Profile

// React Router 네비게이션 상태
export interface NavigationState {
  currentRoute: AppRoutes;
  previousRoute?: AppRoutes;
  params?: RouteParams;
}
