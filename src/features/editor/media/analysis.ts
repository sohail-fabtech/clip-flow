import { dbGet, dbPut } from '@/features/editor/store/persistence';
import type { AssetKind } from '@/features/editor/model/types';

export const PEAKS_PER_SECOND = 60;
export const THUMB_HEIGHT = 54;
const MAX_THUMBS = 60;
export const MAX_DECODE_BYTES = 400 * 1024 * 1024;

export interface Probe {
  durationSec: number;
  width: number;
  height: number;
}

export interface Thumbs {
  interval: number;
  width: number;
  frames: string[];
}

const once = <T extends Event>(target: EventTarget, event: string) =>
  new Promise<T>((resolve, reject) => {
    target.addEventListener(event, e => resolve(e as T), { once: true });
    target.addEventListener('error', () => reject(new Error(`Could not load media`)), { once: true });
  });

export async function probe(src: string, kind: AssetKind): Promise<Probe> {
  if (kind === 'image') {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { durationSec: 0, width: image.naturalWidth, height: image.naturalHeight };
  }
  const media = document.createElement(kind === 'video' ? 'video' : 'audio');
  media.preload = 'metadata';
  media.src = src;
  await once(media, 'loadedmetadata');
  const video = media instanceof HTMLVideoElement ? media : null;
  return { durationSec: media.duration, width: video?.videoWidth ?? 0, height: video?.videoHeight ?? 0 };
}

export async function computePeaks(source: Blob | string): Promise<Float32Array | null> {
  try {
    const blob = typeof source === 'string' ? await (await fetch(source)).blob() : source;
    if (blob.size > MAX_DECODE_BYTES) return null;
    const context = new OfflineAudioContext(1, 1, 44100);
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    const samplesPerPeak = Math.max(1, Math.floor(buffer.sampleRate / PEAKS_PER_SECOND));
    const count = Math.ceil(buffer.length / samplesPerPeak);
    const peaks = new Float32Array(count);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < count; i++) {
        let max = 0;
        const end = Math.min(data.length, (i + 1) * samplesPerPeak);
        for (let j = i * samplesPerPeak; j < end; j++) max = Math.max(max, Math.abs(data[j]));
        peaks[i] = Math.max(peaks[i], max);
      }
    }
    return peaks;
  } catch {
    return null;
  }
}

export async function computeThumbs(src: string, durationSec: number): Promise<Thumbs | null> {
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.src = src;
    await once(video, 'loadeddata');
    const width = Math.round((THUMB_HEIGHT * video.videoWidth) / video.videoHeight) || 96;
    const count = Math.max(1, Math.min(MAX_THUMBS, Math.ceil(durationSec)));
    const interval = durationSec / count;
    const canvas = new OffscreenCanvas(width, THUMB_HEIGHT);
    const context = canvas.getContext('2d')!;
    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
      video.currentTime = Math.min(durationSec - 0.05, i * interval + 0.01);
      await once(video, 'seeked');
      context.drawImage(video, 0, 0, width, THUMB_HEIGHT);
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
      frames.push(await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));
    }
    video.removeAttribute('src');
    video.load();
    return { interval, width, frames };
  } catch {
    return null;
  }
}

const peaksCache = new Map<string, Promise<Float32Array | null>>();
const thumbsCache = new Map<string, Promise<Thumbs | null>>();

export function getPeaks(src: string, local?: Blob) {
  if (!peaksCache.has(src)) {
    peaksCache.set(
      src,
      dbGet<Float32Array>('cache', `peaks:${src}`).then(async cached => {
        if (cached) return cached;
        const peaks = await computePeaks(local ?? src);
        if (peaks) await dbPut('cache', `peaks:${src}`, peaks);
        return peaks;
      }),
    );
  }
  return peaksCache.get(src)!;
}

export function getThumbs(src: string, durationSec: number) {
  if (!thumbsCache.has(src)) {
    thumbsCache.set(
      src,
      dbGet<Thumbs>('cache', `thumbs:${src}`).then(async cached => {
        if (cached) return cached;
        const thumbs = await computeThumbs(src, durationSec);
        if (thumbs) await dbPut('cache', `thumbs:${src}`, thumbs);
        return thumbs;
      }),
    );
  }
  return thumbsCache.get(src)!;
}
