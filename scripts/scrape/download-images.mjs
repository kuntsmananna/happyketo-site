// Download Wix media:
//   images → src/assets/posts/ (max 1280px, Astro builds the responsive sizes)
//   animated GIFs → still JPEG in src/assets/posts/ + looping MP4 in public/videos/ (via ffmpeg)
//   Wix-hosted videos → public/videos/ (720p)
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import pLimit from 'p-limit';
import { fetchBuffer } from './fetch.mjs';

export const ASSETS_DIR = path.resolve(import.meta.dirname, '../../src/assets/posts');
export const VIDEOS_DIR = path.resolve(import.meta.dirname, '../../public/videos');
const TMP_DIR = path.resolve(import.meta.dirname, '.cache/media');
const MAX = 1280;
const QUALITY = 85;
const run = promisify(execFile);

const isGif = (uri) => /\.gif$/i.test(uri);
const baseName = (uri) =>
  uri
    .replace(/~mv2/g, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^\w-]/g, '_')
    .toLowerCase();

/** Local image file for a Wix URI. PNG becomes JPEG (~7× smaller); GIF becomes a JPEG still when ffmpeg exists. */
export const localName = (uri, { ffmpeg = true } = {}) => {
  const ext = (uri.match(/\.([a-z0-9]+)$/i)?.[1] || 'jpg').toLowerCase();
  if (ext === 'png' || (ext === 'gif' && ffmpeg)) return `${baseName(uri)}.jpg`;
  return `${baseName(uri)}.${ext}`;
};

/** Public URL of the MP4 made from an animated GIF. */
export const gifVideoPath = (uri) => `/videos/${baseName(uri)}.mp4`;

/** Wix resizes and converts according to the requested file name. */
function imageUrl(uri) {
  const out = uri.replace(/\.[a-z0-9]+$/i, '.' + localName(uri).split('.').pop());
  return `https://static.wixstatic.com/media/${encodeURIComponent(uri)}/v1/fit/w_${MAX},h_${MAX},q_${QUALITY}/${encodeURIComponent(out)}`;
}

async function hasFfmpeg() {
  try {
    await run('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

async function fetchGif(uri) {
  await mkdir(TMP_DIR, { recursive: true });
  const gif = path.join(TMP_DIR, `${baseName(uri)}.gif`);
  if (!existsSync(gif)) await writeFile(gif, await fetchBuffer(`https://static.wixstatic.com/media/${encodeURIComponent(uri)}`));
  return gif;
}

/** Animated GIF → first-frame JPEG (for cards/covers) + silent looping H.264 MP4 (10–30× smaller). */
async function convertGif(uri) {
  const gif = await fetchGif(uri);
  const still = path.join(ASSETS_DIR, localName(uri, { ffmpeg: true }));
  if (!existsSync(still)) await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', gif, '-vframes', '1', '-q:v', '3', still]);
  const mp4 = path.join(VIDEOS_DIR, `${baseName(uri)}.mp4`);
  if (!existsSync(mp4)) {
    await run('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', gif,
      '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-an',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
      mp4,
    ]);
  }
}

/**
 * Download every image URI not already on disk.
 * @returns {{ ok: Set<string>, files: Map<string, string>, gifVideos: Set<string>, failed: {uri: string, error: string}[], fetched: number }}
 */
export async function downloadImages(uris, { concurrency = 4, log = console.log } = {}) {
  await mkdir(ASSETS_DIR, { recursive: true });
  await mkdir(VIDEOS_DIR, { recursive: true });
  const ffmpeg = await hasFfmpeg();
  if (!ffmpeg) log('  ! ffmpeg not found: animated GIFs will be kept as still images only');
  const limit = pLimit(concurrency);
  const ok = new Set();
  const files = new Map(); // uri → file name in src/assets/posts
  const gifVideos = new Set();
  const failed = [];
  let fetched = 0;
  await Promise.all(
    [...uris].map((uri) =>
      limit(async () => {
        try {
          const name = localName(uri, { ffmpeg });
          const file = path.join(ASSETS_DIR, name);
          if (isGif(uri)) {
            // Wix can't convert GIFs by file name; without ffmpeg keep the GIF as-is (an <img> still animates).
            if (ffmpeg) {
              await convertGif(uri);
              gifVideos.add(uri);
            } else if (!existsSync(file)) await writeFile(file, await readFile(await fetchGif(uri)));
          } else if (!existsSync(file)) {
            await writeFile(file, await fetchBuffer(imageUrl(uri)));
            if (++fetched % 25 === 0) log(`  images: ${fetched} downloaded…`);
          }
          ok.add(uri);
          files.set(uri, name);
        } catch (error) {
          failed.push({ uri, error: String(error.message || error) });
        }
      }),
    ),
  );
  return { ok, files, gifVideos, failed, fetched };
}

/** Download a Wix-hosted video (video.wixstatic.com) at 720p. Returns its public path or null. */
export async function downloadWixVideo(src) {
  const m = src?.match(/video\.wixstatic\.com\/video\/([^/]+)\//);
  if (!m) return null;
  await mkdir(VIDEOS_DIR, { recursive: true });
  const name = `${m[1].toLowerCase()}.mp4`;
  const out = path.join(VIDEOS_DIR, name);
  if (!existsSync(out)) {
    let buf;
    for (const q of ['720p', '480p', '1080p']) {
      try {
        buf = await fetchBuffer(`https://video.wixstatic.com/video/${m[1]}/${q}/mp4/file.mp4`);
        break;
      } catch {}
    }
    if (!buf) return null;
    await writeFile(out, buf);
  }
  return `/videos/${name}`;
}
