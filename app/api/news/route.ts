import { NextRequest, NextResponse } from 'next/server';
import { fetchTopHeadlines, fetchNewsByCategory } from '@/lib/newsapi';
import { processArticles, groupRelatedNews } from '@/lib/fact-filter';
import { getCachedNews, cacheNews } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Try to get cached news first
    const cachedNews = await getCachedNews(category);
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
      articles = await fetchNewsByCategory(category, limit);
    } else {
      articles = await fetchTopHeadlines('us', limit);
    }

    // Extract objective facts using client-side filtering (NO AI API costs!)
    const objectiveNews = processArticles(articles);

    // Group related news items
    const groupedNews = groupRelatedNews(objectiveNews);

    // Cache the results
    await cacheNews(category, groupedNews);

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
