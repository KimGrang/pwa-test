import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import MedicalRecords from './screens/RecordScreen';
import DetailRecord from './screens/RecordDetailScreen';
import LLMChat from './screens/LLMChat';
import MoreScreen from './screens/MoreScreen';
import UserMoreScreen from './screens/MoreUserScreen';
import PetMoreScreen from './screens/MorePetScreen';
import InstallScreen from './screens/InstallScreen';
import Navigation from './components/Navigation';
import KakaoCallback from './components/KakaoCallback';
import HospitalScreen from './screens/HospitalScreen';
import NotificationScreen from './screens/NotificationScreen';
import TermsScreen from './screens/TermsScreen';

import { usePWA } from './hooks/usePWA';

/**
 * 메인 App 컴포넌트
 * 동물병원 PWA 앱의 전체 구조와 라우팅을 관리
 */
const App: React.FC = () => {
  const { offlineReady, needRefresh, updateServiceWorker, closePrompt } = usePWA();

  return (
    <Router>
      <div className='app-container'>
        {/* PWA 상태 알림 */}
        {(offlineReady || needRefresh) && (
          <div className='pwa-global-notification'>
            <div className='pwa-notification-content'>
              {offlineReady && (
                <div className='pwa-notification-item success'>
                  <span className='notification-icon'>✅</span>
                  <span className='notification-text'>앱이 오프라인에서 사용 가능합니다.</span>
                </div>
              )}
              {needRefresh && (
                <div className='pwa-notification-item update'>
                  <span className='notification-icon'>🔄</span>
                  <span className='notification-text'>새 콘텐츠를 사용할 수 있습니다.</span>
                  <button className='notification-update-button' onClick={() => updateServiceWorker(true)}>
                    새로고침
                  </button>
                </div>
              )}
              <button className='notification-close-button' onClick={closePrompt}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 - 스크롤 가능 */}
        <main className='app-main'>
          <Routes>
            {/* 홈 화면 - 캘린더 뷰 */}
            <Route path='/' element={<HomeScreen />} />

            {/* 진료 기록 화면 */}
            <Route path='/records' element={<MedicalRecords />} />

            {/* 진료기록 상세 화면 */}
            <Route path='/record/:recordId' element={<DetailRecord />} />

            {/* AI 상담 화면 */}
            <Route path='/chat' element={<LLMChat />} />

            {/* 더보기 화면 */}
            <Route path='/more' element={<MoreScreen />} />

            {/* 사용자 상세 정보 화면 */}
            <Route path='/user-more' element={<UserMoreScreen />} />

            {/* 반려동물 관리 화면 */}
            <Route path='/pet-more' element={<PetMoreScreen />} />

            {/* PWA 설치 안내 화면 */}
            <Route path='/install' element={<InstallScreen />} />

            {/* 카카오 로그인 콜백 */}
            <Route path='/auth/kakao/callback' element={<KakaoCallback />} />

            {/* 병원 설정 화면 */}
            <Route path='/hospital' element={<HospitalScreen />} />

            {/* 알림 설정 화면 */}
            <Route path='/notification' element={<NotificationScreen />} />

            {/* 약관 및 개인정보처리방침 화면 */}
            <Route path='/terms' element={<TermsScreen />} />
          </Routes>
        </main>

        {/* 네비게이션 바 - 고정 위치 */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
