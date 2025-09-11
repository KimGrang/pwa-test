import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
        <div className='header-center'>
          <span className='title'>알림 설정</span>
        </div>
        <div className='header-right'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
      </div>

      <div className='screen-scrollable-content'>
        {/* 액션 버튼 */}
        <div className='form-actions'>
          <button className='action-button primary'>저장</button>

          <button className='action-button danger' onClick={() => navigate('/more')}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
