import { NewsArticle, ObjectiveNews } from './types';

// 주관적이거나 추측성 표현들
const SUBJECTIVE_PATTERNS = [
  /reportedly/gi,
  /allegedly/gi,
  /it seems/gi,
  /appears to be/gi,
  /seems to/gi,
  /sources say/gi,
  /according to sources/gi,
  /said in a statement/gi,
  /might/gi,
  /could/gi,
  /may/gi,
  /possibly/gi,
  /potentially/gi,
  /rumor/gi,
  /speculation/gi,
  /unconfirmed/gi,
  /believed to be/gi,
  /believed to/gi,
  /thought to be/gi,
  /thought to/gi,
  /expected to/gi,
  /likely/gi,
  /probably/gi,
  /perhaps/gi,
  /maybe/gi,

  // 시간 메타데이터
  /^earlier today/i,
  /^this morning/i,
  /^yesterday/i,
  /^last night/i,
  /^breaking:/i,
  /^update:/i,
  /^correction:/i,
];

// 감정적이거나 편향된 표현들
const BIASED_WORDS = [
  /shocking/gi,
  /amazing/gi,
  /terrible/gi,
  /wonderful/gi,
  /awful/gi,
  /devastating/gi,
  /incredible/gi,
  /unbelievable/gi,
  /stunning/gi,
  /outrageous/gi,
];

/**
 * 한국어 텍스트인지 확인
 */
function isKoreanText(text: string): boolean {
  // 한글 유니코드 범위: AC00-D7A3
  return /[\uAC00-\uD7A3]/.test(text);
}

/**
 * 문장이 객관적인 사실인지 판단
 */
function isFactualSentence(sentence: string): boolean {
  // 너무 짧은 문장 제외
  if (sentence.length < 20) return false;

  // 질문 형태 제외
  if (sentence.includes('?')) return false;

  // 기자 정보, 메타데이터, 광고성 패턴 제외
  const metadataPatterns = [
    /\[.*?\]/,  // 모든 대괄호 패턴 ([앵커], [OSEN=...], [...] 등)
    /\(.*?기자\)/,  // (연합뉴스 기자)
    /^.*?기자\s*=/,  // 장우영 기자 =
    /^기자,/,  // 기자, 페르난도 두아르테 기자... (문장 시작)
    /기자,.*?기자/,  // 기자, 페르난도 두아르테 기자
    /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/,  // 2025년 12월 25일 (날짜 포함 메타정보)
    /^사진\s*=/,  // 사진=클립아트코리아, 사진=고펀드미
    /사진\s*=.*?\s/,  // 사진= 출처 패턴
    /보도에 따르면/,  // 영국 매체 미러 등 보도에 따르면
    /매체.*?에 따르면/,  // 매체 인용 패턴
    /한눈에 보는.*?:/,  // 한눈에 보는 오늘 : 종합 - 뉴스 :
    /^.*?\s*:\s*종합\s*-\s*뉴스\s*:/,  // 섹션 헤더 (종합 - 뉴스 :)
    /<.*?>/,  // <방송 시청 후 작성된 리뷰 기사입니다>
    /^.*?=.*?뉴스\)/,  // 의정부=연합뉴스), 서울=MBC뉴스)
    /^\w+\s*=\s*.*?뉴스\)/,  // 의정부=연합뉴스), 서울=MBC뉴스)

    // 편집자 주석 및 메타 정보
    /spoiler/i,  // Spoiler warnings

    // URL 및 링크 관련
    /read more at/i,
    /continue reading/i,
    /full story/i,
    /click here/i,
    /visit our/i,
    /http[s]?:\/\//,  // URL 포함

    // 구독 및 광고
    /subscribe to/i,
    /follow us/i,
    /join us/i,
    /sign up/i,
    /newsletter/i,
    /get updates/i,

    // 저작권
    /©\s*\d{4}/,  // © 2024
    /copyright/i,
    /all rights reserved/i,
    /proprietary/i,

    // 한국어 광고성 패턴
    /자세한 내용은/,
    /더 보기/,
    /더보기/,
    /구독하기/,
    /팔로우/,
    /클릭/,
    /바로가기/,
    /원\s*[,\/모두]/,  // 가격 표시 (5만9000원, 21만8000원 모두)
    /\d+원/,  // 숫자+원 (가격)
    /mL\s*\//,  // 용량/가격 표시 (9mL/3만4000원)
    /^\d+\s+[가-힣]/,  // 번호로 시작하는 제품 리스트 (1 프레이그런스, 2 파촐리...)
    /띠/,  // 운세 (쥐띠, 소띠, 호랑이띠...)
    /년생/,  // 운세 (1948년생, 1960년생...)
    /운세/,  // 운세 기사
    /오늘의 운세/,  // 운세 기사 제목
    /음력\s+\d+월\s+\d+일/,  // 음력 날짜 (음력 11월 07일)
    /©/,  // 저작권 표시 (이미지 설명에 자주 포함)
    /▲/,  // 이미지 캡션 기호
    /챗GPT.*?이미지/,  // 챗GPT 생성 이미지
    /생성.*?이미지/,  // AI 생성 이미지
    /\(.*?\).*?\/.*?이미지/,  // (이름)/이미지 패턴
    /[가-힣]+\([A-Za-z\s]+\).*?\/.*?©/,  // 한글(영문)/출처© 패턴
    /정책브리핑/,  // 정책브리핑 메타데이터
    /\|.*?\|/,  // 출처 구분자 (정책브리핑 | 뉴스 | 카드/한컷)
    /카드\/한컷/,  // 카드/한컷 콘텐츠 타입
    /에서 운영하는.*?포털사이트/,  // 사이트 소개문
    /서비스합니다/,  // 서비스 소개 끝부분

    // 한국어 인용 및 전달 패턴
    /라고 밝혔다/,
    /라고 말했다/,
    /라고 전했다/,
    /라고 강조했다/,
    /것으로 알려져/,
    /라는 소문/,
    /라는 이야기/,

    // 한국어 분석/평가 패턴
    /것으로 평가/,
    /것으로 분석/,
    /로 풀이/,
    /것으로 해석/,

    // 한국어 방송 관련
    /다시보기/,
    /본방송/,
    /재방송/,
    /편집자주/,
    /취재/,
    /특파원/,
  ];

  for (const pattern of metadataPatterns) {
    if (pattern.test(sentence)) return false;
  }

  const isKorean = isKoreanText(sentence);

  // 한국어가 아닌 경우에만 영어 패턴 체크
  if (!isKorean) {
    // 주관적 패턴이 포함된 문장 제외
    for (const pattern of SUBJECTIVE_PATTERNS) {
      if (pattern.test(sentence)) return false;
    }

    // 감정적 단어가 포함된 문장 제외
    for (const word of BIASED_WORDS) {
      if (word.test(sentence)) return false;
    }

    // 숫자, 날짜, 고유명사가 포함된 문장 우선
    const hasNumbers = /\d+/.test(sentence);
    const hasProperNouns = /[A-Z][a-z]+/.test(sentence);
    const hasDate = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|\d{4})/i.test(sentence);

    // 최소한 하나는 있어야 함
    return hasNumbers || hasProperNouns || hasDate;
  } else {
    // 한국어의 경우 더 관대하게 처리
    // 한국어 주관적 및 질문 패턴
    const koreanSubjectivePatterns = [
      /것으로 보인다/,
      /것으로 알려졌다/,
      /추정/,
      /예상/,
      /전망/,
      /수도 있다/,
      /지도 모른다/,
      /일지도 모른다/,
      /일 수 있다/,
      /가능성/,
      /것으로 추측/,
      /것으로 예상/,
      /무엇이고/,  // 질문 형태
      /어떻게/,    // 질문 형태
      /왜/,        // 질문 형태
      /언제/,      // 질문 형태
      /어디/,      // 질문 형태
      /누구/,      // 질문 형태
      /얼마나/,    // 질문 형태 (얼마나 우려해야)
    ];

    for (const pattern of koreanSubjectivePatterns) {
      if (pattern.test(sentence)) return false;
    }

    // 한국어는 기본적으로 통과
    return true;
  }
}

/**
 * 두 문자열의 유사도 계산 (0-1, 1이 완전히 동일)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // 짧은 문자열이 긴 문자열에 포함되면 유사도 높음
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  }

  return 0;
}

/**
 * 텍스트에서 객관적인 사실만 추출
 */
function extractFacts(text: string): string[] {
  if (!text) return [];

  // 문장으로 분리
  // 마침표, 느낌표, 세미콜론 뒤에 공백+대문자/한글이 오는 경우만 문장 구분
  let sentences: string[] = [];
  let currentSentence = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    currentSentence += char;

    // 따옴표 상태 추적 (일반 따옴표와 유니코드 따옴표)
    const quoteChars = ['"', "'", '\u2018', '\u2019', '\u201C', '\u201D']; // ' ' " "
    if (quoteChars.includes(char)) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else {
        // 닫는 따옴표 확인 (짝 맞추기)
        const isClosingQuote =
          char === quoteChar ||
          (quoteChar === '"' && char === '\u201D') ||
          (quoteChar === '\u201C' && char === '\u201D') ||
          (quoteChar === "'" && char === '\u2019') ||
          (quoteChar === '\u2018' && char === '\u2019');

        if (isClosingQuote) {
          inQuotes = false;
          quoteChar = '';
        }
      }
    }

    // 문장 종결 기호 확인 (따옴표 안에 있으면 무시)
    if (!inQuotes && (char === '.' || char === '!' || char === ';')) {
      // 다음 문자들 확인
      const nextChar = text[i + 1];
      const nextNextChar = text[i + 2];

      // 약어 패턴 체크 (vs., Mr., Dr., etc.)
      const beforeDot = currentSentence.slice(-10).toLowerCase();
      const isAbbreviation = /\b(vs|mr|mrs|ms|dr|prof|sr|jr|etc|e\.g|i\.e)\.$/.test(beforeDot);

      // 약어가 아니고, 다음이 공백이고 그 다음이 대문자/한글/숫자/특수문자면 문장 끝
      if (!isAbbreviation && nextChar === ' ' && nextNextChar && /[A-Z가-힣0-9\[\(\<]/.test(nextNextChar)) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
        i++; // 공백 건너뛰기
      }
      // 텍스트의 마지막이면 문장 끝
      else if (i === text.length - 1) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
    }
  }

  // 남은 문장 추가
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  // 객관적인 사실만 필터링
  let facts = sentences
    .filter(s => s.length > 0)
    .filter(isFactualSentence)
    .filter(s => {
      // "..." (마침표 3개) 또는 "…" (유니코드 생략 기호) 포함된 불완전한 문장 제거
      return !s.includes('...') && !s.includes('…') && !s.endsWith('..');
    })
    .map(s => {
      // 문장이 마침표로 끝나지 않으면 추가
      if (!s.endsWith('.') && !s.endsWith('!') && !s.endsWith(';')) s += '.';
      return s;
    });

  // 유사한 사실 제거 (80% 이상 유사하면 중복으로 간주)
  const uniqueFacts: string[] = [];
  for (const fact of facts) {
    const isDuplicate = uniqueFacts.some(existing =>
      calculateSimilarity(fact, existing) > 0.8
    );
    if (!isDuplicate) {
      uniqueFacts.push(fact);
    }
  }

  return uniqueFacts.slice(0, 7); // 최대 7개
}

/**
 * 뉴스의 중요도 계산 (1-10)
 */
function calculateImportance(article: NewsArticle): number {
  let score = 5; // 기본 점수

  const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // 키워드 기반 중요도 증가
  const highPriorityKeywords = [
    'president', 'government', 'war', 'economy', 'crisis',
    'pandemic', 'emergency', 'disaster', 'death', 'killed',
    'billion', 'million', 'breakthrough', 'historic'
  ];

  const mediumPriorityKeywords = [
    'announce', 'launch', 'release', 'report', 'study',
    'research', 'new', 'first', 'major', 'significant'
  ];

  // 고우선순위 키워드 (+2점)
  for (const keyword of highPriorityKeywords) {
    if (fullText.includes(keyword)) {
      score += 2;
      break;
    }
  }

  // 중간우선순위 키워드 (+1점)
  for (const keyword of mediumPriorityKeywords) {
    if (fullText.includes(keyword)) {
      score += 1;
      break;
    }
  }

  // 숫자가 많으면 구체적인 정보 (+1점)
  const numberCount = (fullText.match(/\d+/g) || []).length;
  if (numberCount >= 3) score += 1;

  // 최근 뉴스일수록 중요 (+1점)
  const publishedDate = new Date(article.publishedAt);
  const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  if (hoursSincePublished < 6) score += 1;

  // 1-10 범위로 제한
  return Math.max(1, Math.min(10, score));
}

/**
 * 뉴스 기사를 객관적인 사실로 변환
 */
export function processArticleToObjectiveFacts(article: NewsArticle): ObjectiveNews | null {
  const fullText = `${article.title}. ${article.description || ''} ${article.content || ''}`;
  const facts = extractFacts(fullText);

  // 제목과 동일하거나 매우 유사한 사실 제거 (90% 이상 유사도)
  const filteredFacts = facts.filter(fact =>
    calculateSimilarity(fact, article.title) < 0.9
  );

  // 사실이 하나도 추출되지 않으면 null 반환
  if (filteredFacts.length === 0) return null;

  return {
    id: article.id,
    title: article.title,
    facts: filteredFacts,
    sources: [
      {
        name: article.source.name,
        url: article.url,
      },
    ],
    publishedAt: article.publishedAt,
    imageUrl: article.urlToImage,
    importance: calculateImportance(article),
    trending: false,
  };
}

/**
 * 여러 뉴스 기사를 처리
 */
export function processArticles(articles: NewsArticle[]): ObjectiveNews[] {
  return articles
    .map(processArticleToObjectiveFacts)
    .filter((news): news is ObjectiveNews => news !== null)
    .sort((a, b) => b.importance - a.importance);
}

/**
 * 문자열을 간단한 해시로 변환 (안정적인 ID 생성용)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * 유사한 뉴스 그룹화
 */
export function groupRelatedNews(newsItems: ObjectiveNews[]): ObjectiveNews[] {
  const grouped: Map<string, ObjectiveNews> = new Map();

  for (const item of newsItems) {
    // 제목의 주요 단어로 그룹화 키 생성
    const titleWords = item.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '') // 한글도 포함
      .split(/\s+/)
      .filter(word => word.length > 4) // 4글자 이상 단어만
      .slice(0, 3)
      .join(' ');

    const key = titleWords || item.title.substring(0, 30);

    // 안정적인 ID 생성: 제목 기반 해시
    const stableId = simpleHash(item.title.toLowerCase().trim());

    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      // 중복 제거하면서 사실 병합
      const combinedFacts = [...existing.facts, ...item.facts];
      const uniqueFacts = Array.from(new Set(combinedFacts)).slice(0, 10);

      existing.facts = uniqueFacts;
      existing.sources.push(...item.sources);
      existing.importance = Math.max(existing.importance, item.importance);
      // ID는 유지 (이미 설정된 stable ID)
    } else {
      // 새로운 그룹: 안정적인 ID 사용
      grouped.set(key, { ...item, id: stableId });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.importance - a.importance);
}
