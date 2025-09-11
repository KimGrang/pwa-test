import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

/**
 * 네비게이션 바 컴포넌트
 * 동물병원 PWA 앱의 메인 네비게이션을 담당
 */
const Navigation: React.FC = () => {
  const location = useLocation();

  // 특정 경로에서 상위 탭을 활성화하도록 활성 탭 계산
  const activeTab = useMemo(() => {
    const pathname = location.pathname;

    // /install 경로에서는 더보기 탭을 활성화
    if (pathname === '/install') {
      return '/more';
    }

    // /record/:id 경로에서는 진료기록 탭을 활성화
    if (pathname.startsWith('/record/')) {
      return '/records';
    }

    // /pet-more, /user-more 경로에서는 더보기 탭을 활성화
    if (pathname === '/pet-more' || pathname === '/user-more') {
      return '/more';
    }

    // /notification, /hospital, /terms 경로에서는 더보기 탭을 활성화
    if (pathname === '/notification') {
      return '/more';
    }

    // /hospital 경로에서는 더보기 탭을 활성화
    if (pathname === '/hospital') {
      return '/more';
    }

    // /terms 경로에서는 더보기 탭을 활성화
    if (pathname === '/terms') {
      return '/more';
    }

    // 기본적으로는 현재 경로와 일치
    return pathname;
  }, [location.pathname]);

  const isActive = useMemo(
    () => (path: string) => {
      return activeTab === path;
    },
    [activeTab]
  );

  return (
    <nav className='navigation'>
      <div className='navigation-container'>
        <Link to='/' className={`navigation-link ${isActive('/') ? 'active' : ''}`}>
          <HomeIcon className='navigation-icon' />
          <span className='navigation-text'>홈</span>
        </Link>
        <Link to='/records' className={`navigation-link ${isActive('/records') ? 'active' : ''}`}>
          <ClipboardDocumentListIcon className='navigation-icon' />
          <span className='navigation-text'>진료 기록</span>
        </Link>
        <Link to='/chat' className={`navigation-link ${isActive('/chat') ? 'active' : ''}`}>
          <ChatBubbleLeftRightIcon className='navigation-icon' />
          <span className='navigation-text'>AI 상담</span>
        </Link>
        <Link to='/more' className={`navigation-link ${isActive('/more') ? 'active' : ''}`}>
          <Cog6ToothIcon className='navigation-icon' />
          <span className='navigation-text'>더보기</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
