# Wix → Astro content migration (stage 2)

Source: `https://www.happyketoforme.com/blog-posts-sitemap.xml`. Regenerate with `npm run scrape` (see `scripts/scrape/index.mjs`).

## Result

| | |
| --- | --- |
| Posts migrated | **127** (110 recipes → `src/content/recipes/`, 17 articles → `src/content/blog/`) |
| Recipes with structured ingredients / steps | 106 / 105 |
| Images | 162 downloaded (max 1280px) → `src/assets/posts/`, 0 failures |
| Videos | 2 animated GIF covers → looping MP4, 1 Wix video → `public/videos/`, 5 YouTube → `youtube-nocookie` embeds |
| Internal links | All `/post/...` links rewritten to `/recipes/...` or `/blog/...` |
| Redirect map | `src/data/wix-redirects.json` (old `/post/<slug>` → new path), used in stage 5 |
| Text check | `npm run scrape:verify`: every paragraph, heading and list item of the original is present (1 false positive: text inside a long link in the Paleo article) |

Recipes per category (a recipe can be in several): קינוחים 32 · מאפים 40 · ירקות 22 · בשר 15 · פליאו 10 · דגים 9 · ממרחים ורטבים 8 · משקאות 3 · מרקים 2 · ביצים 2.

## Mapping decisions

- Wix category `low-carb` is titled "מתכוני פליאו" → **paleo**; `low-carb-1` is "המדריך לפליאו" → articles.
- Articles: posts whose categories are only `בלוג-קטוגני`, `מדריך-לקיטו`, `המדריך-לתזונה-דלת-פחמימות`, `low-carb-1`. Their category names are kept as `tags`.
- `lunch-box` is kept as a recipe tag.
- Generic headings ("מצרכים", "אופן ההכנה" and their variants) are not kept in the body; the page template shows its own labels.
- Body headings are h2/h3 (the page title is the only h1).

## Worth a look by Anna

| Post | Note |
| --- | --- |
| `cinnabonrecipe`, `שבלולי-שוקולד` | Ingredients and steps were mixed freely in the original, so they were structured by hand in `scripts/scrape/overrides.mjs` (wording kept, steps lightly reorganised). |
| `פילה-עוף-עם-פטריות-מנגולד-בקרם-קוקוס` | The original post has ingredients only, with no preparation steps. |
| `bulletproofcoffee`, `תותים-עם-קצפת`, `בולט-שוקו`, `צ-אי-ריחני-ומנחם-לימי-החורף` | Short prose recipes; shown as text, without structured ingredients/steps. |
| `חטיף-טוויקס-קטוגני` | Many sub-sections (base, caramel, coating); parsed correctly, just long. |
| Categories | `prepTime` is only set where the post states it (2 recipes). |

## Editing after migration

`npm run scrape` never overwrites an existing `.md` file unless run with `--force`, so hand edits to posts are safe.
