import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 네비게이션 바 컴포넌트
 * 동물병원 PWA 앱의 메인 네비게이션을 담당
 */
const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className='app-navigation'>
      <div className='nav-container'>
        <Link to='/' className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <span className='nav-icon'>🏠</span>
          <span className='nav-text'>홈</span>
        </Link>
        <Link to='/records' className={`nav-link ${isActive('/records') ? 'active' : ''}`}>
          <span className='nav-icon'>📋</span>
          <span className='nav-text'>진료 기록</span>
        </Link>
        <Link to='/chat' className={`nav-link ${isActive('/chat') ? 'active' : ''}`}>
          <span className='nav-icon'>💬</span>
          <span className='nav-text'>AI 상담</span>
        </Link>
        <Link to='/more' className={`nav-link ${isActive('/more') ? 'active' : ''}`}>
          <span className='nav-icon'>⚙️</span>
          <span className='nav-text'>더보기</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
