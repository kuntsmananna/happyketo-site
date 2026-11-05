export const site = {
  name: 'Happy Keto',
  title: 'Happy Keto | תזונה קטוגנית טבעית, פשוטה וטעימה',
  description:
    'Happy Keto – תוכניות ליווי לתזונה קטוגנית טבעית וטעימה, מתכונים דלי פחמימות ומידע על מעבר לקיטו. בלי שעות במטבח ובלי ספירת קלוריות.',
  url: 'https://www.happyketoforme.com',
  locale: 'he_IL',
  author: 'אנה קונצמן רוזנברג',
  contact: {
    phone: '054-6517951',
    phoneHref: 'tel:+972546517951',
    whatsappHref: 'https://wa.me/972546517951',
    email: 'kuntsman.anna@gmail.com',
    location: 'יפו, תל אביב',
  },
  social: [{ label: 'Instagram', handle: '@happyketoforme', href: 'https://www.instagram.com/happyketoforme/' }],
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

export type NavItem = { label: string; href: string; children?: NavItem[] };

/** Mirrors the original Wix menu. */
export const nav: NavItem[] = [
  { label: 'עמוד הבית', href: '/' },
  { label: 'אתגר קיטו', href: '/challenge' },
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
