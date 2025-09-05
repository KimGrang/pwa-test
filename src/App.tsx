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
      <div className='h-screen w-full max-w-3xl mx-auto bg-black text-white relative overflow-hidden flex flex-col'>
        {/* 메인 콘텐츠 영역 - 스크롤 가능 */}
        <main className='flex-1 relative overflow-hidden'>
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
                <div className='h-full bg-black text-white flex flex-col overflow-hidden'>
                  <div className='bg-gray-800 p-4 text-center border-b border-gray-600 flex-shrink-0'>
                    <h2 className='text-xl font-bold mb-2'>📱 PWA 설치</h2>
                    <p className='text-sm text-gray-300'>
                      이 앱은 오프라인에서도 동작하며, 홈 화면에 설치할 수 있습니다.
                    </p>
                  </div>
                  <div className='flex-1 overflow-y-auto p-4 pb-20'>
                    <PWAInstallButton />
                    <div className='mt-6'>
                      <h3 className='text-lg font-semibold mb-3'>PWA란?</h3>
                      <p className='text-gray-300 mb-4'>
                        Progressive Web App(PWA)은 웹 앱이지만 네이티브 앱과 같은 사용자 경험을 제공합니다.
                      </p>
                      <ul className='space-y-2 text-gray-300'>
                        <li>• 오프라인에서도 동작</li>
                        <li>• 홈 화면에 설치 가능</li>
                        <li>• 푸시 알림 지원</li>
                        <li>• 빠른 로딩 속도</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* 네비게이션 바 - 고정 위치 */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
