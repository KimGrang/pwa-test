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
          <div className='flex items-center bg-gray-800 rounded-xl px-4 py-3 gap-3 w-full'>
            <input
              type='text'
              placeholder='진료기록 검색...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='flex-1 border-none bg-transparent text-base outline-none w-full text-white placeholder-gray-400'
            />
            {searchQuery && (
              <button
                className='bg-transparent border-none text-lg cursor-pointer text-gray-400 hover:text-white'
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
            <button className='bg-transparent border-none text-lg cursor-pointer text-gray-400 hover:text-white'>
              🔍
            </button>
          </div>
        </div>

        {/* 진료 기록 리스트 섹션 */}
        <div className='section'>
          <div className='section-header'>
            <h3 className='section-title'>진료 기록 목록</h3>
          </div>
          <div className='flex flex-col gap-4 w-full'>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className='flex items-center justify-between p-4 bg-gray-800 rounded-xl w-full cursor-pointer transition-all duration-200 hover:bg-gray-700 active:bg-gray-600'
                  onClick={() => navigate(`/record/${record.id}`)}
                >
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-gray-400'>
                      {new Date(record.visitDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className='text-base font-semibold text-white'>{record.chiefComplaint}</span>
                    <div className='text-sm text-gray-300 space-y-1'>
                      <p>
                        <strong className='text-gray-200'>진찰 내용:</strong> {record.examinationNotes}
                      </p>
                      <p>
                        <strong className='text-gray-200'>치료 계획:</strong> {record.treatmentPlan}
                      </p>
                      {record.followUp && (
                        <p>
                          <strong className='text-gray-200'>후속 조치:</strong> {record.followUp}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='text-2xl'>{getPetById(record.petId)?.name || '🐕'}</div>
                </div>
              ))
            ) : (
              <div className='text-center py-10 text-white'>
                <p className='text-lg mb-2'>등록된 진료기록이 없습니다.</p>
                {searchQuery && <p className='text-gray-400'>검색어 "{searchQuery}"에 대한 결과가 없습니다.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentRecords;
