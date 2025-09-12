# Axios 코드 정리 및 리팩토링 가이드

## 개요

프로젝트의 axios 관련 코드가 중복되고 일관성이 없는 문제를 해결하기 위해 전면적인 리팩토링을 진행했습니다.

## 변경 사항

### 1. 새로운 파일 구조

```
src/
├── config/
│   ├── axios-config.ts         # 통합된 axios 설정
│   └── api-endpoints.ts        # 통합된 API 엔드포인트
└── hooks/
    ├── useApiClient.ts         # 통합된 API 클라이언트 훅
    ├── useAuthAPI.ts           # 인증 API 훅
    ├── useUserAPI.ts           # 사용자 API 훅
    ├── usePetsAPI.ts           # 반려동물 API 훅
    └── useMedicalRecordsAPI.ts # 진료기록 API 훅
```

### 2. 핵심 개선 사항

#### 통합된 Axios 설정

- **파일**: `src/config/axios-config.ts`
- **개선점**:
  - 환경별 설정 통합 관리
  - 토큰 자동 갱신 로직 표준화
  - 에러 처리 로직 중앙화
  - HTTP 상태 코드별 메시지 통일

#### 표준화된 API 클라이언트

- **파일**: `src/hooks/useApiClient.ts`
- **개선점**:
  - 요청 취소 기능
  - 재시도 로직
  - 응답 데이터 변환
  - 성공/에러 콜백 지원

#### 도메인별 API 훅 분리

- 각 도메인(인증, 사용자, 반려동물, 진료기록)별로 전용 훅 제공
- 일관된 인터페이스와 에러 처리
- TypeScript 타입 안정성 향상

## 마이그레이션 가이드

### 기존 코드 → 새로운 코드

#### 1. 기본 API 호출

**기존:**

```typescript
import { useDwonStoreAuth } from '../hooks/useDwonStoreAPI';

const { login, authData, loading, error } = useDwonStoreAuth();
```

**새로운 방식:**

```typescript
import { useAuthAPI } from '../hooks/useAuthAPI';

const { login, authData, loading, error } = useAuthAPI();
```

#### 2. 반려동물 API

**기존:**

```typescript
import { useDwonStorePets } from '../hooks/useDwonStoreAPI';

const { getMyPets, createPet } = useDwonStorePets();
```

**새로운 방식:**

```typescript
import { usePetsAPI } from '../hooks/usePetsAPI';

const { getMyPets, createPet } = usePetsAPI();
```

#### 3. 진료기록 API

**기존:**

```typescript
import { useDwonStoreMedicalRecords } from '../hooks/useDwonStoreAPI';

const { getRecordsByPet, createRecord } = useDwonStoreMedicalRecords();
```

**새로운 방식:**

```typescript
import { useMedicalRecordsAPI } from '../hooks/useMedicalRecordsAPI';

const { getRecordsByPet, createRecord } = useMedicalRecordsAPI();
```

### 고급 기능 사용법

#### 1. 요청 취소

```typescript
const { get, cancel } = useApiClient();

useEffect(() => {
  get('/api/data');

  return () => {
    cancel(); // 컴포넌트 언마운트 시 요청 취소
  };
}, []);
```

#### 2. 재시도 로직

```typescript
const apiClient = useApiClient({
  retryCount: 3, // 3회 재시도
  retryDelay: 1000, // 1초 간격
});
```

#### 3. 응답 데이터 변환

```typescript
const apiClient = useApiClient({
  transformResponse: (data) => {
    // 응답 데이터 변환 로직
    return transformedData;
  },
});
```

#### 4. 성공/에러 콜백

```typescript
const apiClient = useApiClient({
  onSuccess: (data) => {
    console.log('요청 성공:', data);
  },
  onError: (error) => {
    console.error('요청 실패:', error);
  },
});
```

## 호환성

### 기존 코드 지원

기존 훅들(`useDwonStoreAPI`, `useAxios` 등)은 호환성을 위해 유지됩니다. 하지만 새로운 기능 개발 시에는 새로운 훅들을 사용하시기 바랍니다.

### 점진적 마이그레이션

1. **즉시 사용 가능**: 새로운 훅들은 바로 사용할 수 있습니다
2. **기존 코드 유지**: 기존 코드는 그대로 동작합니다
3. **점진적 전환**: 새로운 기능이나 버그 수정 시 새로운 훅으로 전환

## 권장 사항

### 새로운 개발

- `useApiClient`를 기반으로 한 새로운 도메인 훅 사용
- 일관된 에러 처리 패턴 적용
- TypeScript 타입 활용

### 기존 코드 수정

- 버그 수정이나 기능 개선 시 새로운 훅으로 전환
- 큰 변경사항이 필요한 부분부터 우선 적용

## 주의사항

1. **환경 변수**: `VITE_API_BASE_URL` 환경 변수 설정 확인
2. **토큰 관리**: 기존 `TokenManager`, `TokenRefreshManager` 의존성 유지
3. **타입 호환성**: 기존 타입 정의와의 호환성 확인

## 문제 해결

### 일반적인 문제들

1. **타입 오류**: 새로운 타입 정의 확인 및 적용
2. **환경 설정**: axios-config.ts의 환경 설정 확인
3. **토큰 갱신**: 기존 토큰 관리 로직과의 호환성 확인

### 지원

문제가 발생하거나 질문이 있으시면 개발팀에 문의해주세요.
