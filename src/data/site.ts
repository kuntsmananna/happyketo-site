import { contactContent } from './content';

/** 054-6517951 → 972546517951 (international form for tel: and WhatsApp links). */
const intlPhone = `972${contactContent.phone.replace(/\D/g, '').replace(/^0/, '')}`;

export const site = {
  name: 'Happy Keto',
  title: 'Happy Keto | תזונה קטוגנית טבעית, פשוטה וטעימה',
  description:
    'Happy Keto – תוכניות ליווי לתזונה קטוגנית טבעית וטעימה, מתכונים דלי פחמימות ומידע על מעבר לקיטו. בלי שעות במטבח ובלי ספירת קלוריות.',
  url: 'https://www.happyketoforme.com',
  locale: 'he_IL',
  author: 'אנה קונצמן רוזנברג',
  // Phone, email and Instagram come from src/data/content/contact.json (editable in the admin panel).
  contact: {
    phone: contactContent.phone,
    phoneHref: `tel:+${intlPhone}`,
    whatsappHref: `https://wa.me/${intlPhone}`,
    email: contactContent.email,
    location: contactContent.location,
  },
  social: [{ label: 'Instagram', handle: contactContent.instagramHandle, href: contactContent.instagramUrl }],
  /** Google Search Console ownership (HTML-tag method, the same token the Wix site used) – keep it so verification survives the move. */
  googleSiteVerification: 'FiG60y_2awlNHNWauFG0RQBsbZ19NvhXdALHu-nPQzQ',
  healthDisclaimer: 'אתר זה הוא למידע בלבד ואין לראות בו ייעוץ רפואי.',
} as const;

/**
 * Web3Forms (https://web3forms.com). The access key is public by design (it is sent
 * from the browser), so it is safe to commit. PUBLIC_WEB3FORMS_KEY overrides it.
 */
export const forms = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.PUBLIC_WEB3FORMS_KEY || 'cd1ca8aa-feae-486b-816e-7182af47e400',
} as const;

import type { Lang } from '@/i18n';

/**
 * `cta`: shown as the header's call-to-action button instead of a plain link.
 * `hreflang`: set when the target page is in the other language (English menu → Hebrew recipes).
 */
export type NavItem = { label: string; href: string; cta?: boolean; hreflang?: Lang; children?: NavItem[] };

/** Mirrors the original Wix menu. */
export const nav: NavItem[] = [
  { label: 'עמוד הבית', href: '/' },
  { label: 'אתגר קיטו', href: '/challenge', cta: true },
  {
    label: 'מתכונים',
    href: '/recipes',
    children: [
      { label: 'מתכוני פליאו', href: '/recipes/category/paleo' },
      { label: 'מאפים', href: '/recipes/category/pastry' },
      { label: 'משקאות', href: '/recipes/category/drinks' },
      { label: 'מתכוני בשר', href: '/recipes/category/meat' },
      { label: 'מתכוני דגים', href: '/recipes/category/fish' },
      { label: 'מרקים', href: '/recipes/category/soups' },
      { label: 'מתכוני ביצים', href: '/recipes/category/eggs' },
      { label: 'מתכוני ירקות', href: '/recipes/category/vegetables' },
      { label: 'קינוחים', href: '/recipes/category/desserts' },
      { label: 'ממרחים ורטבים', href: '/recipes/category/spreads' },
    ],
  },
  { label: 'מוצרים מומלצים', href: '/favorites' },
  { label: 'בלוג דל פחמימות', href: '/blog' },
  { label: 'אודות', href: '/about' },
  { label: 'יצירת קשר', href: '/contact' },
];

/** English menu, mirroring the original /en menu. Recipes and the blog exist in Hebrew only. */
export const navEn: NavItem[] = [
  { label: 'Home', href: '/en' },
  { label: 'Keto challenge', href: '/en/challenge', cta: true },
  {
    label: 'Recipes',
    href: '/recipes',
    hreflang: 'he',
    children: [
      { label: 'Paleo recipes', href: '/recipes/category/paleo', hreflang: 'he' },
      { label: 'Pastries', href: '/recipes/category/pastry', hreflang: 'he' },
      { label: 'Drinks', href: '/recipes/category/drinks', hreflang: 'he' },
      { label: 'Meat recipes', href: '/recipes/category/meat', hreflang: 'he' },
      { label: 'Fish recipes', href: '/recipes/category/fish', hreflang: 'he' },
      { label: 'Soups', href: '/recipes/category/soups', hreflang: 'he' },
      { label: 'Egg recipes', href: '/recipes/category/eggs', hreflang: 'he' },
      { label: 'Vegetable recipes', href: '/recipes/category/vegetables', hreflang: 'he' },
      { label: 'Desserts', href: '/recipes/category/desserts', hreflang: 'he' },
      { label: 'Spreads and sauces', href: '/recipes/category/spreads', hreflang: 'he' },
    ],
  },
  { label: 'Recommended products', href: '/en/favorites' },
  { label: 'Low Carb Blog', href: '/blog', hreflang: 'he' },
  { label: 'About', href: '/en/about' },
  { label: 'Contact us', href: '/en/contact' },
];

export const navFor = (lang: Lang) => (lang === 'en' ? navEn : nav);
