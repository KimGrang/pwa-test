import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDwonStoreAuth, useDwonStorePets, useDwonStoreMedicalRecords } from '../hooks/useDwonStoreAPI';
import { TokenManager } from '../utils/token-manager';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { useUIStore } from '../store/uiStore';
import MedicalRecordCalendar from '../components/MedicalRecordCalendar';
import '../styles/base.css';
import '../styles/moreScreen.css';

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

  // Zustand stores
  const { currentUser, setCurrentUser, clearUser } = useUserStore();
  const { tokens, isAuthenticated, login: authLogin, logout: authLogout } = useAuthStore();
  const { records: medicalRecords, setRecords: setMedicalRecords } = useRecordStore();
  const { setPets } = usePetStore();
  const { calendar } = useUIStore();

  // example.com API 인증 Hook
  const { testLogin, loading: authLoading, error: authError, clearError: clearAuthError } = useDwonStoreAuth();

  // 반려동물 및 진료기록 관련 Hook
  const { getMyPets } = useDwonStorePets();
  const { getRecordsByPet } = useDwonStoreMedicalRecords();

  // 컴포넌트 마운트 시 현재 로그인 상태 확인
  useEffect(() => {
    const hasToken = TokenManager.getAccessToken();
    if (hasToken && !isAuthenticated) {
      // TokenManager에 저장된 사용자 정보가 있다면 store에 복원
      const userData = TokenManager.getUserData();
      if (userData && typeof userData === 'object' && 'id' in userData) {
        setCurrentUser(userData as User);
        authLogin({
          accessToken: hasToken,
          refreshToken: TokenManager.getRefreshToken() || '',
        });
      }
    }

    // 현재 상태를 콘솔에 출력
    console.log('🔍 현재 상태:', {
      isAuthenticated,
      currentUser,
      tokens,
      hasToken: !!hasToken,
    });

    // 401 에러 이벤트 수신 - axios interceptor에서 발생
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
  }, [isAuthenticated, setCurrentUser, authLogin, currentUser, tokens, authLogout, clearUser]);

  // 예약 데이터 (실제 진료기록 기반)
  const appointments = useMemo(() => {
    const recordsMap: Record<string, { type: string; color: string; record: (typeof medicalRecords)[0] }> = {};

    medicalRecords.forEach((record) => {
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
  }, [medicalRecords]);

  // 진료기록 데이터 로드 - 로그인 상태 변경 시에만 실행
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
            setPets(sortedPets);

            // 첫 번째 반려동물의 진료기록 가져오기
            const recordsResponse = await getRecordsByPet(petsResponse.data[0].id);
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

  // 테스트 로그인 처리 (서버 API 호출)
  const handleLogin = async () => {
    try {
      console.log('📡 서버에 테스트 로그인 요청...');

      // 서버 API 호출
      const response = await testLogin();

      console.log('📥 전체 서버 응답:', response);

      // response가 직접 데이터인지 확인
      if (
        response &&
        typeof response === 'object' &&
        'access_token' in response &&
        'refresh_token' in response &&
        'user' in response &&
        typeof response.access_token === 'string' &&
        typeof response.refresh_token === 'string' &&
        response.user &&
        typeof response.user === 'object'
      ) {
        // 타입 안전하게 데이터 추출
        const loginData = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          user: response.user as User,
          message: response.message as string,
        };

        console.log('✅ 서버 응답:', loginData);

        // Zustand store에 데이터 저장
        setCurrentUser(loginData.user);
        authLogin({
          accessToken: loginData.access_token,
          refreshToken: loginData.refresh_token,
        });

        // TokenManager에도 저장 (기존 호환성 유지)
        TokenManager.saveTokens({
          accessToken: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user,
        });

        // 저장된 데이터 확인
        console.log('💾 테스트 로그인 - Zustand store에 저장된 정보:', {
          user: loginData.user,
          tokens: {
            accessToken: loginData.access_token,
            refreshToken: loginData.refresh_token,
          },
        });

        console.log('✅ 테스트 로그인 성공! 인증 상태가 변경되어 자동으로 데이터가 로드됩니다.');
        alert('테스트 로그인 성공!');
      } else {
        throw new Error('서버 응답에 필수 데이터가 누락되었습니다.');
      }
    } catch (error) {
      console.error('❌ 테스트 로그인 실패:', error);
      alert('테스트 로그인 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
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

        {/* 진료기록 캘린더 섹션 */}
        <div className='section'>
          <div className='calendar-container'>
            <MedicalRecordCalendar
              medicalRecords={medicalRecords}
              selectedDate={calendar.selectedDate || undefined}
              onDateSelect={handleDateSelect}
              onRecordSelect={handleRecordSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
