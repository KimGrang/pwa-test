import React from 'react';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import PWAInstallButton from './components/PWAInstallButton';
import LLMChat from './components/LLMChat';
import './App.css';

const App: React.FC = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>🤖 wllama AI 채팅 PWA</h1>
        <p>wllama를 사용한 온디바이스 AI 모델로 대화하세요</p>
        <PWAInstallButton />
      </header>

      <main>
        <div className='app-description'>
          <p>이 앱은 오프라인에서도 동작하며, 홈 화면에 설치할 수 있습니다.</p>
        </div>

        <div className='llm-section'>
          <LLMChat />
        </div>
      </main>

      <PWAUpdatePrompt />
    </div>
  );
};

export default App;
