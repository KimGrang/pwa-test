import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import { usePetAPIHook } from '../hooks/usePetAPI';
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
  const { pets, setPets } = usePetStore();
  const { fetchMyPets, loading: apiLoading } = usePetAPIHook();

  // 컴포넌트 마운트 시 반려동물 목록 조회 (최초 1회만)
  useEffect(() => {
    const loadPets = async () => {
      try {
        const petsData = await fetchMyPets(1, 50); // 최대 50개까지 조회
        if (petsData) {
          setPets(petsData);
        }
      } catch (error) {
        console.error('반려동물 목록 조회 오류:', error);
        // API 오류 시 기존 store 데이터 사용 (사용자에게 알리지 않음)
        console.log('API 오류로 인해 기존 데이터를 사용합니다.');
      }
    };

    // store에 데이터가 없을 때만 API 호출
    if (pets.length === 0) {
      loadPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 최초 1회만 실행

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
        </div>

        {/* 반려동물 관리 섹션 */}
        <div className='section'>
          <div className='section-header'>
            <h3 className='section-title'>반려동물 관리</h3>
          </div>

          {apiLoading ? (
            <div className='loading-container'>
              <div className='loading-spinner'></div>
              <span>반려동물 목록을 불러오는 중...</span>
            </div>
          ) : pets.length > 0 ? (
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
              <div className='empty-icon'>
                <HeartIcon className='w-12 h-12 text-gray-400' />
              </div>
              <div className='empty-text'>등록된 반려동물이 없습니다</div>
              <button className='add-pet-button' onClick={handleAddPet}>
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
            <span className='menu-text'>웹앱 설치</span>
            <ChevronRightIcon className='chevron-heroicon' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;
