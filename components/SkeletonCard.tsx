'use client';

export default function SkeletonCard() {
  return (
    <article
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'var(--card-bg)' }}
    >
      {/* Image skeleton */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700" />

      <div className="p-6">
        {/* Date skeleton */}
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />

        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>

        {/* Facts header skeleton */}
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />

        {/* Facts skeleton */}
        <div className="space-y-2 mb-5">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>

        {/* Sources skeleton */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
