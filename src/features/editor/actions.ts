import { nanoid } from 'nanoid';
import type { AnimProp, Clip, Project, TextClip, Transition } from '@/features/editor/model/types';
import { isVisual } from '@/features/editor/model/types';
import { clipFromAsset, createShapeClip, createTextClip, DEFAULT_TEXT_SECONDS } from '@/features/editor/model/defaults';
import {
  addTrack,
  clipEnd,
  clone,
  deleteClips,
  detachAudio,
  expandLinked,
  freeTrackFor,
  linkClips,
  moveClips,
  pasteClips,
  placeClip,
  projectDuration,
  removeTrack,
  rippleInsert,
  selectForward,
  setSpeed,
  splitAtFrame,
  trackClips,
  trimToFrame,
  unlinkClips,
  upsertMarker,
} from '@/features/editor/engine/edits';
import { removeKeyframe, setKeyframe, valueAt } from '@/features/editor/engine/keyframes';
import { formatSrt, formatVtt, parseSubtitles, type Cue } from '@/features/editor/engine/captions';
import { commit, getProject, useProjectStore } from '@/features/editor/store/project-store';
import { getFrame, seek, usePlaybackStore } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import type { TrackKind } from '@/features/editor/model/types';

const ui = () => useUiStore.getState();
const selection = () => ui().selection.filter(id => getProject().clips[id]);
const withLinks = (ids: string[]) => (ui().linkedSelection ? expandLinked(getProject(), ids) : ids);
const fps = () => getProject().settings.fps;

export function addAsset(assetId: string, at?: { trackId: string; frame: number }, ripple = false) {
  let added: string[] = [];
  commit('Add clip', draft => {
    const asset = draft.assets[assetId];
    if (!asset) return;
    const kind: TrackKind = asset.kind === 'audio' ? 'audio' : 'video';
    const frame = at?.frame ?? getFrame();
    const probe = clipFromAsset(asset, '', frame, draft.settings.fps);
    const track =
      (at && draft.tracks.find(t => t.id === at.trackId && t.kind === kind)) ??
      freeTrackFor(draft, kind, frame, frame + probe.duration);
    const clip = { ...probe, trackId: track.id };
    if (ripple) rippleInsert(draft, clip);
    else placeClip(draft, clip);
    added = [clip.id];
    if (clip.kind === 'video' && asset.hasAudio) {
      const audioId = detachAudio(draft, clip.id);
      if (audioId) added.push(audioId);
    }
  });
  ui().select(added);
}

export function addText(content = 'Your text', caption = false) {
  let id = '';
  commit('Add text', draft => {
    const frame = getFrame();
    const track = freeTrackFor(draft, 'video', frame, frame + DEFAULT_TEXT_SECONDS * draft.settings.fps);
    const clip = createTextClip(track.id, frame, draft.settings.fps, content);
    clip.text.caption = caption;
    placeClip(draft, clip);
    id = clip.id;
  });
  ui().select([id]);
  ui().setInspectorTab('text');
}

export function addShape(shape: 'rectangle' | 'ellipse') {
  let id = '';
  commit('Add shape', draft => {
    const frame = getFrame();
    const track = freeTrackFor(draft, 'video', frame, frame + 5 * draft.settings.fps);
    const clip = createShapeClip(track.id, frame, draft.settings.fps, shape);
    placeClip(draft, clip);
    id = clip.id;
  });
  ui().select([id]);
}

export const split = () => commit('Split', draft => splitAtFrame(draft, getFrame(), withLinks(selection())));

export function remove(ripple: boolean) {
  const ids = withLinks(selection());
  if (!ids.length) return;
  commit(ripple ? 'Ripple delete' : 'Delete', draft => deleteClips(draft, ids, ripple));
  ui().select([]);
}

export function trimToPlayhead(edge: 'start' | 'end') {
  const frame = getFrame();
  const project = getProject();
  const ids = selection().length
    ? withLinks(selection())
    : Object.values(project.clips)
        .filter(c => frame > c.start && frame < clipEnd(c))
        .map(c => c.id);
  commit(edge === 'start' ? 'Trim start' : 'Trim end', draft => trimToFrame(draft, ids, frame, edge));
}

export function copy() {
  const project = getProject();
  ui().setClipboard(withLinks(selection()).map(id => clone(project.clips[id])));
}

export function cut() {
  copy();
  remove(false);
}

export function paste() {
  const clips = ui().clipboard;
  if (!clips.length) return;
  let ids: string[] = [];
  commit('Paste', draft => {
    ids = pasteClips(draft, clips, getFrame());
  });
  ui().select(ids);
}

export function duplicate() {
  const project = getProject();
  const clips = withLinks(selection()).map(id => project.clips[id]);
  if (!clips.length) return;
  const end = Math.max(...clips.map(clipEnd));
  let ids: string[] = [];
  commit('Duplicate', draft => {
    ids = pasteClips(draft, clips, end);
  });
  ui().select(ids);
}

export const selectAll = () => ui().select(Object.keys(getProject().clips));

export function selectForwardFrom(allTracks: boolean) {
  const project = getProject();
  const first = selection()[0] ? project.clips[selection()[0]] : null;
  ui().select(selectForward(project, getFrame(), allTracks ? null : (first?.trackId ?? null)));
}

export function nudge(frames: number) {
  const ids = withLinks(selection());
  if (!ids.length) return seek(getFrame() + frames);
  const project = getProject();
  commit('Nudge', draft =>
    moveClips(
      draft,
      ids.map(id => ({ id, start: project.clips[id].start + frames, trackId: project.clips[id].trackId })),
    ),
  );
}

export function toggleLink() {
  const ids = selection();
  const project = getProject();
  const linked = ids.some(id => project.clips[id]?.linkId);
  commit(linked ? 'Unlink' : 'Link', draft =>
    linked ? unlinkClips(draft, expandLinked(draft, ids)) : linkClips(draft, ids),
  );
}

export function detach() {
  const ids = selection();
  commit('Detach audio', draft => ids.forEach(id => detachAudio(draft, id)));
}

export function changeSpeed(speed: number) {
  const ids = selection();
  commit('Change speed', draft => ids.forEach(id => setSpeed(draft, id, speed)));
}

export const newTrack = (kind: TrackKind) => commit('Add track', draft => void addTrack(draft, kind));
export const deleteTrack = (id: string) => commit('Delete track', draft => removeTrack(draft, id));

export function updateTrack(id: string, patch: Partial<Project['tracks'][number]>) {
  commit('Update track', draft => {
    const track = draft.tracks.find(t => t.id === id);
    if (track) Object.assign(track, patch);
  });
}

export function updateClips(label: string, ids: string[], recipe: (clip: Clip) => void) {
  commit(label, draft => {
    for (const id of ids) if (draft.clips[id]) recipe(draft.clips[id]);
  });
}

export function setProp(ids: string[], prop: AnimProp, value: number, apply: (clip: Clip) => void) {
  const frame = getFrame();
  updateClips(`Change ${prop}`, ids, clip => {
    if (clip.keyframes[prop]?.length)
      setKeyframe(clip, prop, Math.min(clip.duration - 1, Math.max(0, frame - clip.start)), value);
    else apply(clip);
  });
}

export function toggleKeyframe(ids: string[], prop: AnimProp, current: (clip: Clip) => number) {
  const frame = getFrame();
  updateClips('Toggle keyframe', ids, clip => {
    const local = Math.min(clip.duration - 1, Math.max(0, frame - clip.start));
    if (clip.keyframes[prop]?.some(k => k.frame === local)) removeKeyframe(clip, prop, local);
    else setKeyframe(clip, prop, local, valueAt(clip, prop, local, current(clip)));
  });
}

export function clearKeyframes(ids: string[], prop: AnimProp) {
  updateClips('Clear keyframes', ids, clip => {
    delete clip.keyframes[prop];
  });
}

export function setTransitionAtCut(clipId: string, transition: Transition | null) {
  updateClips(transition ? 'Add transition' : 'Remove transition', [clipId], clip => {
    clip.transitionIn = transition;
  });
}

export function applyTransitionToSelection(transition: Transition) {
  const project = getProject();
  const targets = selection().filter(id => {
    const clip = project.clips[id];
    return clip && isVisual(clip) && trackClips(project, clip.trackId).some(c => clipEnd(c) === clip.start);
  });
  updateClips('Add transition', targets, clip => {
    clip.transitionIn = transition;
  });
  return targets.length;
}

export function markIn() {
  commit('Mark in', draft => {
    draft.inPoint = getFrame();
    if (draft.outPoint !== null && draft.outPoint <= draft.inPoint) draft.outPoint = null;
  });
}

export function markOut() {
  commit('Mark out', draft => {
    draft.outPoint = getFrame();
    if (draft.inPoint !== null && draft.inPoint >= draft.outPoint) draft.inPoint = null;
  });
}

export const clearInOut = () =>
  commit('Clear in/out', draft => {
    draft.inPoint = null;
    draft.outPoint = null;
  });

export function addMarker() {
  const id = nanoid();
  const frame = getFrame();
  commit('Add marker', draft =>
    upsertMarker(draft, {
      id,
      frame,
      duration: 0,
      name: `Marker ${draft.markers.length + 1}`,
      color: '#4094FF',
      comment: '',
    }),
  );
  ui().selectMarker(id);
}

export function stepMarker(direction: 1 | -1) {
  const frame = getFrame();
  const frames = getProject().markers.map(m => m.frame);
  const target = direction === 1 ? frames.find(f => f > frame) : frames.findLast(f => f < frame);
  if (target !== undefined) seek(target);
}

export function goToEdit(direction: 1 | -1) {
  const project = getProject();
  const frame = getFrame();
  const edits = [...new Set(Object.values(project.clips).flatMap(c => [c.start, clipEnd(c)]))].sort((a, b) => a - b);
  const target = direction === 1 ? edits.find(f => f > frame) : edits.findLast(f => f < frame);
  seek(target ?? (direction === 1 ? projectDuration(project) : 0));
}

export const stepFrames = (frames: number) => seek(Math.min(projectDuration(getProject()), getFrame() + frames));
export const skipSeconds = (seconds: number) => stepFrames(seconds * fps());
export const undo = () => useProjectStore.getState().undo();
export const redo = () => useProjectStore.getState().redo();
export const isPlaying = () => usePlaybackStore.getState().playing;

export function importCaptions(text: string) {
  const cues = parseSubtitles(text);
  if (!cues.length) throw new Error('No captions found in this file');
  let ids: string[] = [];
  commit('Import captions', draft => {
    const rate = draft.settings.fps;
    const start = Math.round(cues[0].start * rate);
    const end = Math.round(cues.at(-1)!.end * rate);
    const track = freeTrackFor(draft, 'video', start, end);
    ids = cues.map(cue => {
      const clip = createTextClip(track.id, Math.round(cue.start * rate), rate, cue.text);
      clip.duration = Math.max(1, Math.round((cue.end - cue.start) * rate));
      clip.text.caption = true;
      clip.text.style.fontSize = 64;
      clip.transform.y = draft.settings.height * 0.32;
      placeClip(draft, clip);
      return clip.id;
    });
  });
  ui().select(ids);
  return cues.length;
}

export function captionCues(): Cue[] {
  const project = getProject();
  return Object.values(project.clips)
    .filter((c): c is TextClip => c.kind === 'text' && c.text.caption)
    .sort((a, b) => a.start - b.start)
    .map(c => ({
      start: c.start / project.settings.fps,
      end: clipEnd(c) / project.settings.fps,
      text: c.text.content,
    }));
}

export const exportCaptions = (format: 'srt' | 'vtt') =>
  format === 'srt' ? formatSrt(captionCues()) : formatVtt(captionCues());
