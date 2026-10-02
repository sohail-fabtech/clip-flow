import { current, isDraft } from 'immer';
import { nanoid } from 'nanoid';
import type { AnimProp, AudioClip, Clip, Keyframe, Marker, Project, TrackKind } from '@/features/editor/model/types';
import { defaultAudio, makeTrack } from '@/features/editor/model/defaults';

export const clone = <T>(value: T): T => structuredClone(isDraft(value) ? (current(value as never) as T) : value);

export const clipEnd = (clip: Clip) => clip.start + clip.duration;

export const projectDuration = (project: Project) =>
  Object.values(project.clips).reduce((max, clip) => Math.max(max, clipEnd(clip)), 0);

export const trackClips = (project: Project, trackId: string) =>
  Object.values(project.clips)
    .filter(clip => clip.trackId === trackId)
    .sort((a, b) => a.start - b.start);

const isLocked = (project: Project, trackId: string) => project.tracks.find(t => t.id === trackId)?.locked ?? false;

export function sourceFrames(project: Project, clip: Clip) {
  if (clip.kind !== 'video' && clip.kind !== 'audio') return Infinity;
  const asset = project.assets[clip.assetId];
  return asset ? Math.round(asset.durationSec * project.settings.fps) : Infinity;
}

const shiftKeyframes = (keyframes: Clip['keyframes'], offset: number, length: number) => {
  const result: Clip['keyframes'] = {};
  for (const [prop, list] of Object.entries(keyframes) as [AnimProp, Keyframe[]][]) {
    const kept = list.filter(k => k.frame >= offset && k.frame < offset + length).map(k => ({ ...k, frame: k.frame - offset }));
    if (kept.length) result[prop] = kept;
  }
  return result;
};

function cutAt(project: Project, clip: Clip, frame: number, linkId: string | null) {
  const offset = frame - clip.start;
  const right = clone(clip);
  right.id = nanoid();
  right.start = frame;
  right.duration = clip.duration - offset;
  right.linkId = linkId;
  right.transitionIn = null;
  right.keyframes = shiftKeyframes(clip.keyframes, offset, right.duration);
  if (right.kind === 'video' || right.kind === 'audio') {
    right.sourceIn += Math.round(offset * right.speed);
    right.audio.fadeIn = 0;
  }
  clip.duration = offset;
  clip.keyframes = shiftKeyframes(clip.keyframes, 0, offset);
  if (clip.kind === 'video' || clip.kind === 'audio') clip.audio.fadeOut = 0;
  project.clips[right.id] = right;
  return right;
}

export function splitClip(project: Project, id: string, frame: number) {
  const clip = project.clips[id];
  if (!clip || frame <= clip.start || frame >= clipEnd(clip) || isLocked(project, clip.trackId)) return [];
  const linked = clip.linkId ? linkedClips(project, clip).filter(c => frame > c.start && frame < clipEnd(c)) : [clip];
  const newLink = linked.length > 1 ? nanoid() : null;
  return linked.map(c => cutAt(project, c, frame, newLink).id);
}

export function splitAtFrame(project: Project, frame: number, ids: string[]) {
  const targets = ids.length
    ? ids
    : Object.values(project.clips)
        .filter(c => frame > c.start && frame < clipEnd(c))
        .map(c => c.id);
  const done = new Set<string>();
  for (const id of targets) {
    if (done.has(id) || !project.clips[id]) continue;
    linkedClips(project, project.clips[id]).forEach(c => done.add(c.id));
    splitClip(project, id, frame);
  }
}

export function clearRange(project: Project, trackId: string, start: number, end: number, except: Set<string>) {
  for (const clip of trackClips(project, trackId)) {
    if (except.has(clip.id)) continue;
    const s = clip.start;
    const e = clipEnd(clip);
    if (e <= start || s >= end) continue;
    if (s >= start && e <= end) {
      delete project.clips[clip.id];
    } else if (s < start && e > end) {
      cutAt(project, clip, end, null);
      clip.duration = start - s;
    } else if (s < start) {
      clip.duration = start - s;
      if (clip.kind === 'video' || clip.kind === 'audio') clip.audio.fadeOut = 0;
    } else {
      const trimmed = end - s;
      clip.start = end;
      clip.duration -= trimmed;
      clip.transitionIn = null;
      if (clip.kind === 'video' || clip.kind === 'audio') clip.sourceIn += Math.round(trimmed * clip.speed);
    }
  }
}

export function placeClip(project: Project, clip: Clip) {
  clearRange(project, clip.trackId, clip.start, clipEnd(clip), new Set([clip.id]));
  project.clips[clip.id] = clip;
}

export function moveClips(project: Project, moves: { id: string; start: number; trackId: string }[]) {
  const ids = new Set(moves.map(m => m.id));
  for (const move of moves) {
    const clip = project.clips[move.id];
    if (!clip) continue;
    clip.start = Math.max(0, move.start);
    clip.trackId = move.trackId;
  }
  for (const move of moves) {
    const clip = project.clips[move.id];
    if (clip) clearRange(project, clip.trackId, clip.start, clipEnd(clip), ids);
  }
}

export function trimStart(project: Project, id: string, newStart: number) {
  const clip = project.clips[id];
  if (!clip) return;
  const end = clipEnd(clip);
  let start = Math.min(Math.max(0, newStart), end - 1);
  if (clip.kind === 'video' || clip.kind === 'audio') {
    const earliest = clip.start - Math.floor(clip.sourceIn / clip.speed);
    start = Math.max(start, earliest);
    clip.sourceIn += Math.round((start - clip.start) * clip.speed);
  }
  const delta = start - clip.start;
  clip.keyframes = shiftKeyframes(clip.keyframes, delta, end - start);
  clip.start = start;
  clip.duration = end - start;
}

export function trimEnd(project: Project, id: string, newEnd: number) {
  const clip = project.clips[id];
  if (!clip) return;
  let end = Math.max(clip.start + 1, newEnd);
  if (clip.kind === 'video' || clip.kind === 'audio') {
    end = Math.min(end, clip.start + Math.floor((sourceFrames(project, clip) - clip.sourceIn) / clip.speed));
  }
  clip.duration = Math.max(1, end - clip.start);
}

export function slipClip(project: Project, id: string, sourceIn: number) {
  const clip = project.clips[id];
  if (!clip || (clip.kind !== 'video' && clip.kind !== 'audio')) return;
  const max = sourceFrames(project, clip) - Math.round(clip.duration * clip.speed);
  clip.sourceIn = Math.min(Math.max(0, Math.round(sourceIn)), Math.max(0, max));
}

export function setSpeed(project: Project, id: string, speed: number) {
  const clip = project.clips[id];
  if (!clip || (clip.kind !== 'video' && clip.kind !== 'audio')) return;
  const source = Math.round(clip.duration * clip.speed);
  clip.speed = Math.min(16, Math.max(0.1, speed));
  clip.duration = Math.max(1, Math.round(source / clip.speed));
  clearRange(project, clip.trackId, clip.start, clipEnd(clip), new Set([clip.id]));
}

function rippleTrack(project: Project, trackId: string, from: number, delta: number) {
  if (isLocked(project, trackId)) return;
  for (const clip of trackClips(project, trackId)) {
    if (clip.start >= from) clip.start = Math.max(0, clip.start + delta);
  }
}

export function deleteClips(project: Project, ids: string[], ripple: boolean) {
  const targets = ids
    .map(id => project.clips[id])
    .filter((clip): clip is Clip => !!clip && !isLocked(project, clip.trackId))
    .sort((a, b) => b.start - a.start);
  for (const clip of targets) {
    delete project.clips[clip.id];
    if (ripple) rippleTrack(project, clip.trackId, clipEnd(clip), -clip.duration);
  }
}

export function rippleInsert(project: Project, clip: Clip) {
  for (const track of project.tracks) {
    if (track.locked) continue;
    for (const other of trackClips(project, track.id)) {
      if (clip.start > other.start && clip.start < clipEnd(other)) cutAt(project, other, clip.start, null);
    }
    rippleTrack(project, track.id, clip.start, clip.duration);
  }
  project.clips[clip.id] = clip;
}

export function trimToFrame(project: Project, ids: string[], frame: number, edge: 'start' | 'end') {
  for (const id of ids) {
    const clip = project.clips[id];
    if (!clip || frame <= clip.start || frame >= clipEnd(clip) || isLocked(project, clip.trackId)) continue;
    if (edge === 'start') trimStart(project, id, frame);
    else trimEnd(project, id, frame);
  }
}

export function linkedClips(project: Project, clip: Clip) {
  return clip.linkId ? Object.values(project.clips).filter(c => c.linkId === clip.linkId) : [clip];
}

export function expandLinked(project: Project, ids: string[]) {
  const result = new Set<string>();
  for (const id of ids) {
    const clip = project.clips[id];
    if (clip) linkedClips(project, clip).forEach(c => result.add(c.id));
  }
  return [...result];
}

export function linkClips(project: Project, ids: string[]) {
  const linkId = ids.length > 1 ? nanoid() : null;
  for (const id of ids) if (project.clips[id]) project.clips[id].linkId = linkId;
}

export function unlinkClips(project: Project, ids: string[]) {
  for (const id of ids) if (project.clips[id]) project.clips[id].linkId = null;
}

export function ensureTrack(project: Project, kind: TrackKind) {
  const existing = project.tracks.filter(t => t.kind === kind);
  return existing.length ? existing[kind === 'video' ? existing.length - 1 : 0] : addTrack(project, kind);
}

export function freeTrackFor(project: Project, kind: TrackKind, start: number, end: number) {
  const tracks = project.tracks.filter(t => t.kind === kind && !t.locked);
  const ordered = kind === 'video' ? [...tracks].reverse() : tracks;
  return (
    ordered.find(t => trackClips(project, t.id).every(c => clipEnd(c) <= start || c.start >= end)) ??
    addTrack(project, kind)
  );
}

export function detachAudio(project: Project, id: string) {
  const clip = project.clips[id];
  if (!clip || clip.kind !== 'video' || !project.assets[clip.assetId]?.hasAudio) return null;
  const track = freeTrackFor(project, 'audio', clip.start, clipEnd(clip));
  const linkId = clip.linkId ?? nanoid();
  const audio: AudioClip = {
    id: nanoid(),
    kind: 'audio',
    trackId: track.id,
    name: clip.name,
    start: clip.start,
    duration: clip.duration,
    linkId,
    keyframes: {},
    transitionIn: null,
    assetId: clip.assetId,
    sourceIn: clip.sourceIn,
    speed: clip.speed,
    audio: { ...defaultAudio(), ...clip.audio },
  };
  clip.linkId = linkId;
  clip.muted = true;
  project.clips[audio.id] = audio;
  return audio.id;
}

export function addTrack(project: Project, kind: TrackKind) {
  const count = project.tracks.filter(t => t.kind === kind).length;
  const track = makeTrack(kind, count + 1);
  if (kind === 'video') project.tracks.unshift(track);
  else project.tracks.push(track);
  return track;
}

export function removeTrack(project: Project, trackId: string) {
  const track = project.tracks.find(t => t.id === trackId);
  if (!track || project.tracks.filter(t => t.kind === track.kind).length <= 1) return;
  project.tracks = project.tracks.filter(t => t.id !== trackId);
  for (const clip of Object.values(project.clips)) if (clip.trackId === trackId) delete project.clips[clip.id];
}

export function selectForward(project: Project, frame: number, trackId: string | null) {
  return Object.values(project.clips)
    .filter(c => c.start >= frame && (!trackId || c.trackId === trackId))
    .map(c => c.id);
}

export function pasteClips(project: Project, clips: Clip[], frame: number) {
  if (!clips.length) return [];
  const origin = Math.min(...clips.map(c => c.start));
  const links = new Map<string, string>();
  const pasted = clips.map(source => {
    const clip = clone(source);
    clip.id = nanoid();
    clip.start = frame + (source.start - origin);
    if (source.linkId) {
      if (!links.has(source.linkId)) links.set(source.linkId, nanoid());
      clip.linkId = links.get(source.linkId)!;
    }
    if (!project.tracks.some(t => t.id === clip.trackId)) clip.trackId = ensureTrack(project, clip.kind === 'audio' ? 'audio' : 'video').id;
    placeClip(project, clip);
    return clip.id;
  });
  return pasted;
}

export function upsertMarker(project: Project, marker: Marker) {
  const index = project.markers.findIndex(m => m.id === marker.id);
  if (index >= 0) project.markers[index] = marker;
  else project.markers.push(marker);
  project.markers.sort((a, b) => a.frame - b.frame);
}
