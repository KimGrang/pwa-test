import React, { useCallback, useState, useEffect } from 'react';
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
  const { currentUser, updateUserProfile, clearAll: clearUserStore } = useUserStore();
  const { clearAll: clearAuthStore } = useAuthStore();
  const { clearAll: clearRecordStore } = useRecordStore();
  const { clearAll: clearPetStore } = usePetStore();
  const { clearAll: clearChatStore } = useChatStore();
  const { clearAll: clearHospitalStore } = useHospitalStore();
  const { clearAll: clearUIStore } = useUIStore();
  const { clearAll: clearAppStore } = useAppStore();

  // 프로필 편집 상태
  const [isEditing, setIsEditing] = useState(true); // 화면 진입 시 자동으로 편집 모드
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER',
  });

  // currentUser가 변경될 때 editedUser 동기화
  useEffect(() => {
    if (currentUser) {
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: (currentUser.role || 'USER') as 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER',
      });
    }
  }, [currentUser]);

  /**
   * 프로필 편집 모드 토글
   */
  const handleProfileEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  /**
   * 프로필 저장
   */
  const handleSave = useCallback(async () => {
    if (!editedUser.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 이름만 업데이트
      await updateUserProfile({ name: editedUser.name });
      setIsEditing(false);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [editedUser.name, updateUserProfile]);

  /**
   * 로그아웃 처리 - 모든 Zustand 스토어 데이터 삭제
   */
  const handleLogout = useCallback(() => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
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
    }
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
   * 회원탈퇴 처리
   */
  const handleWithdrawal = useCallback(() => {
    if (window.confirm('앱에 등록된 진료 기록이 모두 삭제됩니다.\n정말 탈퇴하시겠습니까?')) {
      // TODO: 회원탈퇴 API 호출
      alert('회원탈퇴 기능은 준비 중입니다.');
    }
  }, []);

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
              {isEditing ? (
                <div className='profile-edit-form'>
                  <div className='profile-edit-row'>
                    <label className='profile-edit-label'>이름</label>
                    <input
                      type='text'
                      className='profile-edit-input'
                      value={editedUser.name}
                      onChange={(e) => setEditedUser((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder='이름을 입력하세요'
                    />
                  </div>
                  <div className='profile-edit-row'>
                    <label className='profile-edit-label'>이메일</label>
                    <div className='profile-readonly-field'>{currentUser?.email || 'user@example.com'}</div>
                  </div>
                  <div className='profile-edit-row'>
                    <label className='profile-edit-label'>역할</label>
                    <div className='profile-readonly-field'>{currentUser?.role || 'USER'}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className='profile-name'>{currentUser?.name || '사용자님'}</div>
                  <div className='profile-email'>{currentUser?.email || 'user@example.com'}</div>
                  <div className='profile-role'>{currentUser?.role || 'USER'}</div>
                </>
              )}
            </div>
            <button className='edit-profile-button' onClick={handleProfileEdit}>
              <span className='edit-icon'>{isEditing ? '❌' : '✏️'}</span>
            </button>
          </div>
        </div>

        {/* 편집 모드일 때 저장/취소 버튼 */}
        {isEditing && (
          <div className='section'>
            <div className='profile-edit-actions'>
              <button className='action-button primary' onClick={handleSave} disabled={isLoading}>
                {isLoading ? '저장 중...' : '저장'}
              </button>
              <button
                className='action-button'
                onClick={() => {
                  setIsEditing(false);
                  // 편집 내용 초기화
                  if (currentUser) {
                    setEditedUser({
                      name: currentUser.name || '',
                      email: currentUser.email || '',
                      role: currentUser.role || 'USER',
                    });
                  }
                }}
                disabled={isLoading}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 계정 관리 섹션 */}
        <div className='section'>
          <h3 className='section-title'>계정 관리</h3>

          <div className='menu-item' onClick={handleLogout}>
            <span className='menu-icon'>🚪</span>
            <span className='menu-text'>로그아웃</span>
            <span className='chevron-icon'></span>
          </div>

          <div className='menu-item' onClick={handleWithdrawal}>
            <span className='menu-icon'>🗑️</span>
            <span className='menu-text'>회원탈퇴</span>
            <span className='chevron-icon'></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMoreScreen;
