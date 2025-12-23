// News article types
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  content: string | null;
}

export interface ObjectiveNews {
  id: string;
  title: string;
  facts: string[];
  sources: Array<{
    name: string;
    url: string;
  }>;
  publishedAt: string;
  imageUrl: string | null;
  importance: number;
  trending: boolean;
}

export interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles: NewsArticle[];
  message?: string;
  code?: string;
}
