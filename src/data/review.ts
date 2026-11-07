/**
 * Review parts – the one list of what a Claude change can touch (see "Content changes need Anna's review" in
 * CLAUDE.md). The content schema, the visible/invisible rule and the labels all come from here; .pages.yml repeats
 * the values and labels (it can't import TS) and scripts/check-dist.mjs fails the build if they drift apart.
 * visible = marked purple on the page and tagged on tiles; invisible = shown as text in the review box and table.
 */
export const REVIEW_PARTS = {
  image: { label: 'תמונה', visible: true },
  ingredients: { label: 'מצרכים', visible: true },
  instructions: { label: 'אופן ההכנה', visible: true },
  text: { label: 'טקסט', visible: true },
  description: { label: 'תיאור לגוגל', visible: false },
  imageAlt: { label: 'תיאור התמונה הראשית', visible: false },
  bodyAlts: { label: 'תיאורי התמונות בטקסט', visible: false },
} as const;

export type ReviewPart = keyof typeof REVIEW_PARTS;
export const reviewPartSlugs = Object.keys(REVIEW_PARTS) as [ReviewPart, ...ReviewPart[]];
export type InvisiblePart = { [K in ReviewPart]: (typeof REVIEW_PARTS)[K]['visible'] extends false ? K : never }[ReviewPart];
export const isVisiblePart = (p: ReviewPart) => REVIEW_PARTS[p].visible;
export const isInvisiblePart = (p: ReviewPart): p is InvisiblePart => !REVIEW_PARTS[p].visible;
export const reviewPartLabel = (p: ReviewPart) => REVIEW_PARTS[p].label;
