import type { Project } from '@/features/editor/model/types';
import {
  clearRange,
  clipEnd,
  expandLinked,
  moveClips,
  pasteClips,
  slipClip,
  sourceFrames,
  splitClip,
  trackClips,
  trimEnd,
  trimStart,
} from '@/features/editor/engine/edits';
import { snap, snapPoints } from '@/features/editor/engine/snapping';
import { commit, getProject } from '@/features/editor/store/project-store';
import { getFrame } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { SNAP_PX, trackHeight, useDragStore, type DragMode } from '@/features/editor/ui/timeline/geometry';

export function rowTops(project: Project) {
  const tops = new Map<string, number>();
  let y = 0;
  for (const track of project.tracks) {
    tops.set(track.id, y);
    y += trackHeight(track.kind);
  }
  return { tops, total: y };
}

export function trackAt(project: Project, y: number) {
  let top = 0;
  for (const track of project.tracks) {
    const height = trackHeight(track.kind);
    if (y >= top && y < top + height) return track;
    top += height;
  }
  return null;
}

export function shiftedTrackId(project: Project, trackId: string, shift: number) {
  const index = project.tracks.findIndex(t => t.id === trackId);
  const target = project.tracks[index + shift];
  const source = project.tracks[index];
  return target && source && target.kind === source.kind && !target.locked ? target.id : null;
}

function bounds(project: Project, ids: string[], mode: DragMode) {
  let min = -Infinity;
  let max = Infinity;
  for (const id of ids) {
    const clip = project.clips[id];
    if (mode === 'move') min = Math.max(min, -clip.start);
    if (mode === 'trim-start') {
      max = Math.min(max, clip.duration - 1);
      min = Math.max(min, -clip.start);
      if (clip.kind === 'video' || clip.kind === 'audio') min = Math.max(min, -Math.floor(clip.sourceIn / clip.speed));
    }
    if (mode === 'trim-end') {
      min = Math.max(min, -(clip.duration - 1));
      if (clip.kind === 'video' || clip.kind === 'audio')
        max = Math.min(max, Math.floor((sourceFrames(project, clip) - clip.sourceIn) / clip.speed) - clip.duration);
    }
    if (mode === 'slip' && (clip.kind === 'video' || clip.kind === 'audio')) {
      const spare = sourceFrames(project, clip) - Math.round(clip.duration * clip.speed);
      min = Math.max(min, -Math.floor((spare - clip.sourceIn) / clip.speed));
      max = Math.min(max, Math.floor(clip.sourceIn / clip.speed));
    }
  }
  return { min, max };
}

function rippleShift(project: Project, trackId: string, from: number, delta: number, skip: Set<string>) {
  for (const clip of trackClips(project, trackId)) {
    if (!skip.has(clip.id) && clip.start >= from) clip.start = Math.max(0, clip.start + delta);
  }
}

export function beginClipGesture(event: React.PointerEvent, clipId: string, mode: DragMode) {
  const project = getProject();
  const clip = project.clips[clipId];
  const ui = useUiStore.getState();
  if (!clip || project.tracks.find(t => t.id === clip.trackId)?.locked) return;
  event.stopPropagation();

  if (ui.tool === 'razor') {
    const rect = (event.currentTarget as HTMLElement).closest('[data-clip]')!.getBoundingClientRect();
    const frame = clip.start + Math.round((event.clientX - rect.left) / ui.zoom);
    commit('Split', draft => void splitClip(draft, clipId, frame));
    return;
  }

  if (mode === 'move' && ui.tool === 'trim') mode = 'slip';
  if (event.shiftKey && mode === 'move') ui.toggleSelect(clipId);
  else if (!ui.selection.includes(clipId)) ui.select([clipId]);

  const selected = useUiStore.getState().selection;
  const base = mode === 'move' ? selected : [clipId];
  const ids = (ui.linkedSelection ? expandLinked(project, base) : base).filter(id => project.clips[id]);
  const limits = bounds(project, ids, mode);
  const points = ui.snapping ? snapPoints(project, new Set(ids), getFrame()) : [];
  const startX = event.clientX;
  const lanes = (event.currentTarget as HTMLElement).closest('[data-lanes]') as HTMLElement | null;
  const lanesTop = lanes?.getBoundingClientRect().top ?? 0;
  const { tops } = rowTops(project);
  const startRow = project.tracks.findIndex(t => t.id === clip.trackId);
  const { setDrag } = useDragStore.getState();
  let moved = false;
  let state = { delta: 0, trackShift: 0, ripple: false, duplicate: false };

  const onMove = (e: PointerEvent) => {
    const raw = Math.round((e.clientX - startX) / ui.zoom);
    if (!moved && Math.abs(e.clientX - startX) < 3 && Math.abs(e.clientY - event.clientY) < 3) return;
    moved = true;
    let delta = Math.min(limits.max, Math.max(limits.min, raw));
    useUiStore.getState().setSnapIndicator(null);
    if (points.length && mode !== 'slip') {
      const edges = ids.flatMap(id => {
        const c = project.clips[id];
        if (mode === 'trim-start') return [c.start + delta];
        if (mode === 'trim-end') return [clipEnd(c) + delta];
        return [c.start + delta, clipEnd(c) + delta];
      });
      const hit = snap(edges, points, SNAP_PX / ui.zoom);
      if (hit && delta + hit.delta >= limits.min && delta + hit.delta <= limits.max) {
        delta += hit.delta;
        useUiStore.getState().setSnapIndicator(hit.at);
      }
    }
    let trackShift = 0;
    if (mode === 'move' && lanes) {
      const y = e.clientY - lanesTop;
      const row = project.tracks.findIndex(t => {
        const top = tops.get(t.id)!;
        return y >= top && y < top + trackHeight(t.kind);
      });
      const shift = row === -1 ? 0 : row - startRow;
      if (shift && ids.every(id => shiftedTrackId(project, project.clips[id].trackId, shift))) trackShift = shift;
    }
    state = { delta, trackShift, ripple: e.shiftKey && mode !== 'move', duplicate: e.altKey && mode === 'move' };
    setDrag({ mode, ids, delta, trackShift, ripple: state.ripple });
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    setDrag(null);
    useUiStore.getState().setSnapIndicator(null);
    if (!moved || (state.delta === 0 && state.trackShift === 0)) return;
    const { delta, trackShift, ripple, duplicate } = state;

    if (mode === 'move') {
      const target = (id: string) => ({
        id,
        start: project.clips[id].start + delta,
        trackId: shiftedTrackId(project, project.clips[id].trackId, trackShift) ?? project.clips[id].trackId,
      });
      if (duplicate) {
        commit('Duplicate', draft => {
          const copies = ids.map(id => ({ ...structuredClone(project.clips[id]), ...target(id) }));
          const origin = Math.min(...copies.map(c => c.start));
          const pasted = pasteClips(draft, copies, origin);
          useUiStore.getState().select(pasted);
        });
      } else {
        commit('Move', draft => moveClips(draft, ids.map(target)));
      }
      return;
    }

    commit(mode === 'slip' ? 'Slip' : ripple ? 'Ripple trim' : 'Trim', draft => {
      for (const id of ids) {
        const original = project.clips[id];
        if (mode === 'slip' && (original.kind === 'video' || original.kind === 'audio')) {
          slipClip(draft, id, original.sourceIn - delta * original.speed);
        } else if (mode === 'trim-start') {
          trimStart(draft, id, original.start + delta);
          if (ripple) {
            const applied = draft.clips[id].start - original.start;
            draft.clips[id].start = original.start;
            rippleShift(draft, original.trackId, clipEnd(original), -applied, new Set(ids));
          }
        } else if (mode === 'trim-end') {
          trimEnd(draft, id, clipEnd(original) + delta);
          if (ripple) rippleShift(draft, original.trackId, clipEnd(original), clipEnd(draft.clips[id]) - clipEnd(original), new Set(ids));
        }
        const trimmed = draft.clips[id];
        if (!ripple && mode !== 'slip') clearRange(draft, trimmed.trackId, trimmed.start, clipEnd(trimmed), new Set([id]));
      }
    });
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}
