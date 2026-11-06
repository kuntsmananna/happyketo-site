/**
 * Homepage copy in both languages, taken from the original site (/ and /en).
 * English: kept as on the original except obvious errors (marked "fixed").
 */
import type { Lang } from '@/i18n';

const he = {
  hero: {
    wordmark: 'HAPPY KETO',
    title: 'תזונה קטוגנית טבעית, פשוטה וטעימה',
    titleSerif: false,
    text: 'בלי שעות במטבח, בלי ספירת קלוריות ובלי לוותר על אוכל טעים!',
    cta: 'תתחילו עם 3 ימי ניסיון חינם',
    imageAlt: 'ידיים מניחות תותים על קרפ קטוגני',
  },
  challenge: {
    eyebrow: 'Going Keto',
    title: 'אתגר 4 שבועות',
    paragraphs: [
      'מעבר לתזונה קטוגנית בשיטה הדרגתית וטעימה (לא תאמינו עד כמה), אפשרית וקלה להתמדה לסופרמן וסופרוומן המג׳נגלים בין עבודה, משפחה, חוגים, נסיעות, חופשות, מסעדות, סופי שבוע, אירוח… או בקיצור… החיים.',
      'עם הנחיות פשוטות שאפשר לשלב ולתרגל ביום יום העמוס. אהה, ולא סופרים קלוריות!',
    ],
    perks: ['קיטו צעד אחרי צעד', 'מתאים לחיים האמיתיים', 'לא סופרים קלוריות'],
    cta: 'לפרטים והרשמה',
  },
  band: { title: 'אני לא עושה דיאטה,\nאני בוחרת במזון בריא', imageAlt: 'טאקו בעלי חסה במילוי עוף ואבוקדו' },
  about: {
    heading: null as string | null,
    // Line by line, with the original's line breaks.
    paragraphs: [
      'HAPPY KETO נולד מתוך חקירה ורצון למצוא את נקודת האיזון שבג׳ינגול בין העבודה, המשפחה, הילדים, קריירה, פיתוח אישי ויתר ענייני היום יום...',
      'אבל גם תזונה קטוגנית מיטיבה ואוכל טעים.',
      'להשקיע בבריאות שלנו מבלי לחכות לפנסיה או שהילדים יגדלו. אלא, עכשיו, עם העבודה, עם הילדים',
      'ועם הסל כביסה והכלים בכיור...',
      'דברים קלים והרגלים פשוטים שעושים הבדל גדול.',
    ],
    cta: 'אודות Happy Keto',
    name: 'אנה קונצמן רוזנברג',
    salmonAlt: 'סלמון ברוטב קארי וקוקוס',
    annaAlt: 'אנה קונצמן רוזנברג',
  },
  cuisine: {
    eyebrow: 'Keto Cuisine',
    title: 'ארוחה על הגג הכי יפה ביפו',
    lines: ['❤️ ארוחת טעימות ממטבח קטן ואהבה גדולה', 'אוכל טבעי ומקומי, ללא סוכר, ללא קמח ודגנים.'],
    list: ['ארועים לחברות וארגונים', 'חגיגות משפחתיות וימי הולדת', 'מסיבות רווקות', 'התפריט יותאם באופן אישי לאופי הארוע'],
    note: '(לקבוצות מעל 10 אנשים)',
    cta: 'לפרטים, צרו קשר',
    dayAlt: 'ארוחת טעימות על גג ביפו בשעות היום',
    nightAlt: 'שולחן ארוך עם נרות על הגג בערב',
  },
  // Order: right-to-left grid → Tasty Keto on the right, Happy Favorites on the left (as on the original).
  services: [
    { key: 'recipes', eyebrow: 'Tasty Keto', title: 'מתכונים דלי פחמימות שעושים שמח לגוף ולנשמה', text: 'אם אתם מודאגים שלא יהיה לכם מה לאכול, הסירו דאגה מליבכם!', cta: 'בואו נכין משהו טעים', href: '/recipes', alt: 'ביצי עין על טוסט עם ירוקים' },
    { key: 'blog', eyebrow: 'Keto Blog', title: 'מידע בנושא תזונה דלת פחמימות', text: 'כל מה שחשוב לדעת לתהליך מוצלח במעבר לתזונה טבעית קטוגנית.', cta: 'להמשך קריאה', href: '/blog', alt: 'ידיים מחזיקות עגבניות שרי' },
    { key: 'favorites', eyebrow: 'Happy Favorites', title: 'המזווה הקטוגני', text: 'ניסיתי, אהבתי, ממליצה בחום!', cta: 'מעניין מה יש שם', href: '/favorites', alt: 'שקית ממתיק אלולוז' },
  ],
  newsletter: {
    title: 'תשארו בקשר!',
    text: 'לחדשות ועדכונים נא השאירו פרטים, מבטיחה לא לחפור ;)',
    email: 'אי-מייל',
    cta: 'הצטרפות',
    success: 'איזה כיף שהצטרפת! 🎉 נתראה בתיבת המייל.',
    subject: 'הרשמה לניוזלטר – Happy Keto',
  },
  faqTitle: 'שאלות ותשובות',
};

const en: typeof he = {
  hero: {
    wordmark: 'EASY HAPPY KETO',
    title: 'Mediterranean Keto Diet',
    titleSerif: true,
    text: 'Start Your Keto Journey Without the Guesswork - Simple, Tasty, and Sustainable',
    cta: 'Three days free trial',
    imageAlt: 'Hands placing strawberries on a keto crêpe',
  },
  challenge: {
    eyebrow: 'Going Keto',
    title: '4 Weeks. No Counting. Total Freedom.',
    paragraphs: [
      'Life doesn’t slow down, and your nutrition shouldn’t hold you back. Whether you’re navigating boardrooms, classrooms, or family vacations, our 4-Week Challenge is designed to fit into the cracks of your busy schedule.',
      'We’ve swapped the "diet" headaches for simple, actionable instructions that slide right into your daily routine. No obsessing over labels, no hunger pangs—just incredible food and more energy than you’ll know what to do with.',
    ],
    perks: ['Built for the Modern Superhero', 'No Calorie Counting', 'No Boring Meals'],
    cta: 'Start My Transformation',
  },
  band: { title: 'I’m not dieting,\nI am choosing to be healthy.', imageAlt: 'Lettuce tacos filled with chicken and avocado' },
  about: {
    heading: 'Why HAPPY KETO? Because Life Happens.',
    paragraphs: [
      'HAPPY KETO wasn’t born in a sterile lab; it was born in the middle of a busy kitchen, somewhere between a career deadline and a mountain of laundry.',
      'I believe you shouldn’t have to wait for retirement or for the kids to grow up to finally feel like the best version of yourself. Your health shouldn’t be "on hold" until the dishes are done. I’ve created this 4-week blueprint to prove that you can achieve elite energy and metabolic health while managing the chaos of everyday life.',
      'It’s about simple habits, delicious food, and finding the perfect balance between your personal development and the reality of a sink full of dishes.',
    ],
    cta: 'About Happy Keto',
    name: 'Anna Kuntsman Rosenberg',
    salmonAlt: 'Coconut Thai salmon curry',
    annaAlt: 'Anna Kuntsman Rosenberg',
  },
  cuisine: {
    eyebrow: 'Keto Cuisine',
    title: 'The most beautiful rooftop meal in Jaffa',
    lines: ['❤️ A delicious meal from a small kitchen and great love', 'Natural and local food, no sugar, no flour and no grains.'],
    list: ['Events for companies and organizations', 'Family celebrations and birthdays', 'Bachelorette parties', 'The menu will be personally tailored to the nature of the event.'],
    note: '(For groups over 10 people)',
    cta: 'For details, contact us',
    dayAlt: 'A tasting dinner on a Jaffa rooftop in daylight',
    nightAlt: 'A long candle-lit table on the rooftop at night',
  },
  services: [
    { key: 'favorites', eyebrow: 'Happy Favorites', title: 'The Ketogenic Pantry', text: 'I tried it, I loved it, I highly recommend it!', cta: 'I wonder what’s in there', href: '/en/favorites', alt: 'A bag of allulose sweetener' },
    { key: 'blog', eyebrow: 'Keto Blog', title: 'Information on low-carb diets', text: 'Everything you need to know for a successful transition to a natural ketogenic diet. (In Hebrew)', cta: 'Continue reading', href: '/blog', alt: 'Hands holding cherry tomatoes' },
    { key: 'recipes', eyebrow: 'Tasty Keto', title: 'Low-carb recipes that make the body and soul happy', text: 'If you are worried that you will not have anything to eat, remove worry from your heart! (In Hebrew)', cta: 'Let’s make something delicious', href: '/recipes', alt: 'Fried eggs on toast with greens' },
  ],
  newsletter: {
    title: 'Stay in touch!',
    // fixed: original "I promise not to dig" (a literal translation of the Hebrew idiom)
    text: 'For news and updates, leave your email – I promise not to spam you ;)',
    email: 'Email',
    cta: 'Join',
    success: 'So glad you joined! 🎉 See you in your inbox.',
    subject: 'Newsletter sign-up (EN) – Happy Keto',
  },
  faqTitle: 'Q&A',
};

export const homeCopy = { he, en } as const;
export const homeFor = (lang: Lang) => homeCopy[lang];
