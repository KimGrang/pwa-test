import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalSelector from '../components/HospitalSelector';
import { useUserAPI } from '../hooks';
import { useHospitalStore } from '../store/hospitalStore';
import { useUserStore } from '../store/userStore';
import '../styles/HospitalSelector.css';

const HospitalScreen: React.FC = () => {
  const navigate = useNavigate();
  const { updateHospital, loading: isUpdating } = useUserAPI();
  const { selectedHospital } = useHospitalStore();
  const { currentUser, updateUserProfile } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 병원 저장 핸들러
  const handleSave = async () => {
    if (!selectedHospital) {
      setSaveMessage({ type: 'error', text: '병원을 선택해주세요.' });
      return;
    }

    if (currentUser?.hospitalId === selectedHospital.id) {
      setSaveMessage({ type: 'success', text: '이미 선택된 병원입니다.' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // API를 통해 사용자의 병원 ID 업데이트
      await updateHospital(selectedHospital.id);

      // 로컬 스토어도 업데이트
      updateUserProfile({ hospitalId: selectedHospital.id });

      setSaveMessage({ type: 'success', text: '병원이 성공적으로 설정되었습니다.' });

      // 2초 후 메시지 자동 제거
      setTimeout(() => {
        setSaveMessage(null);
      }, 2000);
    } catch (error) {
      // 취소된 요청은 에러로 로깅하지 않음
      if (error instanceof Error && error.message !== 'canceled' && error.name !== 'CanceledError') {
        console.error('병원 설정 실패:', error);
        setSaveMessage({ type: 'error', text: '병원 설정에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/more');
  };

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
        <div className='header-center'>
          <span className='title'>병원 설정</span>
        </div>
        <div className='header-right'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-scrollable-content'>
        {/* 저장 메시지 */}
        {saveMessage && <div className={`save-message ${saveMessage.type}`}>{saveMessage.text}</div>}

        {/* 병원 선택 컴포넌트 */}
        <HospitalSelector />

        {/* 액션 버튼 */}
        <div className='form-actions'>
          <button
            className='action-button primary'
            onClick={handleSave}
            disabled={!selectedHospital || isSaving || isUpdating}
          >
            {isSaving || isUpdating ? '저장 중...' : '저장'}
          </button>

          <button className='action-button danger' onClick={handleCancel} disabled={isSaving || isUpdating}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalScreen;
