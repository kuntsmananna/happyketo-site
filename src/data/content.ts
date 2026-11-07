/**
 * Editable site copy (homepage, FAQ, About, Challenge, pantry, contact details) lives in JSON files in
 * src/data/content/ so the Pages CMS admin panel (.pages.yml) can edit it. Every file is validated here at build
 * time: a broken edit fails the build with a clear message, and Vercel keeps the current site online.
 */
import { z } from 'astro/zod';
import type { Lang } from '@/i18n';
import homeHe from './content/home.he.json';
import homeEn from './content/home.en.json';
import faqHe from './content/faq.he.json';
import faqEn from './content/faq.en.json';
import aboutHe from './content/about.he.json';
import aboutEn from './content/about.en.json';
import challengeHe from './content/challenge.he.json';
import challengeEn from './content/challenge.en.json';
import favoritesJson from './content/favorites.json';
import contactJson from './content/contact.json';

const text = z.string().trim().min(1);
const lines = z.array(text).min(1);

const homeSchema = z.object({
  hero: z.object({ wordmark: text, title: text, titleSerif: z.boolean().default(false), text: text, cta: text, imageAlt: text }),
  challenge: z.object({ eyebrow: text, title: text, paragraphs: lines, perks: lines, cta: text }),
  band: z.object({ title: text, imageAlt: text }),
  about: z.object({ heading: z.string().nullish(), paragraphs: lines, cta: text, name: text, salmonAlt: text, annaAlt: text }),
  cuisine: z.object({ eyebrow: text, title: text, lines: lines, list: lines, note: text, cta: text, dayAlt: text, nightAlt: text }),
  services: z
    .array(z.object({ key: z.enum(['recipes', 'blog', 'favorites']), eyebrow: text, title: text, text: text, cta: text, href: text, alt: text }))
    .length(3),
  latest: z.object({ eyebrow: text, title: text, note: z.string().default(''), cta: text }),
  newsletter: z.object({ title: text, text: text, email: text, cta: text, success: text, subject: text }),
  faqTitle: text,
});

const faqSchema = z.array(z.object({ q: text, a: lines })).min(1);

const aboutSchema = z.object({
  name: text,
  jobTitle: text,
  /** Groups of lines; a blank line separates groups (as on the original). Intro comes before the photos. */
  introGroups: z.array(z.object({ lines })).min(1),
  storyGroups: z.array(z.object({ lines })).min(1),
  disclosureTitle: text,
  disclosure: lines,
  welcome: text,
  medical: lines,
  sign: text,
  plateAlt: text,
  steakAlt: text,
  selfieAlt: text,
});

const challengeSchema = z.object({
  title: text,
  intro: text,
  /** `id` links a plan to its photo and form option (free / full) – not editable. */
  /** `title` = the program name (Latin, shown isolated so Hebrew around it can't reorder it); `subtitle` = description. */
  plans: z.tuple([
    z.object({ id: z.literal('free'), title: text, subtitle: text, price: text, alt: text }),
    z.object({ id: z.literal('full'), title: text, subtitle: text, price: text, alt: text }),
  ]),
  join: text,
  programLead: text,
  method: lines,
  expectTitle: text,
  expect: lines,
  howTitle: text,
  how: text,
  programJoin: text,
  registerTitle: text,
  registerText: text,
});

const favoritesSchema = z
  .array(
    z.object({
      name: text,
      /** Path as stored by the admin panel: /src/assets/favorites/<file> */
      image: z.string().regex(/^\/src\/assets\/favorites\/[^/]+\.(webp|jpe?g|png|avif)$/i, 'pick a photo from the pantry photos folder'),
      ingredients: text,
      note: z.string().optional(),
      href: z.url(),
    }),
  )
  .min(1);

const contactSchema = z.object({
  phone: z.string().regex(/^0\d{1,2}-?\d{7}$/, 'Israeli phone number like 054-6517951'),
  email: z.email(),
  location: text,
  instagramHandle: z.string().regex(/^@[\w.]+$/, 'like @happyketoforme'),
  instagramUrl: z.url(),
});

/** Parse one file; on failure name the file and the field so the build log says what to fix. */
function load<T extends z.ZodType>(schema: T, data: unknown, file: string): z.output<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `  - ${i.path.join('.') || '(file)'}: ${i.message}`).join('\n');
    throw new Error(`Invalid content in src/data/content/${file}:\n${issues}`);
  }
  return r.data;
}

const byLang = <T>(he: T, en: T) => (lang: Lang) => (lang === 'en' ? en : he);

export type HomeCopy = z.output<typeof homeSchema>;
export const homeContent = byLang(load(homeSchema, homeHe, 'home.he.json'), load(homeSchema, homeEn, 'home.en.json'));
export const faqContent = byLang(load(faqSchema, faqHe, 'faq.he.json'), load(faqSchema, faqEn, 'faq.en.json'));
export const aboutContent = byLang(load(aboutSchema, aboutHe, 'about.he.json'), load(aboutSchema, aboutEn, 'about.en.json'));
export const challengeContent = byLang(load(challengeSchema, challengeHe, 'challenge.he.json'), load(challengeSchema, challengeEn, 'challenge.en.json'));
export const favoritesContent = load(favoritesSchema, favoritesJson, 'favorites.json');
export const contactContent = load(contactSchema, contactJson, 'contact.json');
