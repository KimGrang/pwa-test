import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import WithdrawModal from '../components/WithdrawModal';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 사용자 상세 정보 및 계정 관리 화면
 * 프로필 편집, 로그아웃 등의 기능 제공
 */
const UserMoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // 스토어에서 사용자 정보와 인증 상태 가져오기
  const { currentUser } = useUserStore();
  const { logout } = useAuthStore();

  /**
   * 로그아웃 처리
   */
  const handleLogout = useCallback(() => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      // authStore의 logout 함수 사용 (모든 스토어 정리됨)
      logout();

      // 홈 화면으로 이동
      navigate('/');
    }
  }, [logout, navigate]);

  /**
   * 회원탈퇴 모달 열기
   */
  const handleWithdrawal = useCallback(() => {
    setIsWithdrawModalOpen(true);
  }, []);

  /**
   * 회원탈퇴 모달 닫기
   */
  const handleCloseWithdrawModal = useCallback(() => {
    setIsWithdrawModalOpen(false);
  }, []);

  /**
   * 회원탈퇴 성공 후 처리
   */
  const handleWithdrawSuccess = useCallback(() => {
    setIsWithdrawModalOpen(false);
    // 홈 화면으로 이동
    navigate('/');
  }, [navigate]);

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
        <div className='header-left'></div>
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
                <UserIcon className='avatar-heroicon' />
              </div>
            </div>
            <div className='profile-info'>
              <div className='profile-name'>{currentUser?.name || '사용자님'}</div>
              <div className='profile-email'>{currentUser?.email || 'user@example.com'}</div>
              <div className='profile-role'>{currentUser?.role || 'USER'}</div>
            </div>
          </div>
        </div>

        {/* 계정 관리 섹션 */}
        <div className='section'>
          <h3 className='section-title'>계정 관리</h3>

          <div className='menu-item' onClick={handleLogout}>
            <span className='menu-text'>로그아웃</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>

          <div className='menu-item' onClick={handleWithdrawal}>
            <span className='menu-text'>회원탈퇴</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>
        </div>
        <div className='form-actions'>
          {/* <button className='action-button primary'>저장</button> */}

          <button className='action-button danger' onClick={handleGoBack}>
            취소
          </button>
        </div>
      </div>

      {/* 회원 탈퇴 모달 */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
};

export default UserMoreScreen;
