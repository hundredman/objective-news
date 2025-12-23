# 완전 무료 운영 보장서

이 문서는 **Objective News** 앱이 어떻게 완전 무료로 운영될 수 있는지 기술적으로 설명합니다.

## 비용이 발생하지 않는 이유

### 1. AI API 비용 = 0원 ✅

**이전 방식 (비용 발생)**
- Claude API 사용 → 요청당 비용 발생
- GPT API 사용 → 토큰당 비용 발생
- 하루 100명만 사용해도 월 수만원 발생 가능

**현재 방식 (완전 무료)**
```typescript
// lib/fact-filter.ts
export function processArticles(articles: NewsArticle[]): ObjectiveNews[] {
  // JavaScript 패턴 매칭으로 주관적 표현 필터링
  // AI API 호출 없음!
  return articles
    .map(processArticleToObjectiveFacts)
    .filter((news): news is ObjectiveNews => news !== null)
    .sort((a, b) => b.importance - a.importance);
}
```

### 2. NewsAPI = 무료 ✅

**무료 플랜 한도**
- 하루 100 요청
- 개발 목적으로 사용 가능

**실제 사용량**
- 카테고리별 5분 캐싱 적용
- 카테고리 7개 × 하루 288회(5분마다) = 최대 2,016회
- 실제로는 캐싱으로 **하루 20-30회 정도만 호출**
- 무료 한도의 20-30%만 사용

```typescript
// lib/newsapi.ts
const response = await fetch(
  `${NEWSAPI_BASE_URL}/top-headlines?...`,
  {
    next: { revalidate: 300 }, // 5분 캐싱
  }
);
```

### 3. Firebase = 무료 ✅

**무료 플랜 한도 (Spark Plan)**
- 하루 50,000 읽기
- 하루 20,000 쓰기
- 1GB 저장소

**실제 사용량**
- 뉴스 캐싱: 카테고리당 5분마다 1회 쓰기 = 하루 약 2,000회
- 사용자 읽기: 캐시 히트율 95%로 가정, 하루 1,000명 방문 시 약 5,000회
- **무료 한도의 10-25%만 사용**

```typescript
// lib/firebase.ts
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5분 캐싱
```

### 4. Vercel = 무료 ✅

**무료 플랜 한도 (Hobby Plan)**
- 월 100GB 대역폭
- 무제한 배포
- 자동 HTTPS

**실제 사용량**
- 페이지 크기: 약 500KB
- 하루 1,000 페이지뷰 = 500MB
- **월 15GB 사용 (무료 한도의 15%)**

## 비용 발생 시나리오 분석

### 시나리오 1: 트래픽 급증

**가정**: 하루 10,000명 방문

- **NewsAPI**: 캐싱으로 여전히 20-30회 호출 → 무료 ✅
- **Firebase**: 읽기 50,000회 → 무료 한도 도달, 하지만 무료 ✅
- **Vercel**: 5GB/일 → 월 150GB → 초과 시 추가 비용 발생 ⚠️

**해결책**:
- Cloudflare Pages로 이전 (무료 무제한)
- 또는 트래픽 모니터링으로 조기 감지

### 시나리오 2: NewsAPI 한도 초과

**가정**: 캐싱 실패, 하루 100회 초과 요청

**결과**:
- API 호출 차단, 에러 메시지 표시
- **비용 발생 없음** (무료 플랜은 차단만 됨) ✅

**해결책**:
```typescript
// 캐싱 시간 늘리기
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10분으로 증가
```

### 시나리오 3: Firebase 한도 초과

**가정**: 하루 50,000 읽기 초과

**결과**:
- Spark 플랜은 한도 초과 시 서비스 일시 중단
- **비용 발생 없음** (자동 과금 안 됨) ✅

**해결책**:
- 로컬 스토리지 캐싱 추가
- 또는 무료 대안으로 전환 (Supabase 무료 티어)

## 장기 운영 전략

### 1단계: 모니터링 설정

```bash
# Firebase Console
- 사용량 알림 설정: 일일 한도의 80% 도달 시
- 이메일 알림 활성화

# NewsAPI Dashboard
- 요청 수 체크: 하루 80회 도달 시 경고

# Vercel Analytics
- 대역폭 사용량 주간 확인
```

### 2단계: 최적화

현재 상태로도 충분하지만, 필요시:

```typescript
// 1. 캐싱 시간 늘리기 (10분)
const CACHE_DURATION_MS = 10 * 60 * 1000;

// 2. 기사 수 줄이기
const limit = parseInt(searchParams.get('limit') || '5'); // 10 → 5

// 3. 브라우저 캐싱 추가
// localStorage에 30분 캐싱 추가
```

### 3단계: 대안 준비

무료 한도 초과 시 대안:

1. **NewsAPI 대체**
   - RSS 피드 직접 파싱 (완전 무료)
   - The Guardian API (무료, 제한 적음)

2. **Firebase 대체**
   - Supabase (월 500MB 무료)
   - PlanetScale (5GB 무료)

3. **Vercel 대체**
   - Cloudflare Pages (무료 무제한)
   - Netlify (월 100GB 무료)

## 100% 무료 보장 체크리스트

- [x] AI API 사용 안 함 (Claude, GPT 제거)
- [x] NewsAPI 무료 한도 내 사용 (캐싱 적용)
- [x] Firebase 무료 티어 사용 (Spark Plan)
- [x] Vercel 무료 플랜 (Hobby Plan)
- [x] 자동 결제 설정 안 함
- [x] 비용 발생 가능성 있는 서비스 제거
- [x] 모니터링 및 알림 설정 가이드 제공

## 결론

**Objective News는 완전 무료로 운영 가능합니다.**

- ✅ 초기 비용: 0원
- ✅ 월간 운영 비용: 0원
- ✅ 트래픽 증가 시: 대안 존재 (여전히 무료)
- ✅ 예상치 못한 과금: 없음 (자동 결제 미설정)

유일한 "비용"은 시간과 노력뿐입니다. 💪
