import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDwonStoreAuth, useDwonStorePets } from '../hooks/useDwonStoreAPI';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { TokenManager } from '../utils/token-manager';
import { Pet } from '../types/pet';
import { MedicalRecord } from '../types/medical-record';

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
 * 로그인 모달 컴포넌트
 * 카카오 로그인과 테스트 로그인 옵션을 제공
 */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 훅
  const { kakaoLogin, testLogin, loading: authLoading } = useDwonStoreAuth();
  const { getMyPetsWithRecords } = useDwonStorePets();

  // 스토어 훅
  const { login: setAuthTokens, logout: authLogout } = useAuthStore();
  const { setCurrentUser, clearUser } = useUserStore();
  const { setRecords: setMedicalRecords } = useRecordStore();
  const { setPets } = usePetStore();

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  /**
   * 카카오 로그인 처리
   */
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 카카오 로그인 데이터 (실제 구현에서는 카카오 SDK에서 받아온 데이터 사용)
      const kakaoData = {
        userId: 'kakao_user_id',
        provider: 'KAKAO' as const,
        accessToken: 'kakao_access_token',
        refreshToken: 'kakao_refresh_token',
        socialUser: {
          email: 'user@kakao.com',
          name: '카카오 사용자',
        },
      };

      const response = await kakaoLogin(kakaoData);

      // API 응답 구조에 맞게 처리
      if (
        response &&
        typeof response === 'object' &&
        'access_token' in response &&
        'refresh_token' in response &&
        'user' in response
      ) {
        // 인증 토큰 저장
        setAuthTokens({
          accessToken: response.access_token as string,
          refreshToken: response.refresh_token as string,
        });

        // 사용자 정보 저장
        setCurrentUser(response.user as User);

        onClose();
      } else {
        setError('카카오 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('카카오 로그인 중 오류가 발생했습니다.');
      console.error('카카오 로그인 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 테스트 로그인 처리 (이전 로그인 버튼 로직과 동일)
   */
  const handleTestLogin = async () => {
    setIsLoading(true);
    setError(null);

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
        setAuthTokens({
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

        console.log('✅ 테스트 로그인 성공! 데이터를 로드합니다.');

        // 로그인 성공 후 즉시 데이터 로드
        console.log('⏰ 로그인 성공 - loadPetsWithMedicalRecords 호출');
        await loadPetsWithMedicalRecordsDirect(loginData.user);

        onClose();
      } else {
        throw new Error('서버 응답에 필수 데이터가 누락되었습니다.');
      }
    } catch (err) {
      console.error('❌ 테스트 로그인 실패:', err);
      setError('테스트 로그인 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 로그인 시 사용자 정보를 직접 받는 데이터 로드 함수 (이전 로직과 동일)
   */
  const loadPetsWithMedicalRecordsDirect = async (user: User) => {
    console.log('🚀 loadPetsWithMedicalRecordsDirect 함수 호출됨');
    console.log('🔍 전달받은 사용자 정보:', { userId: user.id, userName: user.name });

    try {
      console.log('🔄 반려동물과 진료기록 데이터 로드 시작... (userId:', user.id, ')');

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
          .map((pet: Pet & { medicalRecords: MedicalRecord[] }) => ({
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
          .sort((a: Pet, b: Pet) => a.id - b.id);

        console.log('🔄 정렬된 반려동물 데이터:', sortedPets);
        setPets(sortedPets);

        // 모든 진료기록을 하나의 배열로 합치기
        const allMedicalRecords = petsWithRecordsResponse.data
          .flatMap((pet: Pet & { medicalRecords: MedicalRecord[] }) => pet.medicalRecords)
          .sort(
            (a: MedicalRecord, b: MedicalRecord) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
          );

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
  };

  /**
   * 모달 배경 클릭 시 닫기
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='login-modal-backdrop' onClick={handleBackdropClick}>
      <div className='login-modal'>
        {/* 모달 헤더 */}
        <div className='login-modal-header'>
          <h2 className='login-modal-title'>로그인</h2>
          <button className='login-modal-close' onClick={onClose} disabled={isLoading || authLoading}>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className='login-modal-content'>
          <p className='login-modal-description'>로그인 방법을 선택해주세요</p>

          {/* 에러 메시지 */}
          {error && <div className='login-modal-error'>{error}</div>}

          {/* 로그인 버튼들 */}
          <div className='login-modal-buttons'>
            <button
              className='login-modal-button login-modal-button--kakao'
              onClick={handleKakaoLogin}
              disabled={isLoading || authLoading}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  <span className='login-modal-button-icon'>💬</span>
                  카카오 로그인
                </>
              )}
            </button>

            <button
              className='login-modal-button login-modal-button--test'
              onClick={handleTestLogin}
              disabled={isLoading || authLoading}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  <span className='login-modal-button-icon'>🧪</span>
                  테스트 로그인
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
