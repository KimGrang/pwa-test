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
    <nav className='navigation'>
      <div className='navigation-container'>
        <Link to='/' className={`navigation-link ${isActive('/') ? 'active' : ''}`}>
          <span className='navigation-icon'>🏠</span>
          <span className='navigation-text'>홈</span>
        </Link>
        <Link to='/records' className={`navigation-link ${isActive('/records') ? 'active' : ''}`}>
          <span className='navigation-icon'>📋</span>
          <span className='navigation-text'>진료 기록</span>
        </Link>
        <Link to='/chat' className={`navigation-link ${isActive('/chat') ? 'active' : ''}`}>
          <span className='navigation-icon'>💬</span>
          <span className='navigation-text'>AI 상담</span>
        </Link>
        <Link to='/more' className={`navigation-link ${isActive('/more') ? 'active' : ''}`}>
          <span className='navigation-icon'>⚙️</span>
          <span className='navigation-text'>더보기</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
