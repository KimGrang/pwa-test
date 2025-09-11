import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDwonStoreHospitals } from '../hooks/useDwonStoreAPI';
import { TokenManager } from '../utils/token-manager';
import { processLoginData } from '../utils/loginPostProcess';

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 * URL 파라미터에서 토큰과 사용자 정보를 추출하여 저장
 */
const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  const { login: setAuthTokens } = useAuthStore();
  const { getMyHospital } = useDwonStoreHospitals();

  // setAuthTokens를 useCallback으로 메모이제이션
  const memoizedSetAuthTokens = useCallback(setAuthTokens, [setAuthTokens]);

  useEffect(() => {
    console.log('🔄 useEffect 실행됨 - hasProcessed:', hasProcessed.current);

    // 중복 실행 방지
    if (hasProcessed.current) {
      console.log('⏭️ 이미 처리됨 - useEffect 종료');
      return;
    }

    // 즉시 처리 완료 표시 (URL 파라미터 읽기 전에)
    hasProcessed.current = true;
    console.log('✅ hasProcessed.current = true 설정됨 (즉시)');

    const handleKakaoCallback = async () => {
      try {
        console.log('🚀 handleKakaoCallback 시작');

        // URL 파라미터에서 토큰과 사용자 정보 추출
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');

        if (!accessToken || !refreshToken || !userParam) {
          console.error('❌ 카카오 로그인 콜백: 필수 파라미터 누락');
          navigate('/');
          return;
        }

        // 사용자 정보 파싱
        const user = JSON.parse(decodeURIComponent(userParam));

        console.log('✅ 카카오 로그인 콜백 성공:', { user, accessToken, refreshToken });

        // Zustand store에 데이터 저장
        console.log('🔑 setAuthTokens 호출 전');
        memoizedSetAuthTokens({
          accessToken,
          refreshToken,
        });
        console.log('🔑 setAuthTokens 호출 후');

        // 공통 로그인 후처리 함수 호출 (사용자 정보 + 병원 정보 처리)
        console.log('⏰ 카카오 로그인 성공 - processLoginData 호출');
        await processLoginData(user, getMyHospital);
        console.log('⏰ processLoginData 완료');

        // TokenManager에도 저장 (기존 호환성 유지)
        console.log('🔐 TokenManager.saveTokens 호출 전');
        TokenManager.saveTokens({
          accessToken,
          refreshToken,
          user,
        });
        console.log('🔐 TokenManager.saveTokens 호출 후');

        console.log('✅ 카카오 로그인 완료 - 홈 화면으로 이동');

        // 홈 화면으로 리다이렉트
        navigate('/');
        console.log('🏠 navigate("/") 호출됨');
      } catch (error) {
        console.error('❌ 카카오 로그인 콜백 처리 실패:', error);
        navigate('/');
      }
    };

    handleKakaoCallback();
  }, [searchParams, memoizedSetAuthTokens, getMyHospital]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
      }}
    >
      카카오 로그인 처리 중...
    </div>
  );
};

export default KakaoCallback;
