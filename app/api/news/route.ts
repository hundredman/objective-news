import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, fetchNewsByCategory } from '@/lib/newsapi';
import { processArticles, groupRelatedNews } from '@/lib/fact-filter';
import { getCachedNews, cacheNews } from '@/lib/firebase';

// Cache API responses for 5 minutes
export const revalidate = 300;
export const dynamic = 'force-static';
export const fetchCache = 'force-cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const language = searchParams.get('language') || 'en';

    // Create cache key with language
    const cacheKey = `${category}-${language}`;

    // Try to get cached news first
    const cachedNews = await getCachedNews(cacheKey);
    if (cachedNews && cachedNews.length > 0) {
      return NextResponse.json({
        success: true,
        data: cachedNews,
        count: cachedNews.length,
        cached: true,
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
    await cacheNews(cacheKey, groupedNews);

    return NextResponse.json({
      success: true,
      data: groupedNews,
      count: groupedNews.length,
      cached: false,
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
