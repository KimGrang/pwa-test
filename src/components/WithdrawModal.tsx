import React, { useState } from 'react';
import { useUserAPI } from '../hooks';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { useChatStore } from '../store/chatStore';
import { useHospitalStore } from '../store/hospitalStore';
import { useUIStore } from '../store/uiStore';
import { useAppStore } from '../store/appStore';
import { TokenManager } from '../utils/token-manager';
import '../styles/LoginModal.css';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 회원 탈퇴 확인 모달 컴포넌트
 * 사용자에게 탈퇴 시 주의사항을 알리고 최종 확인을 받습니다.
 */
const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API 훅
  const { withdraw, error, clearError } = useUserAPI();

  // 스토어 훅들
  const { clearAll: clearAuthStore } = useAuthStore();
  const { clearAll: clearUserStore } = useUserStore();
  const { clearAll: clearRecordStore } = useRecordStore();
  const { clearAll: clearPetStore } = usePetStore();
  const { clearAll: clearChatStore } = useChatStore();
  const { clearAll: clearHospitalStore } = useHospitalStore();
  const { clearAll: clearUIStore } = useUIStore();
  const { clearAll: clearAppStore } = useAppStore();

  /**
   * 모달 닫기 처리
   */
  const handleClose = () => {
    if (isLoading) return;

    setIsConfirming(false);
    setConfirmText('');
    clearError();
    onClose();
  };

  /**
   * 탈퇴 확인 단계로 이동
   */
  const handleStartWithdraw = () => {
    setIsConfirming(true);
  };

  /**
   * 회원 탈퇴 실행
   */
  const handleWithdraw = async () => {
    if (confirmText !== '탈퇴하겠습니다') {
      alert('정확한 확인 문구를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const response = await withdraw();

      if (response) {
        // 모든 스토어 데이터 삭제
        clearAuthStore();
        clearUserStore();
        clearRecordStore();
        clearPetStore();
        clearChatStore();
        clearHospitalStore();
        clearUIStore();
        clearAppStore();

        // 토큰 삭제
        TokenManager.clearTokens();

        alert('회원 탈퇴가 완료되었습니다.');
        onSuccess();
      }
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ESC 키로 모달 닫기
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={handleClose} onKeyDown={handleKeyDown}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2 className='modal-title'>회원 탈퇴</h2>
          <button className='modal-close' onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <div className='modal-body'>
          {!isConfirming ? (
            // 첫 번째 단계: 주의사항 안내
            <div className='withdraw-warning'>
              <div className='warning-icon'>⚠️</div>
              <h3>정말 탈퇴하시겠습니까?</h3>

              <div className='warning-content'>
                <p>
                  회원 탈퇴 시 다음 데이터가 <strong>영구적으로 삭제</strong>됩니다:
                </p>
                <ul>
                  <li>• 개인정보 및 계정 정보</li>
                  <li>• 등록된 반려동물 정보</li>
                  <li>• 모든 진료 기록</li>
                  <li>• AI 상담 기록</li>
                  <li>• 채팅 기록</li>
                </ul>

                <div className='warning-note'>
                  <p>
                    <strong>주의:</strong> 탈퇴 후에는 데이터 복구가 불가능합니다.
                  </p>
                </div>
              </div>

              <div className='modal-actions'>
                <button className='btn btn-secondary' onClick={handleClose} disabled={isLoading}>
                  취소
                </button>
                <button className='btn btn-danger' onClick={handleStartWithdraw} disabled={isLoading}>
                  탈퇴 진행
                </button>
              </div>
            </div>
          ) : (
            // 두 번째 단계: 최종 확인
            <div className='withdraw-confirm'>
              <div className='confirm-icon'>🔒</div>
              <h3>최종 확인</h3>

              <div className='confirm-content'>
                <p>회원 탈퇴를 진행하려면 아래 문구를 정확히 입력해주세요:</p>
                <div className='confirm-text'>
                  <strong>"탈퇴하겠습니다"</strong>
                </div>

                <input
                  type='text'
                  className='confirm-input'
                  placeholder='탈퇴하겠습니다'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className='error-message'>
                  {typeof error === 'string' ? error : '회원 탈퇴 중 오류가 발생했습니다.'}
                </div>
              )}

              <div className='modal-actions'>
                <button className='btn btn-secondary' onClick={() => setIsConfirming(false)} disabled={isLoading}>
                  뒤로
                </button>
                <button
                  className='btn btn-danger'
                  onClick={handleWithdraw}
                  disabled={isLoading || confirmText !== '탈퇴하겠습니다'}
                >
                  {isLoading ? '처리 중...' : '탈퇴 완료'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
