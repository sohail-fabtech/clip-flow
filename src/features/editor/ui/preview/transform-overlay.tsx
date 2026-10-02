import { useEffect, useState } from 'react';
import type { AnimProp, Clip, VisualClip } from '@/features/editor/model/types';
import { isVisual } from '@/features/editor/model/types';
import { clipEnd } from '@/features/editor/engine/edits';
import { setKeyframe } from '@/features/editor/engine/keyframes';
import { useProjectStore } from '@/features/editor/store/project-store';
import { usePlaybackStore } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { animatedTransform, baseSize } from '@/features/editor/render/layout';

function write(clip: Clip, prop: AnimProp, value: number, frame: number) {
  if (!isVisual(clip)) return;
  if (clip.keyframes[prop]?.length) setKeyframe(clip, prop, Math.min(clip.duration - 1, Math.max(0, frame - clip.start)), value);
  else if (prop !== 'volume') clip.transform[prop] = value;
}

interface OverlayProps {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function TransformOverlay({ scale, offsetX, offsetY }: OverlayProps) {
  const project = useProjectStore(s => s.project);
  const selection = useUiStore(s => s.selection);
  const frame = usePlaybackStore(s => s.frame);
  const playing = usePlaybackStore(s => s.playing);
  const [textHeight, setTextHeight] = useState(0);

  const clip = selection.length === 1 ? project.clips[selection[0]] : undefined;
  const visible = clip && isVisual(clip) && frame >= clip.start && frame < clipEnd(clip) && !playing;
  const track = clip && project.tracks.find(t => t.id === clip.trackId);

  useEffect(() => {
    if (!visible || clip.kind !== 'text') return;
    const el = document.querySelector<HTMLElement>(`[data-clip-id="${clip.id}"]`);
    setTextHeight(el?.offsetHeight ?? 0);
  });

  if (!visible || track?.locked) return null;
  const visual = clip as VisualClip;
  const local = frame - visual.start;
  const t = animatedTransform(visual, local);
  const base = baseSize(visual, project);
  const width = base.width * t.scale * scale;
  const height = (visual.kind === 'text' ? textHeight : base.height) * t.scale * scale;
  const cx = offsetX + (project.settings.width / 2 + t.x) * scale;
  const cy = offsetY + (project.settings.height / 2 + t.y) * scale;

  const gesture = (event: React.PointerEvent, kind: 'move' | 'scale' | 'rotate') => {
    event.stopPropagation();
    event.preventDefault();
    const store = useProjectStore.getState();
    store.begin(kind === 'move' ? 'Move' : kind === 'scale' ? 'Scale' : 'Rotate');
    const startX = event.clientX;
    const startY = event.clientY;
    const start = { ...t };
    const rect = (event.currentTarget as HTMLElement).closest('[data-preview]')!.getBoundingClientRect();
    const centerX = rect.left + cx;
    const centerY = rect.top + cy;
    const startDistance = Math.hypot(startX - centerX, startY - centerY) || 1;
    const startAngle = Math.atan2(startY - centerY, startX - centerX);
    const move = (e: PointerEvent) => {
      store.update(draft => {
        const target = draft.clips[visual.id];
        if (kind === 'move') {
          let x = start.x + (e.clientX - startX) / scale;
          let y = start.y + (e.clientY - startY) / scale;
          if (!e.shiftKey) {
            if (Math.abs(x) < 8 / scale) x = 0;
            if (Math.abs(y) < 8 / scale) y = 0;
          }
          write(target, 'x', Math.round(x), frame);
          write(target, 'y', Math.round(y), frame);
        } else if (kind === 'scale') {
          const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          write(target, 'scale', Math.max(0.02, Number((start.scale * (distance / startDistance)).toFixed(3))), frame);
        } else {
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          let rotation = start.rotation + ((angle - startAngle) * 180) / Math.PI;
          if (e.shiftKey) rotation = Math.round(rotation / 15) * 15;
          write(target, 'rotation', Math.round(rotation * 10) / 10, frame);
        }
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      useProjectStore.getState().end();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  return (
    <div
      className='pointer-events-auto absolute z-10 cursor-move border border-selection'
      style={{ left: cx - width / 2, top: cy - height / 2, width, height, rotate: `${t.rotation}deg` }}
      onPointerDown={e => gesture(e, 'move')}
    >
      {corners.map(([x, y]) => (
        <div
          key={`${x}${y}`}
          className='absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-selection bg-white'
          style={{ left: `${(x + 1) * 50}%`, top: `${(y + 1) * 50}%`, cursor: x === y ? 'nwse-resize' : 'nesw-resize' }}
          onPointerDown={e => gesture(e, 'scale')}
        />
      ))}
      <div className='absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-selection' />
      <div
        className='absolute -top-8 left-1/2 size-3 -translate-x-1/2 cursor-grab rounded-full border border-selection bg-white'
        onPointerDown={e => gesture(e, 'rotate')}
      />
    </div>
  );
}
