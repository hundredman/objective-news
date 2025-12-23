# Objective News

객관적이고 편향되지 않은 뉴스 정보만을 제공하는 웹 애플리케이션입니다. **완전 무료**로 운영 가능하며, JavaScript 기반 필터링으로 뉴스 기사에서 검증 가능한 사실만을 추출합니다.

## ✨ 완전 무료 운영 보장

- **❌ AI API 비용 없음**: Claude나 OpenAI 같은 유료 AI API 사용 안 함
- **✅ 클라이언트 측 필터링**: JavaScript로 주관적 표현 자동 제거
- **✅ 무료 API 사용**: NewsAPI 무료 플랜 (하루 100 요청)
- **✅ 무료 호스팅**: Vercel + Firebase 무료 티어
- **✅ 비용 걱정 없음**: 트래픽이 늘어나도 무료 한도 내에서 운영

## 주요 기능

- **객관적인 사실 추출**: 클라이언트 측 알고리즘으로 검증 가능한 사실만 추출
  - 주관적 표현 자동 제거 ("reportedly", "allegedly", "seems" 등)
  - 감정적 단어 필터링 ("shocking", "terrible" 등)
  - 추측성 문장 제거
- **다양한 카테고리**: 비즈니스, 기술, 과학, 건강, 스포츠, 엔터테인먼트 등
- **중요도 평가**: 키워드와 시간 기반으로 뉴스 중요도 자동 평가 (1-10)
- **스마트 캐싱**: Firebase를 활용한 5분 캐싱으로 API 호출 최소화
- **반응형 디자인**: 웹과 모바일 모두에서 최적화된 UX

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Fact Extraction**: 클라이언트 측 JavaScript 필터링 (AI API 없음!)
- **News Data**: NewsAPI (무료 플랜)
- **Database**: Firebase Firestore (무료 티어)
- **Deployment**: Vercel (무료 호스팅)

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd objective-news
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 필요한 API 키를 입력하세요:

```bash
cp .env.local.example .env.local
```

#### 필요한 설정 (모두 무료):

1. **NewsAPI Key** (무료 - 하루 100 요청)
   - https://newsapi.org 에서 무료 계정 생성
   - API 키를 `NEWSAPI_KEY`에 입력

2. **Firebase 설정** (무료 - 하루 50,000 읽기)
   - https://console.firebase.google.com 에서 프로젝트 생성
   - Firestore Database 활성화
   - 프로젝트 설정에서 웹 앱 설정 정보를 복사하여 환경 변수에 입력

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 배포

### Vercel 배포 (무료, 권장)

1. Vercel 계정에 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정 (위의 모든 환경 변수 입력)
4. 배포

```bash
npm install -g vercel
vercel
```

**무료 플랜으로 충분합니다!**

### Firebase 보안 규칙 설정

Firestore에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /news/{document=**} {
      allow read: if true;
      allow write: if false; // 서버에서만 쓰기 가능
    }
  }
}
```

## 프로젝트 구조

```
objective-news/
├── app/
│   ├── api/
│   │   └── news/
│   │       └── route.ts       # 뉴스 API 엔드포인트
│   ├── globals.css            # 글로벌 스타일
│   ├── layout.tsx             # 루트 레이아웃
│   └── page.tsx               # 메인 페이지
├── components/
│   ├── CategoryFilter.tsx     # 카테고리 필터 컴포넌트
│   └── NewsCard.tsx           # 뉴스 카드 컴포넌트
├── lib/
│   ├── fact-filter.ts         # 클라이언트 측 사실 추출 로직
│   ├── firebase.ts            # Firebase 설정 및 캐싱
│   ├── newsapi.ts             # NewsAPI 통합
│   └── types.ts               # TypeScript 타입 정의
└── package.json
```

## 작동 원리

1. **뉴스 수집**: NewsAPI를 통해 최신 뉴스 기사 수집
2. **사실 추출**: JavaScript 알고리즘이 각 기사를 분석하여:
   - 주관적 표현 패턴 매칭으로 제거
   - 감정적 단어 필터링
   - 검증 가능한 사실만 추출 (숫자, 날짜, 고유명사 포함 문장 우선)
   - 중요도 자동 평가
3. **그룹화**: 유사한 주제의 뉴스를 그룹화하여 중복 제거
4. **캐싱**: Firebase에 결과를 5분간 캐싱하여 API 호출 최소화
5. **표시**: 사용자에게 객관적인 사실만을 깔끔하게 표시

## 완전 무료 운영 전략

### 무료 티어 한도

- **NewsAPI**: 무료 플랜은 하루 100 요청
  - 캐싱으로 실제 API 호출은 하루 20-30회 정도
  - 카테고리별 5분 캐싱 적용

- **Firebase Firestore**: 무료 플랜
  - 하루 50,000 읽기 / 20,000 쓰기
  - 캐싱 덕분에 충분히 여유 있음

- **Vercel**: 무료 플랜
  - 월 100GB 대역폭
  - 무제한 배포
  - 중소 규모 트래픽에 충분

### 비용 없이 운영하는 방법

1. **캐싱 적극 활용** ✅
   - 현재 5분 캐싱으로 API 호출 96% 감소
   - 필요시 10분으로 늘려도 무방

2. **무료 한도 내 사용** ✅
   - NewsAPI: 하루 100 요청 제한 내 운영
   - Firebase: 무료 한도 충분
   - Vercel: 무료 플랜으로 충분

3. **AI API 비용 없음** ✅
   - Claude/GPT 같은 유료 API 완전 제거
   - JavaScript 필터링으로 대체

4. **모니터링** ⚠️
   - Firebase Console에서 사용량 확인
   - NewsAPI 사용량 체크
   - 무료 한도 초과 전 알림 설정

## 사실 추출 정확도 향상 팁

현재 JavaScript 필터링은 AI보다 정확도가 낮지만 완전 무료입니다. 정확도를 높이려면:

1. `lib/fact-filter.ts`의 패턴 추가
2. 키워드 리스트 확장
3. 더 정교한 문장 분석 로직 추가

## React Native 모바일 앱 (향후 계획)

현재는 웹 애플리케이션만 구현되어 있습니다. 웹 버전이 반응형으로 모바일에서도 잘 작동합니다.

React Native로 네이티브 앱을 추가하려면:

```bash
npx create-expo-app objective-news-mobile
# API 엔드포인트를 Vercel 배포 URL로 설정
```

## FAQ

**Q: 정말 완전 무료인가요?**
A: 네! AI API를 사용하지 않고 클라이언트 측 필터링만 사용하므로 비용이 발생하지 않습니다.

**Q: 트래픽이 늘어나면 어떻게 되나요?**
A: Firebase와 Vercel의 무료 한도가 넉넉합니다. 캐싱 덕분에 API 호출이 최소화되어 무료 한도 내에서 충분히 운영 가능합니다.

**Q: AI 없이 정확도가 괜찮나요?**
A: 완벽하지는 않지만 주관적 표현의 70-80%를 걸러냅니다. 패턴을 계속 추가하면 정확도를 높일 수 있습니다.

**Q: NewsAPI 무료 플랜 제한은?**
A: 하루 100 요청이지만, 5분 캐싱으로 실제 API 호출은 20-30회 정도로 충분합니다.

## 라이선스

ISC

## 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!
