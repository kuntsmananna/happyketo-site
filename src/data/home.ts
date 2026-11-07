/**
 * Homepage copy in both languages (from the original site; English mistranslations fixed).
 * The text lives in src/data/content/home.{he,en}.json (editable in the admin panel) and is validated in content.ts.
 */
import type { Lang } from '@/i18n';
import { homeContent, type HomeCopy } from './content';

export type { HomeCopy };
export const homeFor = (lang: Lang): HomeCopy => homeContent(lang);
