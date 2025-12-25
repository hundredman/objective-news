'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';
import CategoryFilter from '@/components/CategoryFilter';
import SkeletonCard from '@/components/SkeletonCard';
import { ObjectiveNews } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [news, setNews] = useState<ObjectiveNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cached, setCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [previousNewsIds, setPreviousNewsIds] = useState<Set<string>>(new Set());
  const [newNewsIds, setNewNewsIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, language]);

  async function fetchNews(forceRefresh = false) {
    setLoading(true);
    setError(null);

    try {
      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await fetch(`/api/news?category=${selectedCategory}&limit=10&language=${language}${refreshParam}`);
      const data = await response.json();

      console.log('API Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      const newData = data.data || [];

      // Track new news items
      if (forceRefresh && previousNewsIds.size > 0) {
        const currentIds = new Set<string>(newData.map((item: ObjectiveNews) => item.id));
        const newIds = new Set<string>();

        currentIds.forEach((id: string) => {
          if (!previousNewsIds.has(id)) {
            newIds.add(id);
          }
        });

        setNewNewsIds(newIds);

        // Clear "new" badges after 10 seconds
        setTimeout(() => {
          setNewNewsIds(new Set());
        }, 10000);
      } else {
        setNewNewsIds(new Set());
      }

      // Update previous news IDs for next refresh
      setPreviousNewsIds(new Set<string>(newData.map((item: ObjectiveNews) => item.id)));

      setNews(newData);
      setCached(data.cached || false);
      setCachedAt(data.cachedAt || null);

      console.log('News loaded:', newData.length || 0, 'articles');
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Header */}
      <header className="border-b" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Language Toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-sm font-medium">{language === 'en' ? '한국어' : 'English'}</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 tracking-tight" style={{ color: 'var(--foreground)' }}>
              {t.title}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t.badge}
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {cached && cachedAt && (
          <div className="mb-6 p-4 rounded-xl border backdrop-blur-sm" style={{
            background: 'rgba(59, 130, 246, 0.05)',
            borderColor: 'rgba(59, 130, 246, 0.2)'
          }}>
            <div className="flex items-center justify-between gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t.cached}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.lastUpdated}: {new Date(cachedAt).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: language === 'en'
                })}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="card-shadow rounded-2xl p-6 mb-6" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">{t.errorTitle}</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                <button
                  onClick={() => fetchNews(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {t.tryAgain}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-32">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t.noNews}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} isNew={newNewsIds.has(item.id)} />
          ))}
        </div>

        {!loading && news.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => fetchNews(true)}
              className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'var(--accent)',
                color: 'white',
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)'
              }}
            >
              {t.refreshNews}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              {t.footerTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              {t.footerDescription}
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <span>{t.footerTech}</span>
              <span>•</span>
              <span>{t.footerFilter}</span>
              <span>•</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{t.footerFree}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
