import React from 'react';
import { usePWA } from '../hooks/usePWA';

const PWAUpdatePrompt: React.FC = () => {
  const { offlineReady, needRefresh, updateServiceWorker, closePrompt } = usePWA();

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      <div className='bg-gray-800 text-white p-4 rounded-lg shadow-xl max-w-sm animate-slide-up'>
        <div className='mb-3 text-sm'>
          {offlineReady
            ? '앱이 오프라인에서 사용 가능합니다.'
            : '새 콘텐츠를 사용할 수 있습니다. 새로고침하시겠습니까?'}
        </div>
        <div className='flex gap-2 justify-end'>
          {needRefresh && (
            <button
              className='bg-primary text-white px-4 py-2 rounded text-xs font-medium hover:bg-primary-dark transition-colors duration-200'
              onClick={() => updateServiceWorker(true)}
            >
              새로고침
            </button>
          )}
          <button
            className='bg-transparent text-gray-300 border border-gray-500 px-4 py-2 rounded text-xs font-medium hover:bg-gray-700 transition-colors duration-200'
            onClick={closePrompt}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
