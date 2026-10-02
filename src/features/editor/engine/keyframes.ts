import type { AnimProp, Clip, Easing, Keyframe } from '@/features/editor/model/types';

const EASE: Record<Easing, (t: number) => number> = {
  linear: t => t,
  easeIn: t => t * t * t,
  easeOut: t => 1 - (1 - t) ** 3,
  easeInOut: t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  hold: () => 0,
};

export function interpolate(keyframes: Keyframe[] | undefined, frame: number, fallback: number) {
  if (!keyframes?.length) return fallback;
  if (frame <= keyframes[0].frame) return keyframes[0].value;
  const last = keyframes[keyframes.length - 1];
  if (frame >= last.frame) return last.value;
  const index = keyframes.findIndex(k => k.frame > frame);
  const from = keyframes[index - 1];
  const to = keyframes[index];
  const t = (frame - from.frame) / (to.frame - from.frame);
  return from.value + (to.value - from.value) * EASE[from.easing](t);
}

export const valueAt = (clip: Clip, prop: AnimProp, localFrame: number, base: number) =>
  interpolate(clip.keyframes[prop], localFrame, base);

export function setKeyframe(clip: Clip, prop: AnimProp, frame: number, value: number, easing: Easing = 'easeInOut') {
  const list = (clip.keyframes[prop] ??= []);
  const existing = list.find(k => k.frame === frame);
  if (existing) existing.value = value;
  else list.push({ frame, value, easing });
  list.sort((a, b) => a.frame - b.frame);
}

export function removeKeyframe(clip: Clip, prop: AnimProp, frame: number) {
  const list = clip.keyframes[prop];
  if (!list) return;
  const next = list.filter(k => k.frame !== frame);
  if (next.length) clip.keyframes[prop] = next;
  else delete clip.keyframes[prop];
}

export const keyframeAt = (clip: Clip, prop: AnimProp, frame: number) =>
  clip.keyframes[prop]?.find(k => k.frame === frame) ?? null;

export function adjacentKeyframe(clip: Clip, prop: AnimProp, frame: number, direction: 1 | -1) {
  const frames = (clip.keyframes[prop] ?? []).map(k => k.frame);
  return direction === 1 ? (frames.find(f => f > frame) ?? null) : (frames.findLast(f => f < frame) ?? null);
}
