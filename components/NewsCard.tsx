'use client';

import { ObjectiveNews } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface NewsCardProps {
  news: ObjectiveNews;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {news.imageUrl && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          news.importance >= 8 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          news.importance >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          Importance: {news.importance}/10
        </span>
      </div>

      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {news.title}
      </h2>

      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Verified Facts:
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {news.facts.map((fact, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-3 mt-4">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
          Sources:
        </h4>
        <div className="flex flex-wrap gap-2">
          {news.sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {source.name}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
