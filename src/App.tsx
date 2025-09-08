import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import MedicalRecords from './screens/MedicalRecords';
import DetailRecord from './screens/DetailRecord';
import LLMChat from './screens/LLMChat';
import MoreScreen from './screens/MoreScreen';
import UserMoreScreen from './screens/UserMoreScreen';
import PetMoreScreen from './screens/PetMoreScreen';
import InstallScreen from './screens/InstallScreen';
import Navigation from './components/Navigation';

/**
 * 메인 App 컴포넌트
 * 동물병원 PWA 앱의 전체 구조와 라우팅을 관리
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className='app-container'>
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
          </Routes>
        </main>

        {/* 네비게이션 바 - 고정 위치 */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
