/**
 * Two languages: Hebrew (default, at the root, RTL) and English (under /en, LTR).
 * Only some pages exist in English; recipes and blog posts are Hebrew-only (as on the original site).
 */
export type Lang = 'he' | 'en';

export const getLang = (url: URL): Lang => (/^\/en(\/|$)/.test(url.pathname) ? 'en' : 'he');
export const dirOf = (lang: Lang) => (lang === 'he' ? 'rtl' : 'ltr');
export const localeOf = (lang: Lang) => (lang === 'he' ? 'he_IL' : 'en_US');

/** Pages that exist in both languages (Hebrew path → English path). */
const PAIRS: Record<string, string> = {
  '/': '/en',
  '/about': '/en/about',
  '/contact': '/en/contact',
  '/challenge': '/en/challenge',
  '/favorites': '/en/favorites',
  '/privacy': '/en/privacy',
  '/accessibility': '/en/accessibility',
  '/thanks': '/en/thanks',
};
const REVERSE = Object.fromEntries(Object.entries(PAIRS).map(([he, en]) => [en, he]));

/** Path of a bilingual page in the given language ("/about" → "/en/about"). */
export const localized = (hePath: string, lang: Lang) => (lang === 'en' ? (PAIRS[hePath] ?? hePath) : hePath);

/** The same page in each language, when it exists (for hreflang and the language switch). */
export function alternates(pathname: string): Partial<Record<Lang, string>> {
  const p = pathname.replace(/\/$/, '') || '/';
  if (PAIRS[p]) return { he: p, en: PAIRS[p] };
  if (REVERSE[p]) return { he: REVERSE[p], en: p };
  return { he: p };
}
