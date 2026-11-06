/** Shared UI strings (header, footer, badge, forms). Page copy lives in src/data/*. */
import type { Lang } from './index';

export const ui = {
  he: {
    skip: 'דילוג לתוכן הראשי',
    home: 'עמוד הבית',
    homeLabel: 'Happy Keto – לעמוד הבית',
    nav: 'ניווט ראשי',
    menuOpen: 'פתיחת תפריט',
    menuClose: 'סגירת תפריט',
    menu: 'תפריט',
    recipesLink: 'מתכונים',
    submenu: 'תת-תפריט',
    langSwitch: { label: 'English', short: 'EN', hidden: ' · English' },
    joinChallenge: 'הצטרפו לאתגר 4 השבועות',
    footer: {
      call: 'Call',
      email: 'Email',
      follow: 'Follow',
      phoneSuffix: '- אנה',
      privacy: 'מדיניות פרטיות (Privacy Policy)',
      disclaimer: 'אתר זה הוא למידע בלבד ואין לראות בו ייעוץ רפואי',
      links: 'קישורים',
    },
    badge: { title: 'Keto Kickstart', text: 'שלושה ימי נסיון חינם', close: 'הסתרת ההודעה' },
    form: {
      sending: 'שולח…',
      success: 'תודה! הפרטים התקבלו ואחזור אליכם בהקדם ❤️',
      error: 'אופס, משהו השתבש. אפשר לנסות שוב או לכתוב לי ישירות במייל או בוואטסאפ.',
      fromName: 'Happy Keto – אתר',
    },
  },
  en: {
    skip: 'Skip to main content',
    home: 'Home',
    homeLabel: 'Happy Keto – home page',
    nav: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    menu: 'Menu',
    recipesLink: 'Recipes',
    submenu: 'Submenu',
    langSwitch: { label: 'עברית', short: 'עב', hidden: ' · עברית' },
    joinChallenge: 'Join the 4-week challenge',
    footer: {
      call: 'Call',
      email: 'Email',
      follow: 'Follow',
      phoneSuffix: '- Anna',
      privacy: 'Privacy Policy',
      disclaimer: 'This website is for informational purposes only and should not be considered medical advice',
      links: 'Links',
    },
    badge: { title: 'Keto Kickstart', text: 'Three days free trial', close: 'Hide this message' },
    form: {
      sending: 'Sending…',
      success: 'Thank you! Your details were received and I’ll get back to you soon ❤️',
      error: 'Oops, something went wrong. Please try again, or email / WhatsApp me directly.',
      fromName: 'Happy Keto – website',
    },
  },
} as const;

export const t = (lang: Lang) => ui[lang];
