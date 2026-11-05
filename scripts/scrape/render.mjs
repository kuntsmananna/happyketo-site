// Render parsed blocks to Markdown and recipe frontmatter.
import TurndownService from 'turndown';

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*', hr: '---' });
// Keep <video>/<iframe> embeds as raw HTML (Markdown has no video syntax).
td.keep(['video', 'iframe']);

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * @param {any[]} blocks
 * @param {{
 *   rewriteHref: (href: string) => string,
 *   imagePath: (uri: string) => string | null,
 *   gifVideoPath?: (uri: string) => string | null,
 *   videoPath?: (src: string) => string | null,
 *   fallbackAlt?: string,
 *   skipUris?: Set<string>,
 * }} ctx
 */
export function blocksToMarkdown(blocks, ctx) {
  const fixLinks = (html) =>
    html.replace(/href="([^"]+)"/g, (_, href) => `href="${attr(ctx.rewriteHref(href.replace(/&amp;/g, '&')))}"`);

  const html = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'p':
        html.push(`<p>${fixLinks(b.html)}</p>`);
        break;
      case 'h': {
        // Wix uses h5/h6 for section titles; the page owns h1, so body headings are h2/h3.
        const level = b.level <= 2 ? 2 : 3;
        html.push(`<h${level}>${b.text}</h${level}>`);
        break;
      }
      case 'ul':
      case 'ol':
        html.push(`<${b.type}>${b.items.map((i) => `<li>${fixLinks(i.html)}</li>`).join('')}</${b.type}>`);
        break;
      case 'gifvideo':
      case 'img': {
        const alt = attr(b.alt || b.caption || ctx.fallbackAlt || '');
        const loop = ctx.gifVideoPath?.(b.uri);
        if (loop && (b.type === 'gifvideo' || !ctx.skipUris?.has(b.uri))) {
          // Animated GIF converted to MP4: autoplaying, silent, looping.
          html.push(`<video src="${attr(loop)}" autoplay muted loop playsinline aria-label="${alt}"></video>`);
          break;
        }
        if (b.type === 'gifvideo' || ctx.skipUris?.has(b.uri)) break;
        const src = ctx.imagePath(b.uri);
        if (!src) break;
        html.push(`<p><img src="${attr(src)}" alt="${alt}"></p>`);
        if (b.caption) html.push(`<p><em>${b.caption}</em></p>`);
        break;
      }
      case 'video': {
        const src = b.src && (ctx.videoPath?.(b.src) || b.src);
        if (src) html.push(`<video src="${attr(src)}" controls preload="metadata" playsinline></video>`);
        break;
      }
      case 'youtube':
        html.push(
          `<iframe src="https://www.youtube-nocookie.com/embed/${b.id}" title="${attr(ctx.fallbackAlt || 'YouTube')}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`,
        );
        break;
      case 'button':
        html.push(`<p><a href="${attr(ctx.rewriteHref(b.href))}">${b.text || 'לצפייה'}</a></p>`);
        break;
      case 'hr':
        html.push('<hr>');
        break;
    }
  }
  return td
    .turndown(html.join('\n'))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Minimal YAML serializer for our frontmatter (strings always quoted). */
export function toYaml(obj, indent = '') {
  const q = (s) => JSON.stringify(String(s));
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (!v.length) {
        lines.push(`${indent}${k}: []`);
        continue;
      }
      lines.push(`${indent}${k}:`);
      for (const item of v) {
        if (item && typeof item === 'object') {
          const inner = toYaml(item, indent + '    ').split('\n');
          lines.push(`${indent}  - ${inner[0].trimStart()}`, ...inner.slice(1));
        } else lines.push(`${indent}  - ${q(item)}`);
      }
    } else if (v instanceof Date) lines.push(`${indent}${k}: ${v.toISOString()}`);
    else if (typeof v === 'number' || typeof v === 'boolean') lines.push(`${indent}${k}: ${v}`);
    else lines.push(`${indent}${k}: ${q(v)}`);
  }
  return lines.join('\n');
}
