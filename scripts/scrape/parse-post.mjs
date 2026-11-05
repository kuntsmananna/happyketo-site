// Parse one Wix blog post page into a neutral structure (blocks + metadata).
import * as cheerio from 'cheerio';

const clean = (s = '') =>
  s
    .replace(/ /g, ' ')
    .replace(/[​-‍﻿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Wix media URI ("cfc025_abc~mv2.jpg") from any static.wixstatic.com URL. */
export function wixUri(url = '') {
  const m = url.match(/static\.wixstatic\.com\/media\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Simplified inline HTML of an element: keeps strong/em/a/br, drops Wix wrappers.
 * Links are kept with their original href (rewritten later).
 */
function inlineHtml($, el) {
  let out = '';
  $(el)
    .contents()
    .each((_, node) => {
      if (node.type === 'text') {
        out += escapeHtml(node.data);
        return;
      }
      if (node.type !== 'tag') return;
      const tag = node.tagName.toLowerCase();
      const inner = inlineHtml($, node);
      if (tag === 'br') out += '<br>';
      else if (tag === 'strong' || tag === 'b') out += inner.trim() ? `<strong>${inner}</strong>` : inner;
      else if (tag === 'em' || tag === 'i') out += inner.trim() ? `<em>${inner}</em>` : inner;
      else if (tag === 'a') {
        const href = $(node).attr('href');
        out += href ? `<a href="${escapeHtml(href)}">${inner}</a>` : inner;
      } else out += inner;
    });
  return out;
}

const textOf = ($, el) => clean($(el).text());

/** True when every non-empty text in the element is inside <strong>. */
function isBoldOnly($, el) {
  const all = textOf($, el);
  if (!all) return false;
  const bold = clean($(el).find('strong, b').text());
  return bold.length >= all.length - 1;
}

/** List items; a nested sub-list is folded into its parent item ("לערבב בקערה: חמאה, ביצים, …"). */
function listItems($, listEl) {
  return $(listEl)
    .children('li')
    .map((_, li) => {
      const own = $(li).children(':not(ul):not(ol)');
      const nested = $(li).children('ul, ol').first();
      let html = own.map((_, el) => inlineHtml($, el).trim()).get().filter(Boolean).join('<br>');
      let text = own.map((_, el) => textOf($, el)).get().filter(Boolean).join(' ');
      if (nested.length) {
        const sub = listItems($, nested);
        const sep = /:\s*$/.test(text) ? ' ' : text ? ': ' : '';
        text += sep + sub.map((i) => i.text).join(', ');
        html += sep + sub.map((i) => i.html).join(', ');
      }
      return { html: html.trim(), text: clean(text), level: Number($(li).attr('aria-level') || 1) };
    })
    .get()
    .filter((i) => i.text);
}

/**
 * @returns {{
 *   url: string, slug: string, title: string, description: string,
 *   datePublished?: string, dateModified?: string, coverUri: string | null,
 *   wixCategories: string[], blocks: any[]
 * }}
 */
export function parsePost(html, url) {
  const $ = cheerio.load(html);
  const slug = decodeURIComponent(new URL(url).pathname.replace(/^\/post\//, ''));

  // --- metadata from JSON-LD (BlogPosting) + meta tags
  let ld = {};
  $('script[type="application/ld+json"]').each((_, s) => {
    try {
      const data = JSON.parse($(s).text());
      for (const d of [data].flat()) if (d['@type'] === 'BlogPosting') ld = d;
    } catch {}
  });
  const title = clean(ld.headline || $('meta[property="og:title"]').attr('content') || $('h1').first().text());
  const ogDescription = clean($('meta[property="og:description"]').attr('content') || '');
  const coverUri = wixUri(ld.image?.url || $('meta[property="og:image"]').attr('content') || '');

  const wixCategories = [
    ...new Set(
      $('a[href*="/recipes/categories/"]')
        .map((_, a) => decodeURIComponent($(a).attr('href').split('/recipes/categories/')[1] || ''))
        .get()
        .filter(Boolean),
    ),
  ];

  // --- body blocks. Each content block is followed by a marker <div data-hook="rcv-blockN" type="...">.
  const viewer = $('[data-hook="post-description"] [data-id="content-viewer"]').first();
  const blocks = [];
  viewer.find('[data-hook^="rcv-block"]').each((_, marker) => {
    const type = $(marker).attr('type');
    const el = $(marker).prev();
    if (!el.length) return;
    switch (type) {
      case 'paragraph': {
        const p = el.find('p, [data-ricos-paragraph]').first();
        const text = textOf($, p);
        if (text) blocks.push({ type: 'p', html: inlineHtml($, p).trim(), text, bold: isBoldOnly($, p) });
        break;
      }
      case 'heading': {
        const h = el.find('h1, h2, h3, h4, h5, h6').first();
        const text = textOf($, h);
        if (text) blocks.push({ type: 'h', level: Number(h[0].tagName.slice(1)), text });
        break;
      }
      case 'bulleted_list':
      case 'ordered_list': {
        const list = el.find('ul, ol').first();
        const items = listItems($, list);
        if (items.length) blocks.push({ type: type === 'ordered_list' ? 'ol' : 'ul', items });
        break;
      }
      case 'image': {
        const img = el.find('img').first();
        const info = el.find('[data-image-info]').attr('data-image-info');
        let uri = null;
        try {
          uri = JSON.parse(info).imageData.uri;
        } catch {
          uri = wixUri(img.attr('src'));
        }
        const caption = clean(el.find('figcaption').text());
        if (uri) blocks.push({ type: 'img', uri, alt: clean(img.attr('alt') || ''), caption });
        break;
      }
      case 'video': {
        // YouTube videos are rendered as a click-to-play thumbnail (i.ytimg.com/vi/<id>/…).
        const yt = (el.html() || '').match(/(?:ytimg\.com\/vi|youtube(?:-nocookie)?\.com\/embed|youtu\.be)\/([\w-]{11})/);
        if (yt) {
          blocks.push({ type: 'youtube', id: yt[1] });
          break;
        }
        const src = el.find('video').attr('src') || el.find('iframe').attr('src') || null;
        blocks.push({ type: 'video', src, raw: src ? null : el.html()?.slice(0, 500) });
        break;
      }
      case 'divider':
        blocks.push({ type: 'hr' });
        break;
      case 'button': {
        const a = el.find('a').first();
        if (a.attr('href')) blocks.push({ type: 'button', href: a.attr('href'), text: textOf($, a).replace(/^[<>\s]+|[<>\s]+$/g, '') });
        break;
      }
      case 'first':
      case 'last':
      case 'empty-line':
        break;
      default:
        blocks.push({ type: 'unknown', wixType: type, text: textOf($, el) });
    }
  });

  return {
    url,
    slug,
    title,
    description: ogDescription,
    datePublished: ld.datePublished,
    dateModified: ld.dateModified,
    coverUri,
    wixCategories,
    blocks,
  };
}
