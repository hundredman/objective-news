import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, fetchNewsByCategory } from '@/lib/newsapi';
import { processArticles, groupRelatedNews } from '@/lib/fact-filter';

// Cache API responses for 5 minutes, but allow dynamic params
export const revalidate = 300;
export const dynamic = 'force-dynamic';

// In-memory cache (simple and fast, no Firebase timeout issues)
interface CacheEntry {
  data: any[];
  timestamp: number;
  cachedAt: string;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const language = searchParams.get('language') || 'en';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Create cache key with language
    const cacheKey = `${category}-${language}`;

    // Check in-memory cache (skip if force refresh)
    if (!forceRefresh) {
      const cached = memoryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[Cache Hit] ${cacheKey}`);
        return NextResponse.json({
          success: true,
          data: cached.data,
          count: cached.data.length,
          cached: true,
          cachedAt: cached.cachedAt,
        });
      }
    } else {
      console.log(`[Force Refresh] ${cacheKey}`);
    }

    console.log(`[Cache Miss] Fetching fresh data for ${cacheKey}`);

    // Fetch news articles
    let articles;
    if (category && category !== 'all') {
      articles = await fetchNewsByCategory(category, limit, language);
    } else {
      // For 'all', use general category with language
      articles = await fetchNewsByCategory('general', limit, language);
    }

    // Extract objective facts using client-side filtering (NO AI API costs!)
    const objectiveNews = processArticles(articles);

    // Group related news items
    const groupedNews = groupRelatedNews(objectiveNews);

    // Cache the results in memory
    const cachedAt = new Date().toISOString();
    memoryCache.set(cacheKey, {
      data: groupedNews,
      timestamp: Date.now(),
      cachedAt,
    });

    return NextResponse.json({
      success: true,
      data: groupedNews,
      count: groupedNews.length,
      cached: false,
      cachedAt,
    });
  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}
