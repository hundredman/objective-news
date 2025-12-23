'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', icon: '📰' },
  { id: 'business', icon: '💼' },
  { id: 'technology', icon: '💻' },
  { id: 'science', icon: '🔬' },
  { id: 'health', icon: '🏥' },
  { id: 'sports', icon: '⚽' },
  { id: 'entertainment', icon: '🎬' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all hover:scale-105 active:scale-95 ${
            selectedCategory === category.id
              ? 'text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          style={
            selectedCategory === category.id
              ? { background: 'var(--accent)' }
              : {}
          }
        >
          <span className="text-base">{category.icon}</span>
          <span className="text-sm">{t.categories[category.id as keyof typeof t.categories]}</span>
        </button>
      ))}
    </div>
  );
}
