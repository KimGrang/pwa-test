# DodacVet API 개발 가이드

### API 접속 정보

- **개발 환경 (Docker + nginx)**: `https://www.dwon.store/api`
- **프로덕션**: `https://www.dwon.store/api`

## 📁 프로젝트 구조

```
src/
├── ai-consultation/          # AI 상담 모듈
├── common/                   # 공통 유틸리티
│   ├── base/                # 기본 클래스
│   ├── constants/           # 상수 정의
│   └── utils/               # 유틸리티 함수
├── config/                  # 설정 파일
├── database/                # 데이터베이스 관련
│   ├── schema/              # Drizzle 스키마
│   └── seeds/               # 시드 데이터
├── decorators/              # 커스텀 데코레이터
├── hospital/                # 병원 관리 모듈
├── middlewares/             # 미들웨어
│   ├── auth/                # 인증 관련
│   ├── logging/             # 로깅
│   └── validation/          # 유효성 검사
├── pet/                     # 반려동물 관리 모듈
├── record/                  # 진료기록 모듈
├── redis/                   # Redis 파이프라인
├── user/                    # 사용자 관리 모듈
├── vet/                     # 수의사 관리 모듈
├── app.controller.ts        # 메인 컨트롤러
├── app.module.ts           # 메인 모듈
├── app.service.ts          # 메인 서비스
└── main.ts                 # 애플리케이션 진입점
```

## 📋 API 인증 및 헤더

### 필수 헤더

```typescript
const headers = {
  Authorization: 'Bearer <access_token>',
  'Content-Type': 'application/json',
};
```

### 토큰 관리

```typescript
// 로그인 후 받은 토큰 저장
const { accessToken, refreshToken } = await login(credentials);

// API 요청 시 헤더에 토큰 포함
const response = await fetch('/api/users/profile', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

## 🔐 인증 API (페이스북 스타일 토큰 정책)

### 🎯 토큰 정책 개요

**페이스북과 같은 사용자 편의성 중심의 토큰 관리:**

- **액세스 토큰**: 15분 (5-30분 범위)
- **리프레시 토큰**: 30일 (자동 연장)
- **토큰 로테이션**: 액세스 토큰 갱신 시마다 리프레시 토큰도 함께 갱신
- **자동 연장**: 30일 중 한 번이라도 접속하면 리프레시 토큰이 다시 30일 연장
- **사용자 경험**: 30일 동안 접속하지 않았을 때만 자동 로그아웃

### 로그인

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 회원가입

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "사용자명"
}
```

### 카카오 로그인

#### 1단계: 카카오 로그인 URL 생성

```http
GET /api/auth/kakao/url
```

**응답:**

```json
{
  "authUrl": "https://kauth.kakao.com/oauth/authorize?client_id=..."
}
```

#### 2단계: 카카오 콜백 처리 (백엔드에서 자동 처리)

```http
GET /api/auth/kakao/callback?code=authorization_code
```

**자동 리다이렉트:**

- 성공 시: 프론트엔드로 토큰과 함께 리다이렉트
- 실패 시: 에러 정보와 함께 리다이렉트

### 토큰 갱신 (페이스북 스타일)

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token_here",
    "refresh_token": "new_refresh_token_here"
  }
}
```

**중요한 특징:**

- ✅ **토큰 로테이션**: 액세스 토큰과 리프레시 토큰이 모두 새로 발급
- ✅ **자동 연장**: 리프레시 토큰이 30일로 다시 연장
- ✅ **기존 토큰 무효화**: 보안을 위해 기존 토큰들은 자동으로 무효화

### 로그아웃

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### 모든 기기에서 로그아웃 (페이스북 스타일)

```http
POST /api/auth/logout-all-devices
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "message": "모든 기기에서 로그아웃되었습니다."
}
```

**주의사항:**

- `refresh_token` 필드명을 정확히 사용해야 합니다 (언더스코어 사용)
- 토큰 갱신 시 기존 토큰은 자동으로 무효화됩니다
- 새로운 access_token과 refresh_token이 모두 발급됩니다
- 리프레시 토큰 만료 시 명확한 에러 메시지 제공

## 👤 사용자 API

### 프로필 조회

```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "사용자명",
    "role": "USER",
    "hospitalId": 1,
    "SNS": "GOOGLE"
  }
}
```

### 테스트 로그인 (개발용)

```http
POST /api/users/test-login
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## 🏥 병원 API

### 병원 목록 조회

```http
GET /api/hospitals
Authorization: Bearer <access_token>
```

### 내 병원 조회

```http
GET /api/hospitals/my-hospital
Authorization: Bearer <access_token>
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "도닥 동물병원",
    "licenseNumber": "VET-2024-001",
    "address": "서울시 강남구 테헤란로 123",
    "phone": "02-1234-5678",
    "email": "hospital@example.com",
    "specialties": ["내과", "외과"],
    "services": ["예방접종", "건강검진"],
    "facilities": ["X-ray", "초음파"],
    "latitude": 37.5665,
    "longitude": 126.978,
    "userInfo": {
      "id": 1,
      "name": "사용자명",
      "role": "USER",
      "email": "user@example.com"
    }
  }
}
```

**주의사항:**

- 사용자가 속한 병원이 없는 경우 404 에러 반환
- 토큰이 유효하지 않은 경우 401 에러 반환

### 병원 상세 조회

```http
GET /api/hospitals/{id}
Authorization: Bearer <access_token>
```

### 병원 등록 (관리자)

```http
POST /api/hospitals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "동물병원명",
  "address": "주소",
  "phone": "전화번호",
  "description": "병원 설명"
}
```

## 🐕 반려동물 API

### 내 반려동물 목록

```http
GET /api/pets/my-pets?page=1&limit=10
Authorization: Bearer <access_token>
```

**응답:**

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
      "profileImageUrl": "https://example.com/pet-image.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 반려동물 등록

```http
POST /api/pets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "멍멍이",
  "gender": "MALE",
  "weight": 25.5,
  "neutered": false,
  "birthDate": "2022-03-15",
  "medicalHistory": "알레르기 반응 있음",
  "profileImageUrl": "https://example.com/pet-image.jpg"
}
```

### 반려동물 상세 조회

```http
GET /api/pets/{id}
Authorization: Bearer <access_token>
```

### 반려동물 수정

```http
PATCH /api/pets/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "수정된 멍멍이",
  "weight": 26.0,
  "neutered": true
}
```

### 반려동물 삭제

```http
DELETE /api/pets/{id}
Authorization: Bearer <access_token>
```

## 📋 진료기록 API

### 반려동물별 진료기록 조회

```http
GET /api/medical-records/pet/{petId}?page=1&limit=10
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "petId": 1,
      "hospitalId": 1,
      "vetId": 1,
      "visitDate": "2024-01-15T00:00:00.000Z",
      "chiefComplaint": "기침, 콧물",
      "examinationNotes": "체온 38.5도, 기침 증상 관찰",
      "treatmentPlan": "항생제 처방, 3일간 복용",
      "followUp": "3일 후 재진료"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 진료기록 등록

```http
POST /api/medical-records/post
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "petId": 1,
  "hospitalId": 1,
  "vetId": 1,
  "visitDate": "2024-01-15",
  "chiefComplaint": "기침, 콧물",
  "examinationNotes": "체온 38.5도, 기침 증상 관찰",
  "treatmentPlan": "항생제 처방, 3일간 복용",
  "followUp": "3일 후 재진료"
}
```

### 진료기록 상세 조회

```http
GET /api/medical-records/{id}
Authorization: Bearer <access_token>
```

### 진료기록 수정

```http
PATCH /api/medical-records/patch/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "chiefComplaint": "기침, 콧물, 발열",
  "treatmentPlan": "항생제 처방, 해열제"
}
```

### 진료기록 삭제

```http
DELETE /api/medical-records/del/{id}
Authorization: Bearer <access_token>
```

### 진료기록 상세 조회 (진단서, 처방전 포함)

```http
GET /api/medical-records/detail/{id}
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "success": true,
  "data": {
    "diagnosis": [
      {
        "id": 1,
        "recordId": 1,
        "ownerName": "김철수",
        "animalType": "개",
        "breed": "골든리트리버",
        "animalName": "멍멍이",
        "gender": "수컷",
        "age": "3년 2개월",
        "diseaseName": "상기도 감염",
        "diagnosisDate": "2024-01-15T00:00:00.000Z",
        "prognosis": "양호",
        "shared": false
      }
    ],
    "prescriptions": [
      {
        "id": 1,
        "recordId": 1,
        "medicationName": "아목시실린",
        "dosage": "250mg",
        "frequency": "1일 2회",
        "durationDays": 7,
        "specialInstructions": "식후 복용"
      }
    ]
  }
}
```

**특징:**

- 진료기록의 기본 정보는 제외하고 진단서와 처방전만 반환
- 해당 진료기록의 소유자만 접근 가능

## 🤖 AI 상담 API

### 내 AI 상담 목록

```http
GET /api/ai-consultations/my-consultations?page=1&limit=10
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "petId": 1,
      "query": "강아지가 기침을 하는데 어떻게 해야 할까요?",
      "response": "기침의 원인을 파악하기 위해 병원 진료를 권장합니다.",
      "feedbackComment": "도움이 되었습니다.",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### AI 상담 등록

```http
POST /api/ai-consultations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "petId": 1,
  "question": "강아지가 기침을 하는데 어떻게 해야 할까요?",
  "answer": "기침의 원인을 파악하기 위해 병원 진료를 권장합니다.",
  "notes": "도움이 되었습니다."
}
```

### AI 상담 상세 조회

```http
GET /api/ai-consultations/{id}
Authorization: Bearer <access_token>
```

### AI 상담 수정

```http
PATCH /api/ai-consultations/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "question": "강아지가 기침과 발열을 하는데 어떻게 해야 할까요?",
  "answer": "증상이 심각하므로 즉시 병원 진료를 권장합니다."
}
```

### AI 상담 삭제

```http
DELETE /api/ai-consultations/{id}
Authorization: Bearer <access_token>
```

## 📊 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    /* 응답 데이터 */
  },
  "message": "성공 메시지 (선택사항)"
}
```

### 목록 응답

```json
{
  "success": true,
  "data": [
    /* 배열 데이터 */
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "message": "성공 메시지 (선택사항)"
}
```

### 에러 응답

```json
{
  "success": false,
  "statusCode": 400,
  "message": "에러 메시지",
  "timestamp": "2024-01-15T00:00:00.000Z",
  "errors": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "올바른 이메일 형식이 아닙니다"
      }
    }
  ]
}
```

## 🔒 권한 및 보안

### 사용자 권한

- **USER**: 일반 사용자 (자신의 데이터만 접근 가능)
- **ADMIN**: 관리자 (모든 데이터 접근 가능)

### 권한 확인 규칙

1. **반려동물**: 소유자만 접근 가능
2. **진료기록**: 해당 반려동물의 소유자만 접근 가능
3. **AI 상담**: 작성자만 접근 가능
4. **병원**: 모든 사용자 조회 가능, 등록/수정/삭제는 관리자만

### 에러 코드

- **401**: 인증 실패 (토큰 없음 또는 만료)
- **403**: 권한 부족
- **404**: 리소스를 찾을 수 없음
- **400**: 잘못된 요청 (유효성 검사 실패)
- **500**: 서버 내부 오류

### 토큰 관련 문제 해결

#### 토큰 갱신 실패 시 (400 에러)

1. **필드명 확인**: `refresh_token` (언더스코어 사용)
2. **토큰 형식 확인**: JWT 토큰 형식이 올바른지 확인
3. **Redis 연결 확인**: 토큰이 Redis에 저장되어 있는지 확인

#### 일반적인 해결 방법

```bash
# Redis 연결 확인
docker exec -it dev-redis redis-cli ping

# 사용자 토큰 확인
docker exec -it dev-redis redis-cli keys "user_tokens:*"

# 특정 사용자 토큰 확인
docker exec -it dev-redis redis-cli keys "user_tokens:1:*"

# 토큰 통계 확인
docker exec -it dev-redis redis-cli keys "access_token:*" | wc -l
docker exec -it dev-redis redis-cli keys "refresh_token:*" | wc -l

# 만료된 토큰 정리 (수동)
curl -X POST http://localhost:8080/api/auth/cleanup-tokens

# 토큰 통계 조회
curl -X GET http://localhost:8080/api/auth/token-stats
```

#### 자동 토큰 정리

- **프로덕션**: 매일 새벽 3시 자동 정리
- **개발**: 매시간 자동 정리 (테스트용)
- **수동**: 관리자 API를 통한 즉시 정리

## 🛠️ 개발 환경 설정

### 환경 변수

```bash
# .env 파일
NODE_ENV=development
HOST=127.0.0.1
PORT=4000
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dodac_vet_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (페이스북 스타일 토큰 정책)
JWT_SECRET_KEY=change-this-secret-32-chars-minimum________________
# 액세스 토큰: 5-30분 (사용자 편의성 고려)
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET_KEY=change-this-refresh-secret-32-chars-min____
# 리프레시 토큰: 30일 (자동 연장)
JWT_REFRESH_EXPIRES_IN=30d

# Logging
LOG_LEVEL=info
LOG_FORMAT=dev
```

### Docker Compose 실행

#### 개발 환경

```bash
# 개발 환경 실행 (nginx 포함)
docker-compose -f docker-compose.dev.yml up -d

# 서비스 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f app
```

#### 프로덕션 환경

```bash
# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d

# 서비스 확인
docker-compose -f docker-compose.prod.yml ps
```

### Docker Compose 서비스 구성

#### 개발 환경 (`docker-compose.dev.yml`)

- **app**: NestJS 애플리케이션 (포트 4000)
- **nginx**: 리버스 프록시 (포트 80, 8080)
- **postgres**: PostgreSQL 데이터베이스 (포트 5432)
- **redis**: Redis 캐시 서버 (포트 6379)
- **seed**: 초기 데이터 시드

#### 프로덕션 환경 (`docker-compose.prod.yml`)

- **app**: NestJS 애플리케이션 (포트 4000, 내부만)
- **nginx**: 리버스 프록시 (포트 80, 8080)
- **postgres**: PostgreSQL 데이터베이스 (포트 5432, 내부만)
- **redis**: Redis 캐시 서버 (포트 6379, 내부만)

### nginx 설정

#### 개발 환경 (`nginx/dev.conf`)

- API 요청을 `/api/*` 경로로 프록시
- CORS 헤더 자동 설정
- WebSocket 지원
- 파일 업로드 제한: 10MB
- 디버깅용 헤더 포함

#### 프로덕션 환경 (`nginx/prod.conf`)

- 보안 강화된 설정
- SSL/TLS 지원 (별도 설정 필요)
- 캐싱 및 압축 최적화

## 📱 React 웹 개발 가이드

### 🚀 기본 설정

#### API Base URL 설정

```typescript
// config/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export default API_BASE_URL;
```

#### 환경 변수 설정 (.env)

```bash
# .env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_KAKAO_CLIENT_ID=your_kakao_client_id
```

### 🔐 인증 관리 (페이스북 스타일)

#### 1. 토큰 저장 및 관리

```typescript
// utils/auth.ts
interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

class AuthManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default AuthManager;
```

#### 2. API 클라이언트 설정

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AuthManager from '../utils/auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터: 토큰 자동 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = AuthManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 토큰 갱신 처리
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = AuthManager.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await this.refreshTokens(refreshToken);
            AuthManager.setTokens(response.data);

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // 리프레시 토큰도 만료된 경우 로그아웃
            AuthManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // 토큰 갱신
  private async refreshTokens(refreshToken: string): Promise<AxiosResponse> {
    return axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
  }

  // HTTP 메서드들
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export default new ApiClient();
```

### 🏥 데이터 서비스 예시

#### 인증 서비스

```typescript
// services/authService.ts
import ApiClient from './api';
import AuthManager from '../utils/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('/auth/login', credentials);
    AuthManager.setTokens(response.data);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout');
    } finally {
      AuthManager.clearTokens();
    }
  }

  async logoutFromAllDevices(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout-all-devices');
    } finally {
      AuthManager.clearTokens();
    }
  }

  async getKakaoAuthUrl(): Promise<{ authUrl: string }> {
    return ApiClient.get('/auth/kakao/url');
  }
}

export default new AuthService();
```

#### 반려동물 서비스

```typescript
// services/petService.ts
import ApiClient from './api';

interface Pet {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  weight: number;
  neutered: boolean;
  birthDate: string;
  medicalHistory?: string;
  profileImageUrl?: string;
}

class PetService {
  async getMyPets(page = 1, limit = 10) {
    return ApiClient.get(`/pets/my-pets?page=${page}&limit=${limit}`);
  }

  async createPet(petData: Omit<Pet, 'id'>): Promise<Pet> {
    const response = await ApiClient.post<{ success: boolean; data: Pet }>('/pets', petData);
    return response.data;
  }

  async updatePet(id: number, petData: Partial<Pet>): Promise<Pet> {
    const response = await ApiClient.patch<{ success: boolean; data: Pet }>(`/pets/${id}`, petData);
    return response.data;
  }

  async deletePet(id: number): Promise<void> {
    await ApiClient.delete(`/pets/${id}`);
  }
}

export default new PetService();
```

#### 진료기록 서비스

```typescript
// services/recordService.ts
import ApiClient from './api';

interface Diagnosis {
  id: number;
  recordId: number;
  ownerName: string;
  animalType: string;
  breed?: string;
  animalName?: string;
  gender?: string;
  age?: string;
  diseaseName: string;
  diagnosisDate: string;
  prognosis?: string;
  shared: boolean;
}

interface Prescription {
  id: number;
  recordId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  specialInstructions?: string;
}

interface RecordDetailResponse {
  success: boolean;
  data: {
    diagnosis: Diagnosis[];
    prescriptions: Prescription[];
  };
}

class RecordService {
  async getPetRecords(petId: number, page = 1, limit = 10) {
    return ApiClient.get(`/medical-records/pet/${petId}?page=${page}&limit=${limit}`);
  }

  async getRecordDetail(recordId: number): Promise<RecordDetailResponse> {
    return ApiClient.get(`/medical-records/detail/${recordId}`);
  }

  async createRecord(recordData: any): Promise<any> {
    const response = await ApiClient.post('/medical-records/post', recordData);
    return response.data;
  }

  async updateRecord(id: number, recordData: any): Promise<any> {
    const response = await ApiClient.patch(`/medical-records/patch/${id}`, recordData);
    return response.data;
  }

  async deleteRecord(id: number): Promise<void> {
    await ApiClient.delete(`/medical-records/del/${id}`);
  }
}

export default new RecordService();
```

### 🎨 React 컴포넌트 예시

#### 로그인 컴포넌트

```typescript
// components/LoginForm.tsx
import React, { useState } from 'react';
import AuthService from '../services/authService';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.login({ email, password });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const { authUrl } = await AuthService.getKakaoAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('카카오 로그인 URL 생성 실패:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='이메일' required />
      </div>
      <div>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='비밀번호'
          required
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type='submit' disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
      <button type='button' onClick={handleKakaoLogin}>
        카카오 로그인
      </button>
    </form>
  );
};

export default LoginForm;
```

### 🔧 인증 상태 관리 훅

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AuthManager from '../utils/auth';
import UserService from '../services/userService';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  hospitalId?: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (AuthManager.isAuthenticated()) {
        const userData = await UserService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      AuthManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await AuthService.login({ email, password });
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
```

## 🧪 테스트

### 테스트 실행

```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# 커버리지 테스트
pnpm test:cov

# 로깅 테스트
pnpm test:logging:all

# 전체 테스트
pnpm test:all
```

### 테스트 환경

- **Jest**: 테스트 프레임워크
- **Supertest**: HTTP 테스트
- **Test Database**: 별도 테스트 데이터베이스 사용
- **Mocking**: Winston 로거 모킹

---

**참고**: 이 API는 반려동물 케어 플랫폼을 위한 백엔드 서비스입니다. 모든 API 호출에는 적절한 인증 토큰이 필요하며, 사용자는 자신의 데이터에만 접근할 수 있습니다.

**버전**: 1.0.0  
**최종 업데이트**: 2024년 12월
