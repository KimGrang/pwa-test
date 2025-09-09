import React, { useState, useRef, useEffect } from 'react';
import { Pet } from '../types/pet';
import { ChevronDownIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface PetFilterProps {
  pets: Pet[];
  selectedPetId: number | null;
  onPetSelect: (petId: number | null) => void;
  className?: string;
}

/**
 * 반려동물별 필터링을 위한 드롭다운 컴포넌트
 * 전체, 반려동물1, 반려동물2... 형태의 드롭다운 메뉴
 */
const PetFilter: React.FC<PetFilterProps> = ({ pets, selectedPetId, onPetSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 반려동물 정보
  const selectedPet = selectedPetId ? pets.find((pet) => pet.id === selectedPetId) : null;
  const displayText = selectedPet ? selectedPet.name : '전체';

  const handlePetSelect = (petId: number | null) => {
    onPetSelect(petId);
    setIsOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`pet-filter-dropdown ${className}`} ref={dropdownRef}>
      <button
        className='pet-filter-trigger'
        onClick={() => setIsOpen(!isOpen)}
        type='button'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
      >
        <div className='pet-filter-trigger-content'>
          <span className='pet-filter-trigger-icon'>
            {selectedPet?.profileImageUrl ? (
              <img src={selectedPet.profileImageUrl} alt={selectedPet.name} className='pet-filter-trigger-avatar' />
            ) : selectedPet ? (
              <HeartIcon className='pet-filter-trigger-heroicon' />
            ) : (
              <UserGroupIcon className='pet-filter-trigger-heroicon' />
            )}
          </span>
          <span className='pet-filter-trigger-text'>{displayText}</span>
        </div>
        <ChevronDownIcon className={`pet-filter-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className='pet-filter-dropdown-menu'>
          <div className='pet-filter-dropdown-content'>
            {/* 전체 옵션 */}
            <button
              className={`pet-filter-option ${selectedPetId === null ? 'selected' : ''}`}
              onClick={() => handlePetSelect(null)}
              type='button'
              role='option'
              aria-selected={selectedPetId === null}
            >
              <span className='pet-filter-option-icon'>
                <UserGroupIcon className='pet-filter-option-heroicon' />
              </span>
              <span className='pet-filter-option-text'>전체</span>
              {selectedPetId === null && <span className='pet-filter-check'>✓</span>}
            </button>

            {/* 반려동물 목록 */}
            {pets.map((pet) => (
              <button
                key={pet.id}
                className={`pet-filter-option ${selectedPetId === pet.id ? 'selected' : ''}`}
                onClick={() => handlePetSelect(pet.id)}
                type='button'
                role='option'
                aria-selected={selectedPetId === pet.id}
              >
                <span className='pet-filter-option-icon'>
                  {pet.profileImageUrl ? (
                    <img src={pet.profileImageUrl} alt={pet.name} className='pet-filter-option-avatar' />
                  ) : (
                    <HeartIcon className='pet-filter-option-heroicon' />
                  )}
                </span>
                <span className='pet-filter-option-text'>{pet.name}</span>
                {selectedPetId === pet.id && <span className='pet-filter-check'>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetFilter;
