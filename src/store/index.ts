/**
 * 메인 스토어 인덱스
 * 모든 상태관리 스토어를 통합 관리
 */

// 스토어 export
export { useAppStore } from './appStore';
export { useUserStore } from './userStore';
export { useHospitalStore } from './hospitalStore';
export { useRecordStore } from './recordStore';
export { useUIStore } from './uiStore';
export { useChatStore } from './chatStore';

// 타입 export
export * from './types';
