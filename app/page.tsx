'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';
import CategoryFilter from '@/components/CategoryFilter';
import { ObjectiveNews } from '@/lib/types';

export default function Home() {
  const [news, setNews] = useState<ObjectiveNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  async function fetchNews() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/news?category=${selectedCategory}&limit=10`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setNews(data.data);
      setCached(data.cached || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Objective News
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Fact-based news without bias or opinions
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {cached && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Showing cached results (updates every 5 minutes)
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No news available</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>

        {!loading && news.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchNews}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Refresh News
            </button>
          </div>
        )}
      </div>

      <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Objective News aggregates news from various sources and filters out subjective opinions automatically.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
            News data from NewsAPI • Client-side fact filtering (100% Free, No AI API costs)
          </p>
        </div>
      </footer>
    </div>
  );
}
