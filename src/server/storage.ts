import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { nanoid } from 'nanoid';

export const STORAGE_DIR = path.join(process.cwd(), 'storage');

const CONTENT_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const EXTENSIONS = Object.fromEntries(Object.entries(CONTENT_TYPES).map(([ext, type]) => [type, ext]));

export const contentTypeOf = (file: string) =>
  CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

export const extensionOf = (contentType: string) => EXTENSIONS[contentType.split(';')[0].trim()] ?? '';

export const isMediaType = (contentType: string) => /^(video|audio|image)\//.test(contentType);

export function storageKey(folder: 'uploads' | 'renders' | 'voice-overs', fileName: string) {
  const safe = path.basename(fileName).replace(/[^\w.-]+/g, '_').slice(-80);
  return `${folder}/${nanoid(10)}-${safe}`;
}

export const publicUrl = (key: string) => `/api/files/${key}`;

export function resolveKey(key: string) {
  const file = path.resolve(STORAGE_DIR, key);
  if (!file.startsWith(STORAGE_DIR + path.sep)) throw new Error('Invalid path');
  return file;
}

export async function saveFile(key: string, data: Uint8Array) {
  const file = resolveKey(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

export async function streamFile(key: string, range: string | null) {
  const file = resolveKey(key);
  const { size } = await stat(file);
  const headers: Record<string, string> = {
    'Content-Type': contentTypeOf(file),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
  };

  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) {
    headers['Content-Length'] = String(size);
    return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers });
  }

  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }

  headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  headers['Content-Length'] = String(end - start + 1);
  return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, {
    status: 206,
    headers,
  });
}
