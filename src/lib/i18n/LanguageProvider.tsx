// ============================================================
//  LanguageProvider.tsx — React Context for i18n
//  URL-based language routing via path (/en, /es) with pushState
//  Falls back to ?lang= query param for the admin app
//  Persists to localStorage
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
  availableLangs: Lang[];
}

// ─── Language Definitions ───

export const languages: LanguageInfo[] = [
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'ro', label: 'RO', flag: '🇷🇴', name: 'Română' },
  { code: 'hu', label: 'HU', flag: '🇭🇺', name: 'Magyar' },
];

const DEFAULT_LANG: Lang = 'es';
const STORAGE_KEY = 'rake-cms-lang';
const VALID_LANGS: Lang[] = ['es', 'en', 'ro', 'hu'];

/**
 * Detect language code from a URL pathname.
 * Returns null if no language prefix found.
 */
function detectLangFromPath(pathname: string): Lang | null {
  // Match /en, /es, /ro, /hu at start of path
  const match = pathname.match(/^\/(en|es|ro|hu)(?:\/|$)/);
  if (match) {
    const code = match[1] as Lang;
    if (VALID_LANGS.includes(code)) return code;
  }
  return null;
}

// ─── Context ───

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ───

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from: URL path > URL param > localStorage > default
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;

    try {
      // 1. Check URL path first (/en, /es, etc.)
      const pathLang = detectLangFromPath(window.location.pathname);
      if (pathLang) return pathLang;

      // 2. Check URL params (?lang=en)
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (VALID_LANGS as string[]).includes(urlLang)) {
        return urlLang as Lang;
      }

      // 3. Then check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (VALID_LANGS as string[]).includes(stored)) {
        return stored as Lang;
      }
    } catch {
      // Silently fall through to default
    }

    return DEFAULT_LANG;
  });

  // ─── Sync from URL on navigation/initial load ───
  useEffect(() => {
    // Check pathname first
    const pathLang = detectLangFromPath(pathname);
    if (pathLang && pathLang !== lang) {
      setLangState(pathLang);
      return;
    }

    // Fall back to ?lang= query param
    const urlLang = searchParams.get('lang');
    if (urlLang && (VALID_LANGS as string[]).includes(urlLang)) {
      const validLang = urlLang as Lang;
      if (validLang !== lang) {
        setLangState(validLang);
      }
    }
    // Only run on mount and when pathname/searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // ─── Listen for popstate (back/forward navigation) ───
  useEffect(() => {
    const handlePopState = () => {
      const pathLang = detectLangFromPath(window.location.pathname);
      if (pathLang && pathLang !== lang) {
        setLangState(pathLang);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

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

  // ─── switchLang — update URL via pushState, localStorage, state ───
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

      // Update URL path via pushState (no full page reload)
      const newPath = newLang === DEFAULT_LANG ? '/' : `/${newLang}`;
      window.history.pushState({}, '', newPath);

      // Show/hide sections by data-lang if they exist
      document.querySelectorAll('[data-lang]').forEach(el => {
        (el as HTMLElement).style.display =
          el.getAttribute('data-lang') === newLang ? '' : 'none';
      });
    },
    []
  );

  const value: LanguageContextType = {
    lang,
    setLang: switchLang,
    t,
    switchLang,
    availableLangs: VALID_LANGS,
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
