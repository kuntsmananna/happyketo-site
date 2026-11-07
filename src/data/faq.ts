/** FAQ (from the original homepage): src/data/content/faq.{he,en}.json, editable in the admin panel. */
import type { Lang } from '@/i18n';
import { faqContent } from './content';

export const faqFor = (lang: Lang) => faqContent(lang);
