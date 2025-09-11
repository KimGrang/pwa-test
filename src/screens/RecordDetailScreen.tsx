import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, ClipboardDocumentListIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';

/**
 * 진료기록 상세 화면 컴포넌트
 * 특정 진료기록의 상세 정보를 표시
 */
const DetailRecord: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { records } = useRecordStore();
  const { getPetById } = usePetStore();

  // recordId로 진료기록 찾기
  const record = records.find((r) => r.id === parseInt(recordId || '0', 10));

  // 진료기록이 없으면 홈으로 리다이렉트
  if (!record) {
    return (
      <div className='screen-container'>
        <div className='screen-header'>
          <div className='header-center'>
            <span className='plus-icon'>+</span>
            <span className='title'>응급동물병원</span>
          </div>
        </div>
        <div className='screen-scrollable-content'>
          <div className='error-message'>
            <h3>❌ 진료기록을 찾을 수 없습니다</h3>
            <p>요청하신 진료기록이 존재하지 않거나 삭제되었습니다.</p>
            <button className='back-button' onClick={() => navigate('/')}>
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 진료 유형에 따른 색상 결정
  const getRecordTypeColor = (record: (typeof records)[0]) => {
    if (
      record.treatmentPlan?.includes('예방') ||
      record.chiefComplaint?.includes('예방') ||
      record.treatmentPlan?.includes('접종') ||
      record.chiefComplaint?.includes('접종')
    ) {
      return '#4CAF50'; // 예방접종
    } else if (
      record.treatmentPlan?.includes('검진') ||
      record.chiefComplaint?.includes('검진') ||
      record.treatmentPlan?.includes('건강') ||
      record.chiefComplaint?.includes('건강')
    ) {
      return '#FF9800'; // 건강검진
    }
    return '#2196F3'; // 기본 일반진료
  };

  const recordTypeColor = getRecordTypeColor(record);
  const pet = getPetById(record.petId);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>
          <button className='back-button' onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
        </div>
        <div className='header-center'>
          <span className='plus-icon'>+</span>
          <span className='title'>진료기록 상세</span>
        </div>
        <div className='header-right'></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-scrollable-content'>
        <div className='detail-record-container'>
          {/* 진료기록 헤더 */}
          <div className='record-header'>
            <div className='record-date-section'>
              <h2 className='record-date'>
                {new Date(record.visitDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h2>
              <div className='record-type-badge' style={{ backgroundColor: recordTypeColor }}>
                {record.chiefComplaint}
              </div>
              {pet && (
                <div className='pet-name-badge'>
                  <HeartIcon className='navigation-icon mr-1' />
                  {pet.name}
                </div>
              )}
            </div>
          </div>

          {/* 진료기록 상세 정보 */}
          <div className='record-details-section'>
            <div className='detail-section'>
              <h3 className='section-title'>
                <ClipboardDocumentListIcon className='navigation-icon mr-1' />
                주요 증상
              </h3>
              <div className='section-content'>
                <p>{record.chiefComplaint}</p>
              </div>
            </div>

            <div className='detail-section'>
              <h3 className='section-title'>🔍 진찰 내용</h3>
              <div className='section-content'>
                <p>{record.examinationNotes}</p>
              </div>
            </div>

            <div className='detail-section'>
              <h3 className='section-title'>💊 치료 계획</h3>
              <div className='section-content'>
                <p>{record.treatmentPlan}</p>
              </div>
            </div>

            {record.followUp && (
              <div className='detail-section'>
                <h3 className='section-title'>📅 후속 조치</h3>
                <div className='section-content'>
                  <p>{record.followUp}</p>
                </div>
              </div>
            )}

            <div className='detail-section'>
              <h3 className='section-title'>ℹ️ 기록 정보</h3>
              <div className='section-content'>
                <div className='info-grid'>
                  <div className='info-item'>
                    <span className='info-label'>기록 ID:</span>
                    <span className='info-value'>{record.id}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>반려동물 ID:</span>
                    <span className='info-value'>{record.petId}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>병원 ID:</span>
                    <span className='info-value'>{record.hospitalId}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>수의사 ID:</span>
                    <span className='info-value'>{record.vetId}</span>
                  </div>
                  <div className='info-item'>
                    <span className='info-label'>기록 생성일:</span>
                    <span className='info-value'>
                      {new Date(record.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className='action-buttons'>
            <button className='action-button primary' onClick={() => navigate('/records')}>
              <ClipboardDocumentListIcon className='navigation-icon mr-1' />
              진료기록 목록
            </button>
            <button className='action-button primary' onClick={() => navigate('/')}>
              <HomeIcon className='navigation-icon mr-1' />
              홈으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRecord;
