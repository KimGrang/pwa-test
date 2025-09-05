import React from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const PWAInstallButton: React.FC = () => {
  const { isInstallable, promptInstall, isInstalled } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className='bg-success text-white px-4 py-2 rounded-lg font-semibold border border-success-dark shadow-sm text-sm'>
        ✅ 앱이 설치되었습니다
      </div>
    );
  }

  if (!isInstallable) return null;

  return (
    <button
      className='bg-primary text-white border-2 border-primary-dark rounded-lg px-6 py-3 text-base font-bold cursor-pointer transition-all duration-250 shadow-sm hover:bg-primary-dark hover:border-primary-dark hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:translate-y-0 active:shadow-sm'
      onClick={promptInstall}
    >
      📱 홈 화면에 추가
    </button>
  );
};

export default PWAInstallButton;
