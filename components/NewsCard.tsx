'use client';

import { ObjectiveNews } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

interface NewsCardProps {
  news: ObjectiveNews;
}

export default function NewsCard({ news }: NewsCardProps) {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

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
      className="group card-shadow hover:card-shadow-hover rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--card-bg)' }}
    >
      {news.imageUrl && !imageError && (
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
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
          <div className="absolute top-3 right-3">
            <div className={`${priority.color} text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm bg-opacity-95 flex items-center gap-1.5 shadow-lg`}>
              <span className="text-sm">{priority.icon}</span>
              <span>{priority.label}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(news.publishedAt), {
              addSuffix: true,
              locale: language === 'ko' ? ko : undefined
            })}
          </span>
          {(!news.imageUrl || imageError) && (
            <div className={`${priority.color} text-white px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5`}>
              <span className="text-xs">{priority.icon}</span>
              <span>{priority.label}</span>
            </div>
          )}
        </div>

        <h2
          className="text-xl font-bold mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
          style={{ color: 'var(--foreground)' }}
        >
          {news.title}
        </h2>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.verifiedFacts}
          </div>
          <ul className="space-y-2">
            {news.facts.slice(0, 3).map((fact, index) => (
              <li key={index} className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          {news.facts.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              +{news.facts.length - 3} {t.moreFacts}
            </p>
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
