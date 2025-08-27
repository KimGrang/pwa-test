import React from 'react';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import PWAInstallButton from './components/PWAInstallButton';
import './App.css';

const App: React.FC = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>PWA Test App</h1>
        <p>React + Vite + TypeScript PWA</p>
        <PWAInstallButton />
      </header>

      <main>
        <p>이 앱은 오프라인에서도 동작하며, 홈 화면에 설치할 수 있습니다.</p>
        <div className='features'>
          <div className='feature'>
            <h3>🚀 오프라인 지원</h3>
            <p>인터넷 연결 없이도 앱을 사용할 수 있습니다.</p>
          </div>
          <div className='feature'>
            <h3>📱 홈 화면 설치</h3>
            <p>모바일 기기의 홈 화면에 앱을 설치할 수 있습니다.</p>
          </div>
          <div className='feature'>
            <h3>⚡ 빠른 로딩</h3>
            <p>Service Worker를 통해 빠른 로딩과 캐싱을 제공합니다.</p>
          </div>
        </div>
      </main>

      <PWAUpdatePrompt />
    </div>
  );
};

export default App;
