import { NewsAPIResponse, NewsArticle } from './types';

// GNews API - Free tier: 100 requests/day, works in production
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

export async function fetchTopHeadlines(
  country: string = 'us',
  pageSize: number = 20
): Promise<NewsArticle[]> {
  // This function is deprecated, use fetchNewsByCategory instead
  const language = country === 'kr' ? 'ko' : 'en';
  return fetchNewsByCategory('general', pageSize, language);
}

export async function fetchNewsByCategory(
  category: string,
  pageSize: number = 20,
  language: string = 'en'
): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) {
    throw new Error('GNEWS_API_KEY is not configured');
  }

  const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  try {
    // GNews API uses 'topic' instead of 'category'
    // Map categories to GNews topics
    const topicMap: Record<string, string> = {
      'general': 'breaking-news',
      'business': 'business',
      'entertainment': 'entertainment',
      'health': 'health',
      'science': 'science',
      'sports': 'sports',
      'technology': 'technology',
    };

    const topic = topicMap[category] || 'breaking-news';
    const lang = language === 'ko' ? 'ko' : 'en';
    const country = language === 'ko' ? 'kr' : 'us';

    // GNews API format: /top-headlines?topic=breaking-news&lang=en&country=us&max=10&apikey=YOUR_API_KEY
    const url = `${GNEWS_BASE_URL}/top-headlines?topic=${topic}&lang=${lang}&country=${country}&max=${pageSize}&apikey=${GNEWS_API_KEY}`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GNews API error response:', errorText);
      throw new Error(`GNews API error: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from GNews API:', text);
      throw new Error('GNews API returned non-JSON response');
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GNews API error: ${JSON.stringify(data.errors)}`);
    }

    // Transform GNews format to our NewsArticle format
    return data.articles.map((article: any, index: number) => ({
      id: `${category}-${Date.now()}-${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: {
        id: null,
        name: article.source.name,
      },
      content: article.content,
    }));
  } catch (error) {
    console.error('Error fetching news by category:', error);
    throw error;
  }
}

export async function searchNews(
  query: string,
  pageSize: number = 20,
  language: string = 'en'
): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) {
    throw new Error('GNEWS_API_KEY is not configured');
  }

  try {
    const lang = language === 'ko' ? 'ko' : 'en';
    const url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}&max=${pageSize}&apikey=${GNEWS_API_KEY}`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GNews API error response:', errorText);
      throw new Error(`GNews API error: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from GNews API:', text);
      throw new Error('GNews API returned non-JSON response');
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GNews API error: ${JSON.stringify(data.errors)}`);
    }

    // Transform GNews format to our NewsArticle format
    return data.articles.map((article: any, index: number) => ({
      id: `search-${Date.now()}-${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: {
        id: null,
        name: article.source.name,
      },
      content: article.content,
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
}
