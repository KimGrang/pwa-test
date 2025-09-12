import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  DocumentTextIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import { useAuthStore } from '../store/authStore';
import { useMedicalRecordsAPI } from '../hooks/useMedicalRecordsAPI';
import { MedicalRecordDetail } from '../types/medical-record';

/**
 * 진료기록 상세 화면 컴포넌트
 * 특정 진료기록의 상세 정보를 표시
 */
const DetailRecord: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { records } = useRecordStore();
  const { getPetById } = usePetStore();
  const { logout } = useAuthStore();
  const { loading, error, getRecordDetail, clearError } = useMedicalRecordsAPI();
  const [recordDetail, setRecordDetail] = useState<MedicalRecordDetail | null>(null);

  // recordId로 진료기록 찾기
  const record = records.find((r) => r.id === parseInt(recordId || '0', 10));

  // 컴포넌트 마운트 시 API 호출 (한 번만)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!recordId) return;

      try {
        console.log('🔍 API 호출 시작:', recordId);

        // 이전 에러 상태 초기화
        clearError();

        const response = await getRecordDetail(parseInt(recordId, 10));

        if (isMounted) {
          if (response && typeof response === 'object' && 'data' in response) {
            console.log('🔍 API 응답 성공:', response);
            setRecordDetail((response as { data: MedicalRecordDetail }).data);
          } else {
            console.error('🔍 API 응답 형식 오류:', response);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('🔍 API 호출 오류:', err);

          // 401 Unauthorized 에러 처리
          if (err instanceof Error && err.message.includes('Unauthorized')) {
            console.log('🔐 인증 토큰 만료 - 로그아웃 후 로그인 페이지로 이동');
            logout();
            navigate('/login');
            return;
          }
        }
      }
    };

    fetchData();

    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, [recordId, getRecordDetail, clearError]);

  // 디버깅용 로그 (한 번만 실행)
  useEffect(() => {
    console.log('🔍 RecordDetailScreen 마운트:', {
      recordId,
      loading,
      error,
    });
  }, [recordId, loading, error]);

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className='screen-container'>
        <div className='screen-header'>
          <div className='header-center'>
            <span className='plus-icon'>+</span>
            <span className='title'>진료기록 상세</span>
          </div>
        </div>
        <div className='screen-scrollable-content'>
          <div className='loading-message'>
            <h3>📋 진료기록을 불러오는 중...</h3>
            <p>잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리 (취소된 요청은 제외)
  if (error && error !== 'canceled') {
    // 401 Unauthorized 에러인 경우 로그인 페이지로 리다이렉트
    if (error === 'Unauthorized') {
      console.log('🔐 401 에러 감지 - 로그아웃 후 로그인 페이지로 이동');
      logout();
      navigate('/login');
      return null;
    }
    return (
      <div className='screen-container'>
        <div className='screen-header'>
          <div className='header-center'>
            <span className='plus-icon'>+</span>
            <span className='title'>진료기록 상세</span>
          </div>
        </div>
        <div className='screen-scrollable-content'>
          <div className='error-message'>
            <h3>❌ 진료기록을 불러올 수 없습니다</h3>
            <p>네트워크 오류가 발생했습니다. 다시 시도해주세요.</p>
            {error && (
              <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <small>오류 상세: {JSON.stringify(error, null, 2)}</small>
              </div>
            )}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button className='back-button' onClick={() => navigate(-1)}>
                뒤로 가기
              </button>
              <button
                className='back-button'
                onClick={async () => {
                  console.log('🔄 재시도 버튼 클릭');
                  if (recordId) {
                    try {
                      // 에러 상태 초기화
                      clearError();

                      const response = await getRecordDetail(parseInt(recordId, 10));
                      if (response && typeof response === 'object' && 'data' in response) {
                        setRecordDetail((response as { data: MedicalRecordDetail }).data);
                      }
                    } catch (err) {
                      console.error('🔍 재시도 API 오류:', err);
                    }
                  }
                }}
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* 진단서 정보 */}
            {recordDetail?.diagnosis && recordDetail.diagnosis.length > 0 ? (
              <div className='detail-section'>
                <h3 className='section-title'>
                  <DocumentTextIcon className='navigation-icon mr-1' />
                  진단서 정보
                </h3>
                <div className='section-content'>
                  {recordDetail.diagnosis.map((diagnosis) => (
                    <div key={diagnosis.id} className='diagnosis-item'>
                      <div className='diagnosis-header'>
                        <h4 className='disease-name'>{diagnosis.diseaseName}</h4>
                      </div>
                      <div className='diagnosis-details'>
                        <div className='info-grid'>
                          <div className='info-item'>
                            <span className='info-label'>동물 정보:</span>
                            <span className='info-value'>
                              {diagnosis.animalType} ({diagnosis.breed}) - {diagnosis.animalName}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>성별/나이:</span>
                            <span className='info-value'>
                              {diagnosis.gender} / {diagnosis.age}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>소유자:</span>
                            <span className='info-value'>{diagnosis.ownerName}</span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>진단일:</span>
                            <span className='info-value'>
                              {new Date(diagnosis.diagnosisDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>예후:</span>
                            <span className='info-value'>{diagnosis.prognosis}</span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>공유 여부:</span>
                            <span className='info-value'>{diagnosis.shared ? '공유됨' : '비공개'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='detail-section'>
                <h3 className='section-title'>
                  <DocumentTextIcon className='navigation-icon mr-1' />
                  진단서 정보
                </h3>
                <div className='section-content'>
                  <p className='no-data-message'>진단서 정보가 없습니다.</p>
                </div>
              </div>
            )}

            {/* 처방전 정보 */}
            {recordDetail?.prescriptions && recordDetail.prescriptions.length > 0 ? (
              <div className='detail-section'>
                <h3 className='section-title'>
                  <BeakerIcon className='navigation-icon mr-1' />
                  처방전 정보
                </h3>
                <div className='section-content'>
                  {recordDetail.prescriptions.map((prescription) => (
                    <div key={prescription.id} className='prescription-item'>
                      <div className='prescription-header'>
                        <h4 className='medication-name'>{prescription.medicationName}</h4>
                      </div>
                      <div className='prescription-details'>
                        <div className='info-grid'>
                          <div className='info-item'>
                            <span className='info-label'>용량:</span>
                            <span className='info-value'>{prescription.dosage}</span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>복용 횟수:</span>
                            <span className='info-value'>{prescription.frequency}</span>
                          </div>
                          <div className='info-item'>
                            <span className='info-label'>복용 기간:</span>
                            <span className='info-value'>{prescription.durationDays}일</span>
                          </div>
                          {prescription.specialInstructions && (
                            <div className='info-item'>
                              <span className='info-label'>특별 지시사항:</span>
                              <span className='info-value'>{prescription.specialInstructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='detail-section'>
                <h3 className='section-title'>
                  <BeakerIcon className='navigation-icon mr-1' />
                  처방전 정보
                </h3>
                <div className='section-content'>
                  <p className='no-data-message'>처방전 정보가 없습니다.</p>
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
