import type { Clip, Project, Transition, VisualClip } from '@/features/editor/model/types';
import { valueAt } from '@/features/editor/engine/keyframes';
import { clipEnd, trackClips } from '@/features/editor/engine/edits';

export interface Animated {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export const animatedTransform = (clip: VisualClip, localFrame: number): Animated => ({
  x: valueAt(clip, 'x', localFrame, clip.transform.x),
  y: valueAt(clip, 'y', localFrame, clip.transform.y),
  scale: valueAt(clip, 'scale', localFrame, clip.transform.scale),
  rotation: valueAt(clip, 'rotation', localFrame, clip.transform.rotation),
  opacity: valueAt(clip, 'opacity', localFrame, clip.transform.opacity),
});

export function fitSize(mediaWidth: number, mediaHeight: number, canvasWidth: number, canvasHeight: number) {
  if (!mediaWidth || !mediaHeight) return { width: canvasWidth, height: canvasHeight };
  const ratio = Math.min(canvasWidth / mediaWidth, canvasHeight / mediaHeight);
  return { width: mediaWidth * ratio, height: mediaHeight * ratio };
}

export function baseSize(clip: VisualClip, project: Project) {
  const { width, height } = project.settings;
  if (clip.kind === 'shape') return { width: clip.shapeContent.width, height: clip.shapeContent.height };
  if (clip.kind === 'text') return { width: width * clip.text.style.maxWidth, height: 0 };
  const asset = project.assets[clip.assetId];
  return fitSize(asset?.width ?? width, asset?.height ?? height, width, height);
}

export interface Rolls {
  pre: number;
  post: number;
  exit: Transition | null;
}

export function transitionRolls(project: Project, clip: Clip): Rolls {
  const pre = clip.transitionIn ? Math.floor(clip.transitionIn.duration / 2) : 0;
  const exit = trackClips(project, clip.trackId).find(c => c.start === clipEnd(clip))?.transitionIn ?? null;
  return { pre: Math.min(pre, clip.start), post: exit ? Math.ceil(exit.duration / 2) : 0, exit };
}
