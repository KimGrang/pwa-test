import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { usePetAPIHook } from '../hooks/usePetAPI';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 반려동물 편집/추가 화면 컴포넌트
 * 반려동물 추가, 편집, 삭제 기능 제공
 */
const PetMoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pets, addPet, updatePet, removePet, setPets } = usePetStore();
  const {
    createPet,
    updatePet: updatePetAPI,
    deletePet: deletePetAPI,
    fetchMyPets,
    loading: isLoading,
    error: apiError,
  } = usePetAPIHook();

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);

  // 목록 새로고침 함수
  const refreshPetsList = useCallback(async () => {
    try {
      const petsData = await fetchMyPets(1, 50);
      if (petsData) {
        setPets(petsData);
      }
    } catch (error) {
      console.error('목록 새로고침 오류:', error);
      // API 오류 시 기존 store 데이터 유지 (사용자에게 알리지 않음)
      console.log('API 오류로 인해 기존 데이터를 유지합니다.');
    }
  }, [fetchMyPets, setPets]);

  // 새 반려동물/편집 데이터 (API 문서에 맞춰 수정)
  const [petData, setPetData] = useState({
    name: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    weight: 0,
    neutered: false,
    birthDate: '',
    profileImageUrl: null as string | null,
  });

  /**
   * 새 반려동물 추가 모드 시작
   */
  const handleAddPet = useCallback(() => {
    setPetData({
      name: '',
      gender: 'MALE',
      weight: 0,
      neutered: false,
      birthDate: '',
      profileImageUrl: null,
    });
    setEditingPetId(null);
    setIsEditing(true);
  }, []);

  /**
   * 기존 반려동물 편집 모드 시작
   */
  const handleEditPet = useCallback(
    (petId: number) => {
      // Store에서 반려동물 정보를 가져옴
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setPetData({
          name: pet.name || '',
          gender: pet.gender || 'MALE',
          weight: pet.weight || 0,
          neutered: pet.neutered || false,
          birthDate: pet.birthDate || '',
          profileImageUrl: pet.profileImageUrl || null,
        });
        setEditingPetId(petId);
        setIsEditing(true);
      } else {
        alert('반려동물 정보를 찾을 수 없습니다.');
        navigate('/more');
      }
    },
    [pets, navigate]
  );

  // URL 쿼리 파라미터 확인하여 추가/편집 모드로 시작
  useEffect(() => {
    const mode = searchParams.get('mode');
    const petId = searchParams.get('id');

    if (mode === 'add') {
      handleAddPet();
    } else if (mode === 'edit' && petId) {
      handleEditPet(parseInt(petId));
    }
  }, [searchParams, handleAddPet, handleEditPet]);

  /**
   * 편집 취소
   */
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingPetId(null);
    setPetData({
      name: '',
      gender: 'MALE',
      weight: 0,
      neutered: false,
      birthDate: '',
      profileImageUrl: null,
    });
    navigate('/more'); // 취소 시 MoreScreen으로 이동
  }, [navigate]);

  /**
   * 반려동물 저장
   */
  const handleSavePet = useCallback(async () => {
    // 필수 필드 검증
    if (!petData.name.trim()) {
      alert('반려동물 이름을 입력해주세요.');
      return;
    }

    // setIsLoading(true);
    try {
      if (editingPetId) {
        // 기존 반려동물 수정 - API 호출
        const updatedPet = await updatePetAPI(editingPetId, petData);
        if (updatedPet) {
          // 로컬 상태도 업데이트
          updatePet(editingPetId, petData);
          // 목록 직접 새로고침
          await refreshPetsList();
          alert('반려동물 정보가 수정되었습니다.');
          navigate('/more'); // 수정 후 MoreScreen으로 이동
        } else {
          alert('반려동물 정보 수정에 실패했습니다.');
        }
      } else {
        // 새 반려동물 추가 - API 호출
        const newPet = await createPet(petData);
        if (newPet) {
          // 로컬 상태도 업데이트
          addPet(newPet);
          // 목록 직접 새로고침
          await refreshPetsList();
          alert('반려동물이 추가되었습니다.');
          navigate('/more'); // 추가 후 MoreScreen으로 이동
        } else {
          alert('반려동물 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('반려동물 저장 오류:', error);
      const errorMessage = apiError || '반려동물 저장 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      // setIsLoading(false);
    }
  }, [petData, editingPetId, updatePetAPI, createPet, addPet, updatePet, navigate, apiError, refreshPetsList]);

  /**
   * 반려동물 삭제
   */
  const handleDeletePet = useCallback(
    async (petId: number) => {
      const pet = pets.find((p) => p.id === petId);
      if (!pet) return;

      if (window.confirm(`정말 "${pet.name}"을(를) 삭제하시겠습니까?`)) {
        try {
          // setIsLoading(true);
          // API 호출로 삭제
          const deletedPet = await deletePetAPI(petId);
          if (deletedPet) {
            // 로컬 상태도 업데이트
            removePet(petId);
            // 목록 직접 새로고침
            await refreshPetsList();
            alert('반려동물이 삭제되었습니다.');
            navigate('/more'); // 삭제 후 MoreScreen으로 이동
          } else {
            alert('반려동물 삭제에 실패했습니다.');
          }
        } catch (error) {
          console.error('반려동물 삭제 오류:', error);
          const errorMessage = apiError || '반려동물 삭제 중 오류가 발생했습니다.';
          alert(errorMessage);
        } finally {
          // setIsLoading(false);
        }
      }
    },
    [pets, deletePetAPI, removePet, navigate, apiError, refreshPetsList]
  );

  /**
   * 나이 계산
   */
  const calculateAge = useCallback((birthDate: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1}세`;
    }
    return `${age}세`;
  }, []);

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'></div>
        <div className='header-center'>
          <span className='title'>반려동물 관리</span>
        </div>
        <div className='header-right'></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-compact-content'>
        {isEditing ? (
          /* 편집 모드 */
          <div className='section'>
            <h3 className='section-title'>{editingPetId ? '반려동물 정보 수정' : '새 반려동물 추가'}</h3>

            <div className='pet-edit-form'>
              {/* 이름 */}
              <div className='input-group'>
                <label className='input-label'>이름 *</label>
                <input
                  type='text'
                  className='input-field'
                  value={petData.name}
                  onChange={(e) => setPetData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder='반려동물 이름을 입력하세요'
                  maxLength={20}
                />
              </div>

              {/* 중성화 여부 */}
              <div className='input-group'>
                <label className='input-label'>중성화 여부</label>
                <div className='radio-group'>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='neutered'
                      value='false'
                      checked={!petData.neutered}
                      onChange={() => setPetData((prev) => ({ ...prev, neutered: false }))}
                    />
                    <span className='radio-label'>미완료</span>
                  </label>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='neutered'
                      value='true'
                      checked={petData.neutered}
                      onChange={() => setPetData((prev) => ({ ...prev, neutered: true }))}
                    />
                    <span className='radio-label'>완료</span>
                  </label>
                </div>
              </div>

              {/* 생년월일 */}
              <div className='input-group'>
                <label className='input-label'>생년월일</label>
                <div className='date-selector'>
                  <select
                    className='date-select'
                    value={petData.birthDate ? new Date(petData.birthDate).getFullYear() : ''}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      const currentDate = petData.birthDate ? new Date(petData.birthDate) : new Date();
                      const month = currentDate.getMonth() + 1;
                      const day = currentDate.getDate();
                      const newDate = new Date(year, month - 1, day);
                      setPetData((prev) => ({ ...prev, birthDate: newDate.toISOString().split('T')[0] }));
                    }}
                  >
                    <option value=''>연도 선택</option>
                    {Array.from({ length: 41 }, (_, i) => {
                      const currentYear = new Date().getFullYear();
                      const year = currentYear - 20 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className='date-select'
                    value={petData.birthDate ? new Date(petData.birthDate).getMonth() + 1 : ''}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      const currentDate = petData.birthDate ? new Date(petData.birthDate) : new Date();
                      const year = currentDate.getFullYear();
                      const day = currentDate.getDate();
                      const newDate = new Date(year, month - 1, day);
                      setPetData((prev) => ({ ...prev, birthDate: newDate.toISOString().split('T')[0] }));
                    }}
                  >
                    <option value=''>월 선택</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <select
                    className='date-select'
                    value={petData.birthDate ? new Date(petData.birthDate).getDate() : ''}
                    onChange={(e) => {
                      const day = parseInt(e.target.value);
                      const currentDate = petData.birthDate ? new Date(petData.birthDate) : new Date();
                      const year = currentDate.getFullYear();
                      const month = currentDate.getMonth() + 1;
                      const newDate = new Date(year, month - 1, day);
                      setPetData((prev) => ({ ...prev, birthDate: newDate.toISOString().split('T')[0] }));
                    }}
                  >
                    <option value=''>일 선택</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                {petData.birthDate && <div className='input-hint'>{calculateAge(petData.birthDate)}</div>}
              </div>

              {/* 성별 */}
              <div className='input-group'>
                <label className='input-label'>성별</label>
                <div className='radio-group'>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='gender'
                      value='MALE'
                      checked={petData.gender === 'MALE'}
                      onChange={(e) => setPetData((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                    />
                    <span className='radio-label'>수컷</span>
                  </label>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='gender'
                      value='FEMALE'
                      checked={petData.gender === 'FEMALE'}
                      onChange={(e) => setPetData((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                    />
                    <span className='radio-label'>암컷</span>
                  </label>
                </div>
              </div>

              {/* 체중 */}
              <div className='input-group'>
                <label className='input-label'>체중 (kg)</label>
                <input
                  type='number'
                  step='0.1'
                  className='input-field'
                  value={petData.weight}
                  onChange={(e) => {
                    const weight = parseFloat(e.target.value);
                    setPetData((prev) => ({ ...prev, weight: isNaN(weight) ? 0 : weight }));
                  }}
                  placeholder='체중을 입력하세요 (예: 5.5)'
                />
              </div>

              {/* 액션 버튼 */}
              <div className='form-actions'>
                <button className='action-button primary' onClick={handleSavePet} disabled={isLoading}>
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                {editingPetId && (
                  <button
                    className='action-button danger'
                    onClick={() => handleDeletePet(editingPetId)}
                    disabled={isLoading}
                  >
                    삭제
                  </button>
                )}
                <button className='action-button' onClick={handleCancelEdit} disabled={isLoading}>
                  취소
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PetMoreScreen;
