import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { useChatStore } from '../store/chatStore';
import { useHospitalStore } from '../store/hospitalStore';
import { useUIStore } from '../store/uiStore';
import { useAppStore } from '../store/appStore';
import { TokenManager } from '../utils/token-manager';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 사용자 상세 정보 및 계정 관리 화면
 * 프로필 편집, 로그아웃 등의 기능 제공
 */
const UserMoreScreen: React.FC = () => {
  const navigate = useNavigate();

  // 스토어에서 사용자 정보와 인증 상태 가져오기
  const { currentUser, clearAll: clearUserStore } = useUserStore();
  const { clearAll: clearAuthStore } = useAuthStore();
  const { clearAll: clearRecordStore } = useRecordStore();
  const { clearAll: clearPetStore } = usePetStore();
  const { clearAll: clearChatStore } = useChatStore();
  const { clearAll: clearHospitalStore } = useHospitalStore();
  const { clearAll: clearUIStore } = useUIStore();
  const { clearAll: clearAppStore } = useAppStore();

  /**
   * 프로필 편집 화면으로 이동 (현재는 알림)
   */
  const handleProfileEdit = useCallback(() => {
    alert('프로필 편집 기능은 준비 중입니다.');
  }, []);

  /**
   * 로그아웃 처리 - 모든 Zustand 스토어 데이터 삭제
   */
  const handleLogout = useCallback(() => {
    // 모든 스토어 데이터 삭제
    clearAuthStore();
    clearUserStore();
    clearRecordStore();
    clearPetStore();
    clearChatStore();
    clearHospitalStore();
    clearUIStore();
    clearAppStore();

    // 토큰 삭제
    TokenManager.clearTokens();

    // 홈 화면으로 이동
    navigate('/');
  }, [
    clearAuthStore,
    clearUserStore,
    clearRecordStore,
    clearPetStore,
    clearChatStore,
    clearHospitalStore,
    clearUIStore,
    clearAppStore,
    navigate,
  ]);

  /**
   * 뒤로가기 처리
   */
  const handleGoBack = useCallback(() => {
    navigate('/more');
  }, [navigate]);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>
          <button className='back-button' onClick={handleGoBack}>
            ← 뒤로
          </button>
        </div>
        <div className='header-center'>
          <span className='title'>계정 관리</span>
        </div>
        <div className='header-right'>{/* 우측 영역 (필요시 추가) */}</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {/* 사용자 프로필 섹션 */}
        <div className='profile-section'>
          <div className='profile-card'>
            <div className='profile-avatar'>
              <div className='avatar-circle'>
                <span className='avatar-icon'>👤</span>
              </div>
            </div>
            <div className='profile-info'>
              <div className='profile-name'>{currentUser?.name || '사용자님'}</div>
              <div className='profile-email'>{currentUser?.email || 'user@example.com'}</div>
              <div className='profile-role'>{currentUser?.role || 'USER'}</div>
            </div>
            <button className='edit-profile-button' onClick={handleProfileEdit}>
              <span className='edit-icon'>✏️</span>
            </button>
          </div>
        </div>

        {/* 계정 관리 섹션 */}
        <div className='section'>
          <h3 className='section-title'>계정 관리</h3>

          <div className='menu-item' onClick={handleProfileEdit}>
            <span className='menu-icon'>👤</span>
            <span className='menu-text'>프로필 편집</span>
            <span className='chevron-icon'></span>
          </div>

          <div className='menu-item' onClick={handleLogout}>
            <span className='menu-icon'>🚪</span>
            <span className='menu-text'>로그아웃</span>
            <span className='chevron-icon'></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMoreScreen;
