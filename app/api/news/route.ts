import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, fetchNewsByCategory } from '@/lib/newsapi';
import { processArticles, groupRelatedNews } from '@/lib/fact-filter';
import { getCachedNews, cacheNews } from '@/lib/firebase';

// Cache API responses for 5 minutes, but allow dynamic params
export const revalidate = 300;
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const language = searchParams.get('language') || 'en';

    // Create cache key with language
    const cacheKey = `${category}-${language}`;

    // Try to get cached news first
    const cacheResult = await getCachedNews(cacheKey);
    if (cacheResult && cacheResult.articles.length > 0) {
      return NextResponse.json({
        success: true,
        data: cacheResult.articles,
        count: cacheResult.articles.length,
        cached: true,
        cachedAt: cacheResult.cachedAt,
      });
    }

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

    // Cache the results with language key
    const cachedAt = new Date().toISOString();
    await cacheNews(cacheKey, groupedNews, cachedAt);

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
