'use client';

import { ObjectiveNews } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

interface NewsCardProps {
  news: ObjectiveNews;
  isNew?: boolean;
}

export default function NewsCard({ news, isNew = false }: NewsCardProps) {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [factsExpanded, setFactsExpanded] = useState(false);

  // Priority levels with colors and labels
  const getPriorityConfig = (importance: number) => {
    if (importance >= 8) {
      return {
        color: 'bg-red-500',
        label: t.priority.high,
        icon: '🔴',
      };
    } else if (importance >= 6) {
      return {
        color: 'bg-amber-500',
        label: t.priority.medium,
        icon: '🟡',
      };
    } else {
      return {
        color: 'bg-blue-500',
        label: t.priority.low,
        icon: '🔵',
      };
    }
  };

  const priority = getPriorityConfig(news.importance);

  return (
    <article
      data-news-new={isNew ? "true" : undefined}
      className={`group card-shadow hover:card-shadow-hover rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        isNew ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900' : ''
      }`}
      style={{ background: 'var(--card-bg)' }}
    >
      {/* Header image or placeholder */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {news.imageUrl && !imageError ? (
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className={`${priority.color} text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm bg-opacity-95 flex items-center gap-1.5 shadow-lg`}>
            <span className="text-sm">{priority.icon}</span>
            <span>{priority.label}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(news.publishedAt), {
              addSuffix: true,
              locale: language === 'ko' ? ko : undefined
            })}
          </span>
        </div>

        <div className="flex items-start gap-2 mb-4">
          <h2
            className="text-xl font-bold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1"
            style={{ color: 'var(--foreground)' }}
          >
            {news.title}
          </h2>
          {isNew && (
            <span className="flex-shrink-0 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
              {t.newBadge}
            </span>
          )}
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.keyFacts}
          </div>
          <ul className="space-y-2">
            {(factsExpanded ? news.facts : news.facts.slice(0, 3)).map((fact, index) => (
              <li key={index} className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300 w-full">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                <span className="flex-1 break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{fact}</span>
              </li>
            ))}
          </ul>
          {news.facts.length > 3 && (
            <button
              onClick={() => setFactsExpanded(!factsExpanded)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
            >
              {factsExpanded ? (
                <>
                  <span>{t.showLess}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>+{news.facts.length - 3} {t.moreFacts}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.sources}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {news.sources.slice(0, 2).map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium"
                >
                  {source.name}
                </a>
              ))}
              {news.sources.length > 2 && (
                <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                  +{news.sources.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
