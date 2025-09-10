import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDwonStoreAuth, useDwonStorePets } from '../hooks/useDwonStoreAPI';
import { TokenManager } from '../utils/token-manager';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { useUIStore } from '../store/uiStore';
import MedicalRecordCalendar from '../components/MedicalRecordCalendar';
import PetFilter from '../components/PetFilter';
import LoginModal from '../components/LoginModal';
import '../styles/base.css';
import '../styles/moreScreen.css';
import '../styles/PetFilter.css';
import '../styles/LoginModal.css';

// User 타입 정의 (API 응답과 일치)
interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER';
  hospitalId?: number;
  SNS?: string;
  isTestAccount?: boolean;
}

/**
 * 홈 화면 컴포넌트
 * 진료기록 캘린더와 예약 정보를 표시
 */
const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  // 모달 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Zustand stores
  const { currentUser, setCurrentUser, clearUser } = useUserStore();
  const { tokens, isAuthenticated, login: authLogin, logout: authLogout } = useAuthStore();
  const { records: medicalRecords, setRecords: setMedicalRecords } = useRecordStore();
  const { pets, setPets } = usePetStore();
  const { calendar, filters, setSelectedPetId } = useUIStore();

  // example.com API 인증 Hook
  const { loading: authLoading, error: authError, clearError: clearAuthError } = useDwonStoreAuth();

  // 반려동물 및 진료기록 관련 Hook
  const { getMyPetsWithRecords } = useDwonStorePets();
  // const { getMyPets } = useDwonStorePets(); // 기존 함수 (주석처리)
  // const { getRecordsByPet } = useDwonStoreMedicalRecords(); // 기존 함수 (주석처리)

  // 진료기록 데이터 로드 함수 (useCallback으로 메모이제이션)
  const loadPetsWithMedicalRecords = useCallback(async () => {
    console.log('🚀 loadPetsWithMedicalRecords 함수 호출됨');
    console.log('🔍 현재 상태:', { isAuthenticated, currentUserId: currentUser?.id });

    if (!isAuthenticated || !currentUser?.id) {
      console.log('❌ 인증되지 않았거나 사용자 ID가 없음 - 함수 종료');
      return;
    }

    try {
      console.log('🔄 반려동물과 진료기록 데이터 로드 시작... (userId:', currentUser.id, ')');

      // 새로운 API: 반려동물과 진료기록을 함께 조회 (N+1 문제 해결)
      console.log('📡 API 호출 시작: getMyPetsWithRecords()');
      const petsWithRecordsResponse = await getMyPetsWithRecords();
      console.log('📡 API 응답:', petsWithRecordsResponse);

      if (!petsWithRecordsResponse) {
        console.log('❌ API 응답이 null 또는 undefined');
        return;
      }

      if (
        petsWithRecordsResponse.success &&
        Array.isArray(petsWithRecordsResponse.data) &&
        petsWithRecordsResponse.data.length > 0
      ) {
        console.log('🐕 반려동물과 진료기록 데이터:', petsWithRecordsResponse.data);

        // 반려동물 데이터 추출 및 정렬
        const sortedPets = petsWithRecordsResponse.data
          .map((pet) => ({
            id: pet.id,
            name: pet.name,
            gender: pet.gender,
            weight: pet.weight,
            neutered: pet.neutered,
            birthDate: pet.birthDate,
            medicalHistory: pet.medicalHistory,
            profileImageUrl: pet.profileImageUrl,
            userId: pet.userId,
            createdAt: pet.createdAt,
            updatedAt: pet.updatedAt,
          }))
          .sort((a, b) => a.id - b.id);

        console.log('🔄 정렬된 반려동물 데이터:', sortedPets);
        setPets(sortedPets);

        // 모든 진료기록을 하나의 배열로 합치기
        const allMedicalRecords = petsWithRecordsResponse.data
          .flatMap((pet) => pet.medicalRecords)
          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

        console.log('📋 모든 진료기록 데이터:', allMedicalRecords);
        console.log('📋 진료기록 개수:', allMedicalRecords.length);
        setMedicalRecords(allMedicalRecords);

        // 진료기록이 제대로 설정되었는지 확인
        console.log('✅ 진료기록 데이터 로드 완료:', allMedicalRecords.length, '개');
      } else {
        console.log('ℹ️ 등록된 반려동물이 없습니다.');
        setPets([]);
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('❌ 반려동물과 진료기록 로드 실패:', error);
      // 401 에러인 경우 인증 상태 초기화
      if (error instanceof Error && error.message.includes('인증이 필요합니다')) {
        console.log('🔓 인증 토큰이 유효하지 않음 - 로그아웃 처리');
        authLogout();
        clearUser();
        TokenManager.clearTokens();
      }
    }
  }, [isAuthenticated, currentUser?.id, getMyPetsWithRecords, setPets, setMedicalRecords, authLogout, clearUser]);

  // 토큰 복원 실행 여부를 추적하는 ref
  const tokenRestoreAttempted = useRef(false);

  // 이전 인증 상태를 추적하는 ref
  const prevAuthState = useRef<boolean | null>(null);

  // 컴포넌트 마운트 시 토큰 복원 (한 번만 실행)
  useEffect(() => {
    if (tokenRestoreAttempted.current) return;
    tokenRestoreAttempted.current = true;

    const hasToken = TokenManager.getAccessToken();
    if (hasToken && !isAuthenticated) {
      // TokenManager에 저장된 사용자 정보가 있다면 store에 복원
      const userData = TokenManager.getUserData();
      if (userData && typeof userData === 'object' && 'id' in userData) {
        console.log('🔄 토큰 복원 중...');
        setCurrentUser(userData as User);
        authLogin({
          accessToken: hasToken,
          refreshToken: TokenManager.getRefreshToken() || '',
        });

        // 토큰 복원 후 데이터 로드
        console.log('⏰ 토큰 복원 완료 - loadPetsWithMedicalRecords 호출');
        loadPetsWithMedicalRecords();
      }
    }
  }, [authLogin, isAuthenticated, loadPetsWithMedicalRecords, setCurrentUser]);

  // 안정적인 인증 상태 정보 (useMemo로 메모이제이션)
  const authInfo = useMemo(
    () => ({
      isAuthenticated,
      userId: currentUser?.id || null,
      userName: currentUser?.name || null,
      hasTokens: !!tokens?.accessToken,
    }),
    [isAuthenticated, currentUser?.id, currentUser?.name, tokens?.accessToken]
  );

  // 인증 상태 변화 감지 (디버깅용) - 상태 변화 시에만 출력
  useEffect(() => {
    // 이전 상태와 다를 때만 로그 출력
    if (prevAuthState.current !== authInfo.isAuthenticated) {
      if (authInfo.isAuthenticated && authInfo.userId) {
        console.log('✅ 로그인 상태:', {
          userId: authInfo.userId,
          userName: authInfo.userName,
          hasTokens: authInfo.hasTokens,
        });
      } else if (!authInfo.isAuthenticated) {
        console.log('❌ 로그아웃 상태');
      }
      prevAuthState.current = authInfo.isAuthenticated;
    }
  }, [authInfo]); // 안정적인 의존성

  // 401 에러 이벤트 수신 - axios interceptor에서 발생
  useEffect(() => {
    const handleAuthError = () => {
      console.log('🔓 인증 오류 이벤트 수신 - 로그아웃 처리');
      authLogout();
      clearUser();
      // TokenManager는 이미 axios interceptor에서 정리됨
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [authLogout, clearUser]);

  // 필터링된 진료기록 계산
  const filteredMedicalRecords = useMemo(() => {
    if (!filters.selectedPetId) {
      return medicalRecords; // 전체 선택 시 모든 진료기록 반환
    }

    return medicalRecords.filter((record) => record.petId === filters.selectedPetId);
  }, [medicalRecords, filters.selectedPetId]);

  // 예약 데이터 (실제 진료기록 기반)
  const appointments = useMemo(() => {
    const recordsMap: Record<string, { type: string; color: string; record: (typeof filteredMedicalRecords)[0] }> = {};

    filteredMedicalRecords.forEach((record) => {
      const visitDate = new Date(record.visitDate);
      const dateKey = `${visitDate.getFullYear()}-${visitDate.getMonth() + 1}-${visitDate.getDate()}`;

      // 진료 유형에 따른 색상 결정
      let color = '#2196F3'; // 기본 일반진료
      if (
        record.treatmentPlan?.includes('예방') ||
        record.chiefComplaint?.includes('예방') ||
        record.treatmentPlan?.includes('접종') ||
        record.chiefComplaint?.includes('접종')
      ) {
        color = '#4CAF50'; // 예방접종
      } else if (
        record.treatmentPlan?.includes('검진') ||
        record.chiefComplaint?.includes('검진') ||
        record.treatmentPlan?.includes('건강') ||
        record.chiefComplaint?.includes('건강')
      ) {
        color = '#FF9800'; // 건강검진
      }

      recordsMap[dateKey] = {
        type: record.treatmentPlan?.includes('예방')
          ? '예방접종'
          : record.treatmentPlan?.includes('검진')
          ? '건강검진'
          : '일반진료',
        color,
        record,
      };
    });

    return recordsMap;
  }, [filteredMedicalRecords]);

  // 기존 진료기록 로드 로직 (주석처리)
  /*
  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      let isCancelled = false; // cleanup을 위한 플래그

      const loadMedicalRecords = async () => {
        try {
          console.log('🔄 진료기록 데이터 로드 시작... (userId:', currentUser.id, ')');

          // 사용자의 반려동물 정보 가져오기
          const petsResponse = await getMyPets();
          if (isCancelled) return; // 컴포넌트가 언마운트되었다면 중단

          if (
            petsResponse &&
            'data' in petsResponse &&
            Array.isArray(petsResponse.data) &&
            petsResponse.data.length > 0
          ) {
            console.log('🐕 반려동물 데이터:', petsResponse.data);
            // 먼저 등록된 반려동물이 위에 오도록 역순 정렬 (id 기준)
            const sortedPets = [...petsResponse.data].sort((a, b) => a.id - b.id);
            console.log('🔄 정렬된 반려동물 데이터:', sortedPets);
            setPets(sortedPets);

            // 첫 번째 반려동물의 진료기록 가져오기 (정렬된 배열의 첫 번째 요소 사용)
            const firstPetId = sortedPets[0].id;
            console.log('🔍 첫 번째 반려동물 ID로 진료기록 검색:', firstPetId);
            const recordsResponse = await getRecordsByPet(firstPetId);
            if (isCancelled) return; // 컴포넌트가 언마운트되었다면 중단

            if (recordsResponse && 'data' in recordsResponse && Array.isArray(recordsResponse.data)) {
              console.log('📋 진료기록 데이터:', recordsResponse.data);
              setMedicalRecords(recordsResponse.data);
            }
          } else {
            console.log('ℹ️ 등록된 반려동물이 없습니다.');
          }
        } catch (error) {
          if (isCancelled) return; // 컴포넌트가 언마운트되었다면 중단

          console.error('❌ 진료기록 로드 실패:', error);
          // 401 에러인 경우 인증 상태 초기화
          if (error instanceof Error && error.message.includes('인증이 필요합니다')) {
            console.log('🔓 인증 토큰이 유효하지 않음 - 로그아웃 처리');
            authLogout();
            clearUser();
            TokenManager.clearTokens();
          }
        }
      };

      loadMedicalRecords();

      // cleanup 함수
      return () => {
        isCancelled = true;
      };
    }
  }, [isAuthenticated, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  */

  // 로그인 모달 열기
  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  // 로그인 모달 닫기
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // 로그아웃 처리
  // const handleLogout = useCallback(() => {
  //   authLogout();
  //   clearUser();
  //   TokenManager.clearTokens();
  //   navigate('/'); // 홈 화면으로 이동
  // }, [authLogout, clearUser, navigate]);

  // 날짜 선택 시 해당 날짜의 진료기록으로 이동
  const handleDateSelect = useCallback(
    (date: Date) => {
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const appointment = appointments[dateKey];

      if (appointment && appointment.record) {
        // 해당 날짜에 진료기록이 있으면 바로 상세 페이지로 이동
        navigate(`/record/${appointment.record.id}`, {
          state: { record: appointment.record },
        });
      }
      // 진료기록이 없으면 아무것도 하지 않음
    },
    [appointments, navigate]
  );

  // 진료기록 선택 시 상세 페이지로 이동
  const handleRecordSelect = useCallback(
    (record: (typeof medicalRecords)[0]) => {
      console.log('🚀 진료기록 상세 페이지로 이동:', record);
      navigate(`/record/${record.id}`, {
        state: { record },
      });
    },
    [navigate]
  );

  // 사용자 이름 클릭 시 UserMoreScreen으로 이동
  const handleUserProfileClick = useCallback(() => {
    navigate('/user-more');
  }, [navigate]);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>
          <span className='hospital-name'></span>
        </div>
        <div className='header-center'>
          <span className='title'>홈</span>
        </div>
        <div className='header-right'>
          {!isAuthenticated ? (
            <button className='login-button' onClick={handleLogin} disabled={authLoading}>
              {authLoading ? (
                '로그인 중...'
              ) : (
                <>
                  <KeyIcon className='size-4' />
                  로그인
                </>
              )}
            </button>
          ) : (
            <button className='user-greeting' onClick={handleUserProfileClick}>
              {currentUser?.name || '사용자'}님
            </button>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {/* 인증 오류 메시지 */}
        {authError && (
          <div className='error-message'>
            <span>{authError}</span>
            <button onClick={clearAuthError} className='error-close-button'>
              <XMarkIcon className='size-4' />
            </button>
          </div>
        )}

        {/* 반려동물 필터 */}
        {isAuthenticated && pets.length > 0 && (
          <PetFilter
            pets={pets}
            selectedPetId={filters.selectedPetId}
            onPetSelect={setSelectedPetId}
            className='mb-4'
          />
        )}

        {/* 진료기록 캘린더 섹션 */}
        <div className='section'>
          <div className='calendar-container'>
            <MedicalRecordCalendar
              medicalRecords={filteredMedicalRecords}
              selectedDate={calendar.selectedDate || undefined}
              onDateSelect={handleDateSelect}
              onRecordSelect={handleRecordSelect}
            />
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
};

export default HomeScreen;
