import type { AnimProp, Clip, Project } from '@/features/editor/model/types';
import { setKeyframe, valueAt } from '@/features/editor/engine/keyframes';
import { useProjectStore } from '@/features/editor/store/project-store';
import { getFrame } from '@/features/editor/store/playback-store';

type Recipe = (draft: Project) => void;

export function edit(label: string, recipe: Recipe, phase: 'live' | 'commit') {
  const store = useProjectStore.getState();
  if (phase === 'live') {
    if (!store.pending) store.begin(label);
    store.update(recipe);
    return;
  }
  if (store.pending) {
    store.update(recipe);
    store.end();
  } else {
    store.commit(label, recipe);
  }
}

export const editClips = (
  ids: string[],
  label: string,
  recipe: (clip: Clip) => void,
  phase: 'live' | 'commit' = 'commit',
) =>
  edit(
    label,
    draft => {
      for (const id of ids) if (draft.clips[id]) recipe(draft.clips[id]);
    },
    phase,
  );

export function baseValue(clip: Clip, prop: AnimProp) {
  if (prop === 'volume') return clip.kind === 'video' || clip.kind === 'audio' ? clip.audio.volumeDb : 0;
  return clip.kind === 'audio' ? 0 : clip.transform[prop];
}

export function writeAnimated(clip: Clip, prop: AnimProp, value: number) {
  if (clip.keyframes[prop]?.length) {
    setKeyframe(clip, prop, Math.min(clip.duration - 1, Math.max(0, getFrame() - clip.start)), value);
    return;
  }
  if (prop === 'volume') {
    if (clip.kind === 'video' || clip.kind === 'audio') clip.audio.volumeDb = value;
  } else if (clip.kind !== 'audio') {
    clip.transform[prop] = value;
  }
}

export const animatedValue = (clip: Clip, prop: AnimProp, frame: number) =>
  valueAt(clip, prop, Math.min(clip.duration - 1, Math.max(0, frame - clip.start)), baseValue(clip, prop));
