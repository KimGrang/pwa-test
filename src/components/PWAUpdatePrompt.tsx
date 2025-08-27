import React from 'react';
import { usePWA } from '../hooks/usePWA';
import './PWAUpdatePrompt.css';

const PWAUpdatePrompt: React.FC = () => {
  const { offlineReady, needRefresh, updateServiceWorker, closePrompt } = usePWA();

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className='pwa-update-prompt'>
      <div className='pwa-update-toast'>
        <div className='pwa-update-message'>
          {offlineReady
            ? '앱이 오프라인에서 사용 가능합니다.'
            : '새 콘텐츠를 사용할 수 있습니다. 새로고침하시겠습니까?'}
        </div>
        <div className='pwa-update-buttons'>
          {needRefresh && (
            <button className='pwa-update-button primary' onClick={() => updateServiceWorker(true)}>
              새로고침
            </button>
          )}
          <button className='pwa-update-button secondary' onClick={closePrompt}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
