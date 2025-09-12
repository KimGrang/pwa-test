import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import { useAuthStore } from '../store/authStore';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
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
  const { isAuthenticated } = useAuthStore();

  // PWA 설치 관련 훅
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  /**
   * 사용자 상세 정보 화면으로 이동
   */
  const handleUserProfile = useCallback(() => {
    navigate('/user-more');
  }, [navigate]);

  /**
   * 반려동물 편집 페이지로 이동
   */
  const handlePetEdit = useCallback(
    (petId: number) => {
      navigate(`/pet-more?mode=edit&id=${petId}`);
    },
    [navigate]
  );

  /**
   * 반려동물 추가 페이지로 이동
   */
  const handleAddPet = useCallback(() => {
    navigate('/pet-more?mode=add');
  }, [navigate]);

  /**
   * 알림 설정 화면으로 이동
   */
  const handleNotifications = useCallback(() => {
    navigate('/notification');
  }, [navigate]);

  /**
   * 병원 설정 화면으로 이동
   */
  const handleHospitalSettings = useCallback(() => {
    navigate('/hospital');
  }, [navigate]);

  /**
   * 약관 화면으로 이동
   */
  const handleTerms = useCallback(() => {
    navigate('/terms');
  }, [navigate]);

  /**
   * 웹앱 설치 처리
   */
  const handleWebAppInstall = useCallback(() => {
    if (isInstalled) {
      alert('앱이 이미 설치되어 있습니다.');
      return;
    }

    if (isInstallable) {
      promptInstall();
    } else {
      // 설치 불가능한 경우 설치 안내 화면으로 이동
      navigate('/install');
    }
  }, [isInstalled, isInstallable, promptInstall, navigate]);

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
          {isAuthenticated ? (
            <div className='profile-card' onClick={handleUserProfile}>
              <div className='profile-avatar'>
                <div className='avatar-circle'>
                  <UserIcon className='avatar-heroicon' />
                </div>
              </div>
              <div className='profile-info'>
                <div className='profile-name'>{currentUser?.name || '사용자님'}</div>
                <div className='profile-email'>{currentUser?.email || 'user@example.com'}</div>
              </div>
              <div className='profile-arrow'>
                <ChevronRightIcon className='arrow-heroicon' />
              </div>
            </div>
          ) : (
            <div className='profile-card' onClick={() => navigate('/login')}>
              <div className='profile-avatar'>
                <div className='avatar-circle'>
                  <UserIcon className='avatar-heroicon' />
                </div>
              </div>
              <div className='profile-info'>
                <div className='profile-name'>로그인이 필요합니다</div>
                <div className='profile-email'>로그인 버튼을 눌러주세요</div>
              </div>
              <div className='profile-arrow'>
                <ChevronRightIcon className='arrow-heroicon' />
              </div>
            </div>
          )}
        </div>

        {/* 반려동물 관리 섹션 */}
        {isAuthenticated && (
          <div className='section'>
            <div className='section-header'>
              <h3 className='section-title'>반려동물 관리</h3>
            </div>

            {pets.length > 0 ? (
              <>
                <div className='pets-list'>
                  {pets.map((pet) => (
                    <div key={pet.id} className='pet-item' onClick={() => handlePetEdit(pet.id)}>
                      <div className='pet-info'>
                        <div className='pet-name'>{pet.name}</div>
                        <div className='pet-details'>
                          {pet.gender === 'MALE' ? '수컷' : '암컷'}
                          {pet.weight && ` • ${pet.weight}kg`}
                          {pet.neutered && ' • 중성화완료'}
                        </div>
                      </div>
                      <ChevronRightIcon className='chevron-heroicon' />
                    </div>
                  ))}
                </div>
                {/* 반려동물 목록 아래에 + 버튼 추가 */}
                <div className='add-pet-section'>
                  <button className='add-pet-button' onClick={handleAddPet}>
                    <span className='add-icon'>+</span>
                    반려동물 추가
                  </button>
                </div>
              </>
            ) : (
              <div className='empty-state'>
                <div className='empty-text'>등록된 반려동물이 없습니다</div>
                <button className='add-pet-button' onClick={handleAddPet}>
                  반려동물 추가하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 설정 메뉴 섹션 */}
        <div className='section'>
          <h3 className='section-title'>설정</h3>

          <div className='menu-item' onClick={handleNotifications}>
            <span className='menu-text'>알림 설정</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>

          <div className='menu-item' onClick={handleHospitalSettings}>
            <span className='menu-text'>병원 설정</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>

          <div className='menu-item' onClick={handleTerms}>
            <span className='menu-text'>약관 및 개인정보처리방침</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>

          <div className='menu-item' onClick={handleWebAppInstall}>
            <span className='menu-text'>
              {isInstalled ? '✅ 앱이 설치됨' : isInstallable ? '📱 앱 설치' : '웹앱 설치'}
            </span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
