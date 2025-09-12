import React, { useState, useEffect, useCallback } from 'react';
import { useUserAPI } from '../hooks';
import { useHospitalStore } from '../store/hospitalStore';
import { useUserStore } from '../store/userStore';
import type { Hospital } from '../types/hospital';

/**
 * 병원 선택 컴포넌트
 * 모든 병원 목록을 불러와서 사용자가 선택할 수 있도록 함
 */
const HospitalSelector: React.FC = () => {
  const { getHospitals, loading, error } = useUserAPI();
  const { hospitals, setHospitals, selectedHospital, setSelectedHospital } = useHospitalStore();
  const { currentUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [hasLoadedHospitals, setHasLoadedHospitals] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 병원 목록 로드
  const loadHospitals = useCallback(async () => {
    // 이미 로딩 중이거나 이미 로드된 경우 중복 요청 방지
    if (isLoadingHospitals || hasLoadedHospitals || !isMounted) {
      // console.log('병원 목록 로드 스킵 - 이미 로딩 중이거나 로드됨 또는 마운트되지 않음');
      return;
    }

    // console.log('병원 목록 로드 시작');
    setIsLoadingHospitals(true);
    try {
      const response = await getHospitals({ page: 1, limit: 100 }); // 모든 병원을 가져오기 위해 큰 limit 설정
      if (response?.data && isMounted) {
        setHospitals((response as unknown as { data: Hospital[] }).data);
        setHasLoadedHospitals(true);
        // console.log('병원 목록 로드 성공:', (response as unknown as { data: Hospital[] }).data.length, '개');
      }
    } catch (err) {
      // 모든 에러를 로깅하여 문제 파악
      console.error('병원 목록 로드 실패:', err);
      // console.log('에러 타입:', typeof err);
      // console.log('에러 이름:', err instanceof Error ? err.name : 'N/A');
      // console.log('에러 메시지:', err instanceof Error ? err.message : String(err));
    } finally {
      if (isMounted) {
        setIsLoadingHospitals(false);
      }
    }
  }, [getHospitals, setHospitals, isLoadingHospitals, hasLoadedHospitals, isMounted]);

  // 컴포넌트 마운트 시 병원 목록 로드 (한 번만 실행)
  useEffect(() => {
    // console.log('컴포넌트 마운트 - 병원 목록 로드 시작');
    setIsMounted(true);
    loadHospitals();

    // 언마운트 시 정리
    return () => {
      // console.log('컴포넌트 언마운트');
      setIsMounted(false);
    };
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 현재 사용자의 병원이 설정되어 있다면 선택된 병원으로 설정
  useEffect(() => {
    if (currentUser?.hospitalId && hospitals.length > 0) {
      const userHospital = hospitals.find((h) => h.id === currentUser.hospitalId);
      if (userHospital) {
        setSelectedHospital(userHospital);
      }
    }
  }, [currentUser?.hospitalId, hospitals, setSelectedHospital]);

  // 검색 필터링
  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 병원 선택/해제 토글 핸들러
  const handleHospitalToggle = (hospital: Hospital) => {
    if (selectedHospital?.id === hospital.id) {
      // 이미 선택된 병원을 다시 클릭하면 선택 해제
      setSelectedHospital(null);
    } else {
      // 새로운 병원 선택
      setSelectedHospital(hospital);
    }
  };

  if (isLoadingHospitals || loading) {
    return (
      <div className='hospital-selector'>
        <div className='loading-container'>
          <div className='loading-spinner'></div>
          <p>병원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='hospital-selector'>
        <div className='error-container'>
          <p className='error-message'>병원 목록을 불러오는데 실패했습니다.</p>
          <button className='retry-button' onClick={loadHospitals}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='hospital-selector'>
      {/* 검색 입력 */}
      <div className='search-container'>
        <input
          type='text'
          placeholder='병원명 또는 주소로 검색...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='search-input'
        />
      </div>

      {/* 병원 목록 */}
      <div className='hospitals-list'>
        <h3>병원 목록</h3>
        {isLoadingHospitals ? (
          <div className='loading-state'>
            <p>병원 목록을 불러오는 중...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className='no-results'>
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className='hospitals-grid'>
            {filteredHospitals.map((hospital) => {
              // 선택된 병원이 있고, 현재 병원이 선택된 병원이 아니면 숨김 처리
              const isHidden = selectedHospital && selectedHospital.id !== hospital.id;

              return (
                <div
                  key={hospital.id}
                  className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''} ${
                    isHidden ? 'hidden' : ''
                  }`}
                  onClick={() => handleHospitalToggle(hospital)}
                >
                  <div className='hospital-header'>
                    <h4 className='hospital-name'>{hospital.name}</h4>
                    {selectedHospital?.id === hospital.id && <span className='selected-badge'>선택됨</span>}
                  </div>
                  <div className='hospital-details'>
                    <p className='hospital-address'>{hospital.address}</p>
                    <p className='hospital-phone'>{hospital.phone}</p>
                    {hospital.specialties.length > 0 && (
                      <div className='hospital-specialties'>
                        <span className='specialties-label'>전문과목:</span>
                        <span className='specialties-list'>
                          {hospital.specialties.slice(0, 2).join(', ')}
                          {hospital.specialties.length > 2 && '...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalSelector;
