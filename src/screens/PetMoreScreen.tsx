import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import '../styles/base.css';
import '../styles/moreScreen.css';

/**
 * 반려동물 관리 화면 컴포넌트
 * 반려동물 목록 표시, 추가, 편집, 삭제 기능 제공
 */
const PetMoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { pets, addPet, updatePet, removePet, isLoading: storeLoading } = usePetStore();

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 새 반려동물/편집 데이터
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    age: 0,
    gender: 'MALE' as 'MALE' | 'FEMALE',
    weight: 0,
    color: '',
    birthDate: '',
    microchipNumber: '',
  });

  /**
   * 뒤로가기 처리
   */
  const handleGoBack = useCallback(() => {
    navigate('/more');
  }, [navigate]);

  /**
   * 새 반려동물 추가 모드 시작
   */
  const handleAddPet = useCallback(() => {
    setPetData({
      name: '',
      species: '',
      breed: '',
      age: 0,
      gender: 'MALE',
      weight: 0,
      color: '',
      birthDate: '',
      microchipNumber: '',
    });
    setEditingPetId(null);
    setIsEditing(true);
  }, []);

  /**
   * 기존 반려동물 편집 모드 시작
   */
  const handleEditPet = useCallback(
    (petId: number) => {
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setPetData({
          name: pet.name || '',
          species: pet.species || '',
          breed: pet.breed || '',
          age: pet.age || 0,
          gender: pet.gender || 'MALE',
          weight: pet.weight || 0,
          color: pet.color || '',
          birthDate: pet.birthDate || '',
          microchipNumber: pet.microchipNumber || '',
        });
        setEditingPetId(petId);
        setIsEditing(true);
      }
    },
    [pets]
  );

  /**
   * 편집 취소
   */
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingPetId(null);
    setPetData({
      name: '',
      species: '',
      breed: '',
      age: 0,
      gender: 'MALE',
      weight: 0,
      color: '',
      birthDate: '',
      microchipNumber: '',
    });
  }, []);

  /**
   * 반려동물 저장
   */
  const handleSavePet = useCallback(async () => {
    // 필수 필드 검증
    if (!petData.name.trim()) {
      alert('반려동물 이름을 입력해주세요.');
      return;
    }

    if (!petData.species.trim()) {
      alert('반려동물 종을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      if (editingPetId) {
        // 기존 반려동물 수정
        updatePet(editingPetId, petData);
        alert('반려동물 정보가 수정되었습니다.');
      } else {
        // 새 반려동물 추가 (임시 ID 생성)
        const newPet = {
          ...petData,
          id: Date.now(), // 임시 ID
          ownerId: 1, // 임시 ownerId
          hospitalId: 1, // 임시 hospitalId
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addPet(newPet);
        alert('반려동물이 추가되었습니다.');
      }

      setIsEditing(false);
      setEditingPetId(null);
      setPetData({
        name: '',
        species: '',
        breed: '',
        age: 0,
        gender: 'MALE',
        weight: 0,
        color: '',
        birthDate: '',
        microchipNumber: '',
      });
    } catch (error) {
      console.error('반려동물 저장 오류:', error);
      alert('반려동물 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [petData, editingPetId, addPet, updatePet]);

  /**
   * 반려동물 삭제
   */
  const handleDeletePet = useCallback(
    (petId: number) => {
      const pet = pets.find((p) => p.id === petId);
      if (!pet) return;

      if (window.confirm(`정말 "${pet.name}"을(를) 삭제하시겠습니까?`)) {
        try {
          removePet(petId);
          alert('반려동물이 삭제되었습니다.');
        } catch (error) {
          console.error('반려동물 삭제 오류:', error);
          alert('반려동물 삭제 중 오류가 발생했습니다.');
        }
      }
    },
    [pets, removePet]
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
        <div className='header-left'>
          <button className='back-button' onClick={handleGoBack}>
            ← 뒤로
          </button>
        </div>
        <div className='header-center'>
          <span className='title'>반려동물 관리</span>
        </div>
        <div className='header-right'>
          {!isEditing && (
            <button className='add-button' onClick={handleAddPet}>
              + 추가
            </button>
          )}
        </div>
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

              {/* 종 */}
              <div className='input-group'>
                <label className='input-label'>종 *</label>
                <input
                  type='text'
                  className='input-field'
                  value={petData.species}
                  onChange={(e) => setPetData((prev) => ({ ...prev, species: e.target.value }))}
                  placeholder='예: 개, 고양이, 햄스터'
                />
              </div>

              {/* 품종 */}
              <div className='input-group'>
                <label className='input-label'>품종</label>
                <input
                  type='text'
                  className='input-field'
                  value={petData.breed}
                  onChange={(e) => setPetData((prev) => ({ ...prev, breed: e.target.value }))}
                  placeholder='예: 골든리트리버, 페르시안'
                />
              </div>

              {/* 나이 */}
              <div className='input-group'>
                <label className='input-label'>나이 (세)</label>
                <input
                  type='number'
                  className='input-field'
                  value={petData.age}
                  onChange={(e) => setPetData((prev) => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  placeholder='나이를 입력하세요'
                  min='0'
                  max='30'
                />
              </div>

              {/* 생년월일 */}
              <div className='input-group'>
                <label className='input-label'>생년월일</label>
                <input
                  type='date'
                  className='input-field'
                  value={petData.birthDate}
                  onChange={(e) => setPetData((prev) => ({ ...prev, birthDate: e.target.value }))}
                />
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

              {/* 색상 */}
              <div className='input-group'>
                <label className='input-label'>색상</label>
                <input
                  type='text'
                  className='input-field'
                  value={petData.color}
                  onChange={(e) => setPetData((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder='예: 갈색, 흰색, 검은색'
                />
              </div>

              {/* 마이크로칩 번호 */}
              <div className='input-group'>
                <label className='input-label'>마이크로칩 번호</label>
                <input
                  type='text'
                  className='input-field'
                  value={petData.microchipNumber}
                  onChange={(e) => setPetData((prev) => ({ ...prev, microchipNumber: e.target.value }))}
                  placeholder='마이크로칩 번호를 입력하세요'
                />
              </div>

              {/* 액션 버튼 */}
              <div className='form-actions'>
                <button className='action-button primary' onClick={handleSavePet} disabled={isLoading}>
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                <button className='action-button' onClick={handleCancelEdit} disabled={isLoading}>
                  취소
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 목록 모드 */
          <div className='section'>
            <h3 className='section-title'>내 반려동물</h3>

            {storeLoading ? (
              <div className='loading-container'>
                <div className='loading-spinner'></div>
                <span>로딩 중...</span>
              </div>
            ) : pets.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>🐾</div>
                <div className='empty-title'>등록된 반려동물이 없습니다</div>
                <div className='empty-description'>새 반려동물을 추가해보세요</div>
                <button className='action-button primary' onClick={handleAddPet}>
                  반려동물 추가
                </button>
              </div>
            ) : (
              <div className='pet-list'>
                {pets.map((pet) => (
                  <div key={pet.id} className='pet-card'>
                    <div className='pet-avatar'>
                      <div className='pet-icon'>🐕</div>
                    </div>
                    <div className='pet-info'>
                      <div className='pet-name'>{pet.name}</div>
                      <div className='pet-details'>
                        <span className='pet-detail'>{pet.species}</span>
                        {pet.breed && <span className='pet-detail'>{pet.breed}</span>}
                        <span className='pet-detail'>{pet.age}세</span>
                        <span className='pet-detail'>{pet.gender === 'MALE' ? '수컷' : '암컷'}</span>
                        {pet.weight > 0 && <span className='pet-detail'>{pet.weight}kg</span>}
                      </div>
                    </div>
                    <div className='pet-actions'>
                      <button className='action-button small' onClick={() => handleEditPet(pet.id)}>
                        편집
                      </button>
                      <button className='action-button small danger' onClick={() => handleDeletePet(pet.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetMoreScreen;
