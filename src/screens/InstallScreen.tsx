import React from 'react';
import PWAInstallButton from '../components/PWAInstallButton';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * PWA 설치 화면 컴포넌트
 * MoreScreen과 동일한 디자인 패턴을 사용하여 일관된 UI 제공
 */
const InstallScreen: React.FC = () => {
  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
        <div className='header-center'>
          <span className='title'>웹앱 설치</span>
        </div>
        <div className='header-right'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {/* PWA 설치 섹션 */}
        <div className='section'>
          <h3 className='section-title'>📱 PWA 설치</h3>
          <p className='pwa-install-description'>이 앱은 오프라인에서도 동작하며, 홈 화면에 설치할 수 있습니다.</p>
          <div className='pwa-install-button-container'>
            <PWAInstallButton />
          </div>
        </div>

        {/* 설치 방법 섹션 */}
        <div className='section'>
          <h3 className='section-title'>📋 설치 방법</h3>
          <div className='install-steps'>
            <div className='install-step'>
              <div className='step-number'>1</div>
              <div className='step-content'>
                <h4>Chrome/Edge 브라우저</h4>
                <p>주소창 오른쪽의 "설치" 아이콘을 클릭하거나, 메뉴(⋮) → "앱 설치"를 선택하세요.</p>
              </div>
            </div>
            <div className='install-step'>
              <div className='step-number'>2</div>
              <div className='step-content'>
                <h4>Safari (iOS)</h4>
                <p>공유 버튼(□↗)을 누르고 "홈 화면에 추가"를 선택하세요.</p>
              </div>
            </div>
            <div className='install-step'>
              <div className='step-number'>3</div>
              <div className='step-content'>
                <h4>Firefox</h4>
                <p>주소창의 "+" 아이콘을 클릭하거나, 메뉴 → "페이지 설치"를 선택하세요.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA 정보 섹션 */}
        <div className='section'>
          <h3 className='section-title'>PWA란?</h3>
          <p className='pwa-info-description'>
            Progressive Web App(PWA)은 웹 앱이지만 네이티브 앱과 같은 사용자 경험을 제공합니다.
          </p>
          <div className='pwa-features-list'>
            <div className='feature-item'>
              <span className='feature-text'>오프라인에서도 동작</span>
            </div>
            <div className='feature-item'>
              <span className='feature-text'>홈 화면에 설치 가능</span>
            </div>
            <div className='feature-item'>
              <span className='feature-text'>푸시 알림 지원</span>
            </div>
            <div className='feature-item'>
              <span className='feature-text'>빠른 로딩 속도</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallScreen;
