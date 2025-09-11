import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    const handleKakaoCallback = async () => {
      try {
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
        setAuthTokens({
          accessToken,
          refreshToken,
        });

        // 공통 로그인 후처리 함수 호출 (사용자 정보 + 병원 정보 처리)
        console.log('⏰ 카카오 로그인 성공 - processLoginData 호출');
        await processLoginData(user, getMyHospital);

        // TokenManager에도 저장 (기존 호환성 유지)
        TokenManager.saveTokens({
          accessToken,
          refreshToken,
          user,
        });

        console.log('✅ 카카오 로그인 완료 - 홈 화면으로 이동');

        // 처리 완료 표시
        hasProcessed.current = true;

        // 홈 화면으로 리다이렉트
        navigate('/');
      } catch (error) {
        console.error('❌ 카카오 로그인 콜백 처리 실패:', error);
        navigate('/');
      }
    };

    handleKakaoCallback();
  }, [searchParams, navigate, setAuthTokens]);

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
