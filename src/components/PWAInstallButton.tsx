import React from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import './PWAInstallButton.css';

const PWAInstallButton: React.FC = () => {
  const { isInstallable, promptInstall, isInstalled } = useInstallPrompt();

  if (isInstalled) {
    return <div className='pwa-install-status'>✅ 앱이 설치되었습니다</div>;
  }

  if (!isInstallable) return null;

  return (
    <button className='pwa-install-button' onClick={promptInstall}>
      📱 홈 화면에 추가
    </button>
  );
};

export default PWAInstallButton;
