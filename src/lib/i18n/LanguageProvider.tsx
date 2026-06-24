// ============================================================
//  LanguageProvider.tsx — React Context for i18n
//  URL-based language routing with ?lang= query parameter
//  Persists to localStorage, updates URL on change
// ============================================================

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Lang, translations } from './translations';

// ─── Types ───

export interface LanguageInfo {
  code: Lang;
  label: string;
  flag: string;
  name: string;
}

export interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  switchLang: (newLang: Lang) => void;
}

// ─── Language Definitions ───

export const languages: LanguageInfo[] = [
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'ro', label: 'RO', flag: '🇷🇴', name: 'Română' },
  { code: 'hu', label: 'HU', flag: '🇭🇺', name: 'Magyar' },
];

const DEFAULT_LANG: Lang = 'es';
const STORAGE_KEY = 'mario-viajes-lang';

// ─── Context ───

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ───

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from: URL param > localStorage > default
  const [lang, setLangState] = useState<Lang>(() => {
    // We can't access window during SSR, so use default initially
    if (typeof window === 'undefined') return DEFAULT_LANG;

    try {
      // Check URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && ['es', 'en', 'ro', 'hu'].includes(urlLang)) {
        return urlLang as Lang;
      }

      // Then check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['es', 'en', 'ro', 'hu'].includes(stored)) {
        return stored as Lang;
      }
    } catch {
      // Silently fall through to default
    }

    return DEFAULT_LANG;
  });

  // ─── Sync from URL on navigation/initial load ───
  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (urlLang && ['es', 'en', 'ro', 'hu'].includes(urlLang)) {
      const validLang = urlLang as Lang;
      if (validLang !== lang) {
        setLangState(validLang);
      }
    }
    // Only run on mount and when searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ─── Set html lang attribute ───
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // ─── t() lookup function ───
  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.es || key;
    },
    [lang]
  );

  // ─── switchLang — update URL, localStorage, state ───
  const switchLang = useCallback(
    (newLang: Lang) => {
      // Update state
      setLangState(newLang);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Storage not available
      }

      // Update URL — preserve current path but change ?lang=
      const params = new URLSearchParams(searchParams.toString());
      if (newLang === DEFAULT_LANG) {
        params.delete('lang');
      } else {
        params.set('lang', newLang);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl);
    },
    [router, pathname, searchParams]
  );

  const value: LanguageContextType = {
    lang,
    setLang: switchLang,
    t,
    switchLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ───

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
