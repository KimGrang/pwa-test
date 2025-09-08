# 반려동물 API 문서

## 개요

반려동물 정보 등록/수정/삭제를 위한 REST API입니다. 모든 엔드포인트는 JWT 인증이 필요합니다.

**Base URL**: `/pets`

---

## 🔗 API 엔드포인트

### 1. 반려동물 등록

**POST** `/pets`

#### 요청 Body

```json
{
  "name": "멍멍이", // 필수: 반려동물 이름
  "gender": "MALE", // 필수: 성별 (MALE | FEMALE)
  "weight": 25.5, // 선택: 체중 (kg)
  "neutered": false, // 선택: 중성화 여부 (기본값: false)
  "birthDate": "2022-03-15T00:00:00.000Z", // 선택: 출생일
  "medicalHistory": "알레르기 반응 있음", // 선택: 의료 기록
  "profileImageUrl": "https://example.com/pet-image.jpg" // 선택: 프로필 이미지 URL
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "멍멍이",
    "gender": "MALE",
    "weight": 25.5,
    "neutered": false,
    "birthDate": "2022-03-15T00:00:00.000Z",
    "medicalHistory": "알레르기 반응 있음",
    "profileImageUrl": "https://example.com/pet-image.jpg",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "반려동물이 성공적으로 등록되었습니다."
}
```

---

### 2. 반려동물 정보 수정

**PATCH** `/pets/:id`

#### Path Parameters

- `id` (number): 반려동물 ID

#### 요청 Body (모든 필드 선택사항)

```json
{
  "name": "멍멍이2",
  "weight": 26.0,
  "neutered": true,
  "medicalHistory": "중성화 수술 완료"
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "멍멍이2",
    "gender": "MALE",
    "weight": 26.0,
    "neutered": true,
    "birthDate": "2022-03-15T00:00:00.000Z",
    "medicalHistory": "중성화 수술 완료",
    "profileImageUrl": "https://example.com/pet-image.jpg",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "반려동물 정보가 성공적으로 수정되었습니다."
}
```

---

### 3. 반려동물 삭제

**DELETE** `/pets/:id`

#### Path Parameters

- `id` (number): 반려동물 ID

#### 응답

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "멍멍이2",
    "gender": "MALE",
    "weight": 26.0,
    "neutered": true,
    "birthDate": "2022-03-15T00:00:00.000Z",
    "medicalHistory": "중성화 수술 완료",
    "profileImageUrl": "https://example.com/pet-image.jpg",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "반려동물이 성공적으로 삭제되었습니다."
}
```

---

## 📋 추가 엔드포인트

### 내 반려동물 조회

**GET** `/pets/my-pets?page=1&limit=10`

#### Query Parameters

- `page` (number, 선택): 페이지 번호 (기본값: 1)
- `limit` (number, 선택): 페이지당 항목 수 (기본값: 10)

#### 응답

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "멍멍이",
      "gender": "MALE",
      "weight": 25.5,
      "neutered": false,
      "birthDate": "2022-03-15T00:00:00.000Z",
      "medicalHistory": "알레르기 반응 있음",
      "profileImageUrl": "https://example.com/pet-image.jpg",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 특정 반려동물 조회

**GET** `/pets/:id`

### 전체 반려동물 조회 (관리자용)

**GET** `/pets`

---

## 🔐 인증 및 권한

- **JWT 인증**: 모든 엔드포인트에 `Authorization: Bearer <token>` 헤더 필요
- **소유권 확인**: 수정/삭제 시 해당 반려동물의 소유자만 접근 가능
- **자동 사용자 연결**: 등록 시 JWT 토큰에서 사용자 ID 자동 추출

---

## ⚠️ 에러 응답

| 상태 코드 | 설명                    | 응답 예시                                                                 |
| --------- | ----------------------- | ------------------------------------------------------------------------- |
| 401       | 인증 실패               | `{"statusCode": 401, "message": "Unauthorized"}`                          |
| 403       | 권한 부족               | `{"statusCode": 403, "message": "반려동물에 대한 수정 권한이 없습니다."}` |
| 404       | 반려동물을 찾을 수 없음 | `{"statusCode": 404, "message": "반려동물 ID 1를 찾을 수 없습니다."}`     |
| 400       | 유효성 검사 실패        | `{"statusCode": 400, "message": "잘못된 요청입니다."}`                    |

---

## 📝 데이터 타입

### Pet Entity

```typescript
{
  id: number;                    // 자동 생성 ID
  name: string;                  // 반려동물 이름
  gender: 'MALE' | 'FEMALE';    // 성별
  weight?: number;               // 체중 (kg)
  neutered: boolean;             // 중성화 여부
  birthDate?: Date;              // 출생일
  medicalHistory?: string;       // 의료 기록
  profileImageUrl?: string;      // 프로필 이미지 URL
  userId: number;                // 소유자 ID
  createdAt: Date;               // 생성일시
  updatedAt: Date;               // 수정일시
}
```
