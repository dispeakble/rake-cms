// ============================================================
//  i18n/index.ts — Re-exports for the i18n system
// ============================================================

export type { Lang } from './translations';
export { translations } from './translations';
export { LanguageProvider, useLanguage } from './LanguageProvider';
export { languages } from './LanguageProvider';
export type { LanguageInfo, LanguageContextType } from './LanguageProvider';
