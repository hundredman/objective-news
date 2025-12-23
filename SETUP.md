# 빠른 시작 가이드

## ✨ 완전 무료 솔루션

이 앱은 **AI API 비용이 전혀 들지 않습니다**. JavaScript 기반 필터링으로 작동하며, 모든 서비스가 무료 플랜으로 운영 가능합니다.

## 1단계: API 키 발급

### NewsAPI (필수, 무료)
1. https://newsapi.org 접속
2. "Get API Key" 클릭하여 무료 계정 생성
3. API 키 복사
4. **무료 플랜**: 하루 100 요청 (캐싱으로 충분함)

### Firebase (필수, 무료)
1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: objective-news)
4. Firestore Database 생성:
   - 빌드 > Firestore Database 선택
   - "데이터베이스 만들기" 클릭
   - 테스트 모드로 시작 (나중에 규칙 변경)
   - 리전 선택 (asia-northeast3 권장)
5. 웹 앱 설정 정보 가져오기:
   - 프로젝트 설정 (톱니바퀴 아이콘) > 일반
   - "앱 추가" > 웹 (</>) 선택
   - 앱 닉네임 입력
   - Firebase SDK 설정 코드에서 config 값들 복사

**무료 플랜**: 하루 50,000 읽기 / 20,000 쓰기

## 2단계: 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 다음 값들을 입력:

```env
# NewsAPI (무료 - 하루 100 요청)
NEWSAPI_KEY=여기에_발급받은_NewsAPI_키_입력

# Firebase (무료 - 하루 50k 읽기)
NEXT_PUBLIC_FIREBASE_API_KEY=여기에_입력
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=프로젝트ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=숫자입력
NEXT_PUBLIC_FIREBASE_APP_ID=1:숫자:web:문자열
```

**참고**: Claude API나 OpenAI API 키는 필요 없습니다!

## 3단계: 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 4단계: Vercel 배포 (선택, 무료)

```bash
npm install -g vercel
vercel
```

환경 변수를 Vercel Dashboard에서 설정하면 자동으로 배포됩니다.

**무료 플랜으로 충분합니다!**

## 문제 해결

### "NEWSAPI_KEY is not configured" 에러
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작: Ctrl+C 후 `npm run dev` 다시 실행

### "Firebase error" 발생
- Firebase Console에서 Firestore Database가 활성화되어 있는지 확인
- 환경 변수가 올바르게 입력되었는지 확인
- 프로젝트 ID와 앱 ID가 정확한지 확인

### NewsAPI 요청 제한
- 무료 플랜은 하루 100 요청 제한
- Firebase 캐싱(5분)으로 실제 API 호출 최소화
- 실제로는 하루 20-30회 정도만 호출됨

### 사실 추출 정확도 개선
- AI API 없이 JavaScript 패턴 매칭 사용
- 정확도 70-80% 수준
- `lib/fact-filter.ts`에서 패턴 추가 가능

## 비용 걱정 없는 운영

✅ **NewsAPI**: 무료 100 요청/일, 캐싱으로 충분
✅ **Firebase**: 무료 50k 읽기/일, 여유 있음
✅ **Vercel**: 무료 호스팅, 월 100GB 대역폭
✅ **AI API**: 사용 안 함 (비용 0원!)

## 무료 한도 모니터링

1. **Firebase Console** → Usage 탭에서 사용량 확인
2. **NewsAPI** → Dashboard에서 요청 수 확인
3. **Vercel** → Analytics에서 트래픽 확인

무료 한도를 초과할 염려가 거의 없지만, 주기적으로 체크하세요.

## 다음 단계

1. ✅ 앱 실행 확인
2. ✅ Vercel에 배포
3. ✅ Firebase 보안 규칙 설정 (README 참고)
4. ⭐ GitHub Star 남기기!
