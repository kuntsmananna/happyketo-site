# העברת happyketoforme.com לאתר החדש – יום ההחלפה

מצב נוכחי (נבדק 7.11.2026):
- הדומיין רשום ב-**Wix** (עד 20.10.2027), וה-DNS מנוהל ב-Wix (nameservers ‏ns0/ns1.wixdns.net).
- אין בדומיין רשומות מייל (MX) או רשומות TXT – **ההחלפה לא נוגעת במייל** (המייל שלך ב-Gmail).
- כרגע: `happyketoforme.com` → מפנה ל-`www.happyketoforme.com`, ששם יושב האתר. נשמור על אותו מבנה.
- כל 166 הכתובות במפת האתר של Wix נבדקו מול האתר החדש – כולן מגיעות לעמוד הנכון.
- תג האימות של Google Search Console שהיה ב-Wix הועתק לאתר החדש, כך שהבעלות בגוגל לא תיפול.

משך: כרבע שעה עבודה. השינוי מתפשט בדרך כלל תוך שעה (לפעמים עד 48 שעות). בזמן הזה חלק מהגולשים יראו עוד את Wix – זה תקין.

## לפני (אפשר כבר עכשיו, לא משנה כלום באתר החי)

1. **לייצא מ-Wix** את רשימת אנשי הקשר והנרשמים לניוזלטר ואת הגשות הטפסים (Wix ← אנשי קשר ← ייצוא).
2. **Web3Forms** מוגדר ונבדק (3 שליחות בדיקה הגיעו למייל).

## ביום ההחלפה

### שלב 1 – Vercel (להוסיף את הדומיין לפרויקט)
1. vercel.com ← הצוות gambits ← הפרויקט **happyketo-site** ← Settings ← **Domains**.
2. להוסיף `www.happyketoforme.com`.
3. להוסיף `happyketoforme.com` ולבחור **Redirect to www.happyketoforme.com**.
4. Vercel יציג "Invalid Configuration" ואת הערכים לרשומות. זה צפוי – עוד לא שינינו את ה-DNS.

### שלב 2 – Wix (לכוון את הדומיין ל-Vercel)
1. [Wix ← Domains](https://manage.wix.com/account/domains) ← שלוש הנקודות ליד happyketoforme.com ← **Manage DNS Records**.
2. **A (Host)**:
   - להוסיף רשומה: Host Name ריק (= @), Value = כתובת ה-IP ש-Vercel מציג (נכון להיום: `216.198.79.1`).
   - **למחוק** את 3 הרשומות הישנות של Wix: `185.230.63.186`, `185.230.63.171`, `185.230.63.107`.
3. **CNAME (Aliases)**:
   - לערוך את הרשומה של `www`: להחליף את `cdn3.wixdns.net` בערך ש-Vercel מציג (נכון להיום: `5a942cfc65f4d57e.vercel-dns-017.com`, או הכללי `cname.vercel-dns.com`).
4. לשמור ← Save Changes.

אם Wix לא מאפשר לערוך את הרשומות כל עוד הדומיין מחובר לאתר ה-Wix – קודם לנתק את הדומיין מהאתר (Domains ← הדומיין ← Disconnect from site) ואז לערוך.

### שלב 3 – בדיקה (לבקש מ-Claude: "החלפתי DNS, תבדוק")
Claude יבדוק: שה-DNS מצביע ל-Vercel, שיש תעודת HTTPS, ש-happyketoforme.com מפנה ל-www, שכל העמודים וכל 290 הכתובות הישנות עובדים, ושהטפסים שולחים.
ב-Vercel ← Domains שני הדומיינים צריכים להפוך ל-"Valid Configuration".

### שלב 4 – Google (אחרי שהאתר החדש עולה)
1. [Google Search Console](https://search.google.com/search-console) ← הנכס של happyketoforme.com (האימות נשמר).
2. Sitemaps ← להגיש: `https://www.happyketoforme.com/sitemap-index.xml` (ולהסיר את מפות האתר הישנות של Wix אם מופיעות).
3. לבדוק אחרי כמה ימים ב-"Pages" שאין שגיאות.

## אחרי שבוע–שבועיים

- כשהכל יציב: אפשר **לבטל את חבילת הפרימיום של Wix** (האתר). **לא** לבטל את מינוי הדומיין – הדומיין נשאר רשום ב-Wix ויתחדש באוקטובר 2027. לבדוק ב-Wix ← Subscriptions שהדומיין מחודש בנפרד מהחבילה.
- לפני הביטול: לוודא שהייצוא מ-Wix נשמר.
- בעתיד (לא חובה): אפשר להעביר את רישום הדומיין מ-Wix לרשם אחר.

## חזרה אחורה (אם משהו לא בסדר)
להחזיר ב-Wix את 3 רשומות ה-A הישנות ואת ה-CNAME של www ל-`cdn3.wixdns.net`. כל עוד חבילת Wix פעילה, האתר הישן חוזר.
