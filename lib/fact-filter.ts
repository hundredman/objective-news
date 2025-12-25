import { NewsArticle, ObjectiveNews } from './types';

// 주관적이거나 추측성 표현들
const SUBJECTIVE_PATTERNS = [
  /reportedly/gi,
  /allegedly/gi,
  /it seems/gi,
  /appears to be/gi,
  /sources say/gi,
  /according to sources/gi,
  /might/gi,
  /could/gi,
  /may/gi,
  /possibly/gi,
  /potentially/gi,
  /rumor/gi,
  /speculation/gi,
  /unconfirmed/gi,
  /believed to/gi,
  /thought to/gi,
  /expected to/gi,
  /likely/gi,
  /probably/gi,
  /perhaps/gi,
  /maybe/gi,
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
    // 한국어 주관적 패턴
    const koreanSubjectivePatterns = [
      /것으로 보인다/,
      /것으로 알려졌다/,
      /추정/,
      /예상/,
      /전망/,
    ];

    for (const pattern of koreanSubjectivePatterns) {
      if (pattern.test(sentence)) return false;
    }

    // 한국어는 기본적으로 통과 (질문만 제외)
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

  // 문장으로 분리 (마침표, 느낌표, 세미콜론 기준)
  const sentences = text
    .split(/[.!;]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 객관적인 사실만 필터링
  let facts = sentences
    .filter(isFactualSentence)
    .filter(s => {
      // "..." (마침표 3개) 또는 "…" (유니코드 생략 기호) 포함된 불완전한 문장 제거
      return !s.includes('...') && !s.includes('…') && !s.endsWith('..');
    })
    .map(s => {
      // 문장이 마침표로 끝나지 않으면 추가
      if (!s.endsWith('.')) s += '.';
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
