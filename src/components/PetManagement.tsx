import React, { useState, useEffect } from 'react';
import { usePetAPIHook } from '../hooks';
import { usePetStore } from '../store/petStore';
import { CreatePetRequest, UpdatePetRequest, Pet } from '../types/pet';

/**
 * 반려동물 관리 컴포넌트
 * API 문서에 맞춰 구현된 반려동물 CRUD 기능을 보여주는 예시
 */
const PetManagement: React.FC = () => {
  const petAPI = usePetAPIHook();
  const { pets, selectedPet, pagination, setSelectedPet } = usePetStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CreatePetRequest>({
    name: '',
    gender: 'MALE',
    weight: undefined,
    neutered: false,
    birthDate: '',
    medicalHistory: '',
    profileImageUrl: '',
  });

  // 컴포넌트 마운트 시 내 반려동물 목록 조회
  useEffect(() => {
    petAPI.fetchMyPets();
  }, [petAPI]);

  // 반려동물 등록
  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPet = await petAPI.createPet(formData);
    if (newPet) {
      setIsCreating(false);
      setFormData({
        name: '',
        gender: 'MALE',
        weight: undefined,
        neutered: false,
        birthDate: '',
        medicalHistory: '',
        profileImageUrl: '',
      });
      // 목록 새로고침
      petAPI.fetchMyPets();
    }
  };

  // 반려동물 수정
  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    const updateData: UpdatePetRequest = {
      name: formData.name,
      weight: formData.weight,
      neutered: formData.neutered,
      birthDate: formData.birthDate,
      medicalHistory: formData.medicalHistory,
      profileImageUrl: formData.profileImageUrl,
    };

    const updatedPet = await petAPI.updatePet(selectedPet.id, updateData);
    if (updatedPet) {
      setIsEditing(false);
      setSelectedPet(null);
      petAPI.fetchMyPets();
    }
  };

  // 반려동물 삭제
  const handleDeletePet = async (id: number) => {
    if (window.confirm('정말로 이 반려동물을 삭제하시겠습니까?')) {
      await petAPI.deletePet(id);
      petAPI.fetchMyPets();
    }
  };

  // 수정 모드 시작
  const startEdit = (pet: Pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name,
      gender: pet.gender,
      weight: pet.weight,
      neutered: pet.neutered,
      birthDate: pet.birthDate || '',
      medicalHistory: pet.medicalHistory || '',
      profileImageUrl: pet.profileImageUrl || '',
    });
    setIsEditing(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedPet(null);
    setFormData({
      name: '',
      gender: 'MALE',
      weight: undefined,
      neutered: false,
      birthDate: '',
      medicalHistory: '',
      profileImageUrl: '',
    });
  };

  if (petAPI.loading) {
    return <div className='loading'>로딩 중...</div>;
  }

  if (petAPI.error) {
    return (
      <div className='error'>
        <p>오류: {petAPI.error}</p>
        <button onClick={petAPI.clearError}>에러 초기화</button>
      </div>
    );
  }

  return (
    <div className='pet-management'>
      <h2>반려동물 관리</h2>

      {/* 반려동물 목록 */}
      <div className='pet-list'>
        <div className='list-header'>
          <h3>내 반려동물 ({pagination.total}마리)</h3>
          <button onClick={() => setIsCreating(true)}>새 반려동물 등록</button>
        </div>

        {pets.length === 0 ? (
          <p>등록된 반려동물이 없습니다.</p>
        ) : (
          <div className='pet-grid'>
            {pets.map((pet) => (
              <div key={pet.id} className='pet-card'>
                <h4>{pet.name}</h4>
                <p>성별: {pet.gender === 'MALE' ? '수컷' : '암컷'}</p>
                {pet.weight && <p>체중: {pet.weight}kg</p>}
                <p>중성화: {pet.neutered ? '완료' : '미완료'}</p>
                {pet.birthDate && <p>출생일: {new Date(pet.birthDate).toLocaleDateString()}</p>}
                {pet.medicalHistory && <p>의료기록: {pet.medicalHistory}</p>}

                <div className='pet-actions'>
                  <button onClick={() => startEdit(pet)}>수정</button>
                  <button onClick={() => handleDeletePet(pet.id)} className='delete'>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 반려동물 등록/수정 폼 */}
      {(isCreating || isEditing) && (
        <div className='pet-form-overlay'>
          <div className='pet-form'>
            <h3>{isCreating ? '새 반려동물 등록' : '반려동물 정보 수정'}</h3>

            <form onSubmit={isCreating ? handleCreatePet : handleUpdatePet}>
              <div className='form-group'>
                <label>이름 *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className='form-group'>
                <label>성별 *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  required
                >
                  <option value='MALE'>수컷</option>
                  <option value='FEMALE'>암컷</option>
                </select>
              </div>

              <div className='form-group'>
                <label>체중 (kg)</label>
                <input
                  type='number'
                  step='0.1'
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>

              <div className='form-group'>
                <label>
                  <input
                    type='checkbox'
                    checked={formData.neutered}
                    onChange={(e) => setFormData({ ...formData, neutered: e.target.checked })}
                  />
                  중성화 완료
                </label>
              </div>

              <div className='form-group'>
                <label>출생일</label>
                <input
                  type='date'
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label>의료 기록</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  rows={3}
                />
              </div>

              <div className='form-group'>
                <label>프로필 이미지 URL</label>
                <input
                  type='url'
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                />
              </div>

              <div className='form-actions'>
                <button type='submit'>{isCreating ? '등록' : '수정'}</button>
                <button type='button' onClick={resetForm}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
