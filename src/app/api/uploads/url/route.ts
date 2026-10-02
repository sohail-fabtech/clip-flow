import { extensionOf, isMediaType, publicUrl, saveFile, storageKey } from '@/server/storage';

const MAX_REMOTE_BYTES = 500 * 1024 * 1024;
// ponytail: hostname check only, no DNS-rebinding protection; resolve + pin the IP if exposed publicly
const PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd])/i;

async function importUrl(originalUrl: string) {
  const url = new URL(originalUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Only http(s) URLs are supported');
  if (PRIVATE_HOST.test(url.hostname)) throw new Error('Private addresses are not allowed');

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch ${originalUrl} (${response.status})`);

  const contentType = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
  if (!isMediaType(contentType)) throw new Error(`Unsupported content type: ${contentType || 'unknown'}`);
  if (Number(response.headers.get('content-length') ?? 0) > MAX_REMOTE_BYTES) throw new Error('File too large');

  const base = decodeURIComponent(url.pathname.split('/').pop() || 'media').replace(/\.[^.]*$/, '');
  const fileName = `${base}${extensionOf(contentType)}`;
  const key = storageKey('uploads', fileName);
  await saveFile(key, new Uint8Array(await response.arrayBuffer()));
  return { fileName, filePath: publicUrl(key), contentType, originalUrl, folder: null };
}

export async function POST(request: Request) {
  const { urls } = (await request.json()) as { urls?: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return Response.json({ error: 'urls is required' }, { status: 400 });
  }
  try {
    return Response.json({ uploads: await Promise.all(urls.map(importUrl)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 400 });
  }
}
