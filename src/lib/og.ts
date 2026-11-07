/**
 * Branded share images (public/og, rendered by scripts/og/render-og.mjs and the og-images workflow).
 * A card is used only when it was rendered for the entry's current title and image (same key as the script);
 * otherwise callers fall back to the plain cover photo until the workflow re-renders it.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import manifest from '../../public/og/manifest.json';
import type { Post, Recipe } from './recipes';

const TEMPLATE_VERSION = '1'; // keep in sync with scripts/og/render-og.mjs
const cards = manifest as Record<string, { file: string; key: string }>;

export function ogCardFor(entry: Recipe | Post): string | undefined {
  const card = cards[`${entry.collection}/${entry.id}`];
  if (!card || !entry.filePath) return undefined;
  const fm = readFileSync(entry.filePath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const image = fm.match(/^image:\s*"?([^"\n]*?)"?\s*$/m)?.[1] || '';
  const key = createHash('sha1').update(`${TEMPLATE_VERSION}|${entry.data.title}|${image}`).digest('hex').slice(0, 16);
  return key === card.key ? `/og/${card.file}` : undefined;
}
