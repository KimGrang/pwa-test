import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { TokenManager } from '../utils/token-manager';

/**
 * 카카오 로그인 콜백 처리 컴포넌트
 * URL 파라미터에서 토큰과 사용자 정보를 추출하여 저장
 */
const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login: setAuthTokens } = useAuthStore();
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
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
        setCurrentUser(user);
        setAuthTokens({
          accessToken,
          refreshToken,
        });

        // TokenManager에도 저장 (기존 호환성 유지)
        TokenManager.saveTokens({
          accessToken,
          refreshToken,
          user,
        });

        console.log('✅ 카카오 로그인 완료 - 홈 화면으로 이동');

        // 홈 화면으로 리다이렉트
        navigate('/');
      } catch (error) {
        console.error('❌ 카카오 로그인 콜백 처리 실패:', error);
        navigate('/');
      }
    };

    handleKakaoCallback();
  }, [searchParams, navigate, setAuthTokens, setCurrentUser]);

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
