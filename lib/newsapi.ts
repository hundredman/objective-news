import { NewsAPIResponse, NewsArticle } from './types';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

export async function fetchTopHeadlines(
  country: string = 'us',
  pageSize: number = 20
): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) {
    throw new Error('NEWSAPI_KEY is not configured');
  }

  try {
    const response = await fetch(
      `${NEWSAPI_BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data: NewsAPIResponse = await response.json();

    // Add unique IDs to articles
    return data.articles.map((article, index) => ({
      ...article,
      id: `${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function fetchNewsByCategory(
  category: string,
  pageSize: number = 20
): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) {
    throw new Error('NEWSAPI_KEY is not configured');
  }

  const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  try {
    const response = await fetch(
      `${NEWSAPI_BASE_URL}/top-headlines?category=${category}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data: NewsAPIResponse = await response.json();

    return data.articles.map((article, index) => ({
      ...article,
      id: `${category}-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Error fetching news by category:', error);
    throw error;
  }
}

export async function searchNews(
  query: string,
  pageSize: number = 20
): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) {
    throw new Error('NEWSAPI_KEY is not configured');
  }

  try {
    const response = await fetch(
      `${NEWSAPI_BASE_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data: NewsAPIResponse = await response.json();

    return data.articles.map((article, index) => ({
      ...article,
      id: `search-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
}
