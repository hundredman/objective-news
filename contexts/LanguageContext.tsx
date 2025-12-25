'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Detect user's location/language preference
  const getDefaultLanguage = (): Language => {
    // Check if running in browser
    if (typeof window === 'undefined') return 'en';

    // First check localStorage for saved preference
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'ko')) {
      return saved;
    }

    // Detect from browser language settings
    const browserLang = navigator.language || (navigator as any).userLanguage;

    // Check if Korean (ko, ko-KR, ko-kr, etc.)
    if (browserLang.toLowerCase().startsWith('ko')) {
      return 'ko';
    }

    // Default to English for all other regions
    return 'en';
  };

  const [language, setLanguageState] = useState<Language>(getDefaultLanguage());

  useEffect(() => {
    // Re-check on mount in case initial state was server-side
    const defaultLang = getDefaultLanguage();
    if (defaultLang !== language) {
      setLanguageState(defaultLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
