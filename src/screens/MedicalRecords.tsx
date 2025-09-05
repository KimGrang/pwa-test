import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordStore } from '../store/recordStore';
import { usePetStore } from '../store/petStore';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 진료 기록 화면 컴포넌트
 * 검색 기능과 진료 기록 리스트를 표시
 */
const TreatmentRecords: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // recordStore에서 진료기록 데이터 가져오기
  const { records } = useRecordStore();
  const { getPetById } = usePetStore();

  // 진료기록을 날짜순으로 정렬하고 검색 필터링
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          record.chiefComplaint.toLowerCase().includes(searchLower) ||
          record.examinationNotes.toLowerCase().includes(searchLower) ||
          record.treatmentPlan.toLowerCase().includes(searchLower) ||
          new Date(record.visitDate).toLocaleDateString('ko-KR').includes(searchLower)
        );
      })
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [records, searchQuery]);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-center'>
          <span className='title'>진료 기록</span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {/* 검색 섹션 */}
        <div className='section'>
          <div className='section-header'>
            <h3 className='section-title'>검색</h3>
          </div>
          <div className='search-container'>
            <input
              type='text'
              placeholder='진료기록 검색...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='search-input'
            />
            {searchQuery && (
              <button className='search-clear-button' onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
            <button className='search-icon-button'>🔍</button>
          </div>
        </div>

        {/* 진료 기록 리스트 섹션 */}
        <div className='section'>
          <div className='section-header'>
            <h3 className='section-title'>진료 기록 목록</h3>
          </div>
          <div className='records-list'>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.id} className='record-item' onClick={() => navigate(`/record/${record.id}`)}>
                  <div className='record-content'>
                    <span className='record-date'>
                      {new Date(record.visitDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className='record-title'>{record.chiefComplaint}</span>
                    <div className='record-details'>
                      <p>
                        <strong>진찰 내용:</strong> {record.examinationNotes}
                      </p>
                      <p>
                        <strong>치료 계획:</strong> {record.treatmentPlan}
                      </p>
                      {record.followUp && (
                        <p>
                          <strong>후속 조치:</strong> {record.followUp}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='record-pet-icon'>{getPetById(record.petId)?.name || '🐕'}</div>
                </div>
              ))
            ) : (
              <div className='empty-records'>
                <p className='empty-message'>등록된 진료기록이 없습니다.</p>
                {searchQuery && <p className='empty-search-message'>검색어 "{searchQuery}"에 대한 결과가 없습니다.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentRecords;
