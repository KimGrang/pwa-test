import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import MedicalRecords from './screens/MedicalRecords';
import DetailRecord from './screens/DetailRecord';
import LLMChat from './screens/LLMChat';
import MoreScreen from './screens/MoreScreen';
import PWAInstallButton from './components/PWAInstallButton';
import Navigation from './components/Navigation';

/**
 * 메인 App 컴포넌트
 * 동물병원 PWA 앱의 전체 구조와 라우팅을 관리
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className='App'>
        {/* 메인 콘텐츠 영역 */}
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

            {/* PWA 설치 안내 화면 */}
            <Route
              path='/install'
              element={
                <div className='screen-base'>
                  <div className='screen-header'>
                    <h2>📱 PWA 설치</h2>
                    <p>이 앱은 오프라인에서도 동작하며, 홈 화면에 설치할 수 있습니다.</p>
                  </div>
                  <div className='screen-content'>
                    <PWAInstallButton />
                    <div className='app-description'>
                      <h3>PWA란?</h3>
                      <p>Progressive Web App(PWA)은 웹 앱이지만 네이티브 앱과 같은 사용자 경험을 제공합니다.</p>
                      <ul>
                        <li>오프라인에서도 동작</li>
                        <li>홈 화면에 설치 가능</li>
                        <li>푸시 알림 지원</li>
                        <li>빠른 로딩 속도</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* 네비게이션 바 */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
