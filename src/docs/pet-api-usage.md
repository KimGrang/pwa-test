# 반려동물 API 사용법

## 개요

반려동물 API 문서에 맞춰 구현된 axios 기반 API 통신 기능들의 사용법을 설명합니다.

## 구현된 기능

### 1. 타입 정의 (`src/types/pet.ts`)

```typescript
// 반려동물 기본 타입
interface Pet {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  weight?: number;
  neutered: boolean;
  birthDate?: string;
  medicalHistory?: string;
  profileImageUrl?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// 반려동물 생성 요청 타입
interface CreatePetRequest {
  name: string; // 필수
  gender: 'MALE' | 'FEMALE'; // 필수
  weight?: number;
  neutered?: boolean;
  birthDate?: string;
  medicalHistory?: string;
  profileImageUrl?: string;
}

// 반려동물 수정 요청 타입 (모든 필드 선택사항)
interface UpdatePetRequest {
  name?: string;
  weight?: number;
  neutered?: boolean;
  birthDate?: string;
  medicalHistory?: string;
  profileImageUrl?: string;
}
```

### 2. 기본 API 훅 (`src/hooks/useAPI.ts`)

```typescript
import { usePetAPI } from '../hooks/useAPI';

const MyComponent = () => {
  const petAPI = usePetAPI();

  // 반려동물 등록
  const createPet = async () => {
    const petData = {
      name: '멍멍이',
      gender: 'MALE' as const,
      weight: 25.5,
      neutered: false,
      birthDate: '2022-03-15T00:00:00.000Z',
      medicalHistory: '알레르기 반응 있음',
    };

    const result = await petAPI.createPet(petData);
    console.log('생성된 반려동물:', result);
  };

  // 내 반려동물 목록 조회
  const fetchPets = async () => {
    const pets = await petAPI.getMyPets(1, 10); // page=1, limit=10
    console.log('내 반려동물 목록:', pets);
  };

  // 반려동물 정보 수정
  const updatePet = async (id: number) => {
    const updateData = {
      name: '멍멍이2',
      weight: 26.0,
      neutered: true,
    };

    const result = await petAPI.updatePet(id, updateData);
    console.log('수정된 반려동물:', result);
  };

  // 반려동물 삭제
  const deletePet = async (id: number) => {
    const result = await petAPI.deletePet(id);
    console.log('삭제된 반려동물:', result);
  };

  return (
    <div>
      <button onClick={createPet}>반려동물 등록</button>
      <button onClick={fetchPets}>목록 조회</button>
      {/* 로딩 상태 */}
      {petAPI.loading && <p>로딩 중...</p>}
      {/* 에러 상태 */}
      {petAPI.error && <p>에러: {petAPI.error}</p>}
    </div>
  );
};
```

### 3. 고급 API 훅 (`src/hooks/usePetAPI.ts`)

```typescript
import { usePetAPIHook } from '../hooks';

const MyComponent = () => {
  const petAPI = usePetAPIHook();

  // 상태 관리가 포함된 고급 기능
  const handleCreatePet = async () => {
    const newPet = await petAPI.createPet({
      name: '멍멍이',
      gender: 'MALE',
      weight: 25.5,
    });

    if (newPet) {
      console.log('새 반려동물이 등록되었습니다:', newPet);
      // 자동으로 pets 배열에 추가됨
    }
  };

  return (
    <div>
      <h3>내 반려동물 ({petAPI.pets.length}마리)</h3>
      {petAPI.pets.map((pet) => (
        <div key={pet.id}>
          <h4>{pet.name}</h4>
          <p>성별: {pet.gender}</p>
          <p>체중: {pet.weight}kg</p>
          <button onClick={() => petAPI.setCurrentPet(pet)}>선택</button>
        </div>
      ))}

      {petAPI.currentPet && (
        <div>
          <h4>선택된 반려동물: {petAPI.currentPet.name}</h4>
          <button onClick={() => petAPI.deletePet(petAPI.currentPet!.id)}>삭제</button>
        </div>
      )}
    </div>
  );
};
```

### 4. Zustand 스토어 (`src/store/petStore.ts`)

```typescript
import { usePetStore } from '../store/petStore';

const MyComponent = () => {
  const {
    pets,
    selectedPet,
    pagination,
    setPets,
    setSelectedPet,
    addPet,
    updatePet,
    removePet,
    getPetById,
    getPetsByUserId,
  } = usePetStore();

  // 특정 사용자의 반려동물 조회
  const userPets = getPetsByUserId(1);

  // 특정 반려동물 조회
  const pet = getPetById(1);

  return (
    <div>
      <h3>반려동물 목록</h3>
      {pets.map((pet) => (
        <div key={pet.id}>
          <h4>{pet.name}</h4>
          <button onClick={() => setSelectedPet(pet)}>선택</button>
        </div>
      ))}

      {selectedPet && (
        <div>
          <h4>선택된 반려동물: {selectedPet.name}</h4>
        </div>
      )}
    </div>
  );
};
```

## API 엔드포인트 매핑

| 기능               | HTTP 메서드 | 엔드포인트      | 훅 함수        |
| ------------------ | ----------- | --------------- | -------------- |
| 반려동물 등록      | POST        | `/pets`         | `createPet()`  |
| 반려동물 수정      | PATCH       | `/pets/:id`     | `updatePet()`  |
| 반려동물 삭제      | DELETE      | `/pets/:id`     | `deletePet()`  |
| 내 반려동물 조회   | GET         | `/pets/my-pets` | `getMyPets()`  |
| 특정 반려동물 조회 | GET         | `/pets/:id`     | `getPetById()` |
| 전체 반려동물 조회 | GET         | `/pets`         | `getAllPets()` |

## 에러 처리

모든 API 호출은 자동으로 에러를 처리하며, 다음과 같은 상태 코드별 메시지를 제공합니다:

- `400`: 잘못된 요청입니다.
- `401`: 인증이 필요합니다.
- `403`: 접근 권한이 없습니다.
- `404`: 요청한 리소스를 찾을 수 없습니다.
- `429`: 너무 많은 요청입니다.
- `500`: 서버 내부 오류가 발생했습니다.

## 인증

모든 API 요청에는 JWT 토큰이 자동으로 포함됩니다. 토큰은 다음 순서로 확인됩니다:

1. `localStorage.getItem('dwon_access_token')`
2. `localStorage.getItem('authToken')`

## 사용 예시 컴포넌트

완전한 사용 예시는 `src/components/PetManagement.tsx`에서 확인할 수 있습니다. 이 컴포넌트는 반려동물의 CRUD 기능을 모두 구현하고 있습니다.
