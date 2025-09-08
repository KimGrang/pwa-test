import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 더보기 메인 스크린 컴포넌트
 * 사용자 프로필, 반려동물 관리, 설정 메뉴 제공
 */
const MoreScreen: React.FC = () => {
  const navigate = useNavigate();

  // 스토어에서 사용자 정보와 반려동물 데이터 가져오기
  const { currentUser } = useUserStore();
  const { pets } = usePetStore();

  /**
   * 사용자 상세 정보 화면으로 이동
   */
  const handleUserProfile = useCallback(() => {
    navigate('/user-more');
  }, [navigate]);

  /**
   * 반려동물 관리 화면으로 이동
   */
  const handlePetManagement = useCallback(() => {
    navigate('/pet-more');
  }, [navigate]);

  /**
   * 알림 설정 화면으로 이동
   */
  const handleNotifications = useCallback(() => {
    alert('알림 설정 기능은 준비 중입니다.');
  }, []);

  /**
   * 병원 설정 화면으로 이동
   */
  const handleHospitalSettings = useCallback(() => {
    alert('병원 설정 기능은 준비 중입니다.');
  }, []);

  /**
   * 약관 화면으로 이동
   */
  const handleTerms = useCallback(() => {
    alert('약관 및 개인정보처리방침 기능은 준비 중입니다.');
  }, []);

  /**
   * 웹앱 설치 화면으로 이동
   */
  const handleWebAppInstall = useCallback(() => {
    navigate('/install');
  }, [navigate]);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
        <div className='header-center'>
          <span className='title'>더보기</span>
        </div>
        <div className='header-right'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {/* 사용자 프로필 섹션 */}
        <div className='profile-section'>
          <div className='profile-card' onClick={handleUserProfile}>
            <div className='profile-avatar'>
              <div className='avatar-circle'>
                <span className='avatar-icon'>👤</span>
              </div>
            </div>
            <div className='profile-info'>
              <div className='profile-name'>{currentUser?.name || '사용자님'}</div>
              <div className='profile-email'>{currentUser?.email || 'user@example.com'}</div>
            </div>
            <div className='profile-arrow'>
              <span className='arrow-icon'>→</span>
            </div>
          </div>
        </div>

        {/* 반려동물 관리 섹션 */}
        <div className='section'>
          <div className='section-header'>
            <h3 className='section-title'>반려동물 관리</h3>
            <button className='add-button' onClick={handlePetManagement}>
              <span className='add-icon'>+</span>
            </button>
          </div>

          {pets.length > 0 ? (
            <div className='pets-list'>
              {pets.map((pet) => (
                <div key={pet.id} className='pet-item' onClick={handlePetManagement}>
                  <div className='pet-info'>
                    <div className='pet-name'>{pet.name}</div>
                    <div className='pet-details'>
                      {pet.gender === 'MALE' ? '수컷' : '암컷'} • {pet.species}
                    </div>
                  </div>
                  <span className='chevron-icon'></span>
                </div>
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <div className='empty-icon'>🐕</div>
              <div className='empty-text'>등록된 반려동물이 없습니다</div>
              <button className='add-pet-button' onClick={handlePetManagement}>
                반려동물 추가하기
              </button>
            </div>
          )}
        </div>

        {/* 설정 메뉴 섹션 */}
        <div className='section'>
          <h3 className='section-title'>설정</h3>

          <div className='menu-item' onClick={handleNotifications}>
            <span className='menu-text'>알림 설정</span>
            <span className='chevron-icon'></span>
          </div>

          <div className='menu-item' onClick={handleHospitalSettings}>
            <span className='menu-text'>병원 설정</span>
            <span className='chevron-icon'></span>
          </div>

          <div className='menu-item' onClick={handleTerms}>
            <span className='menu-text'>약관 및 개인정보처리방침</span>
            <span className='chevron-icon'></span>
          </div>

          <div className='menu-item' onClick={handleWebAppInstall}>
            <span className='menu-text'>웹앱 설치</span>
            <span className='chevron-icon'></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
