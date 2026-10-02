import { useEffect, useRef } from 'react';
import type { Project } from '@/features/editor/model/types';
import { shortTime } from '@/features/editor/model/time';
import { upsertMarker } from '@/features/editor/engine/edits';
import { commit, useProjectStore } from '@/features/editor/store/project-store';
import { seek } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { HEADER_WIDTH, RULER_HEIGHT } from '@/features/editor/ui/timeline/geometry';

const STEPS_SECONDS = [1 / 30, 0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];

interface RulerProps {
  project: Project;
  zoom: number;
  width: number;
  scrollLeft: number;
  viewWidth: number;
}

export function Ruler({ project, zoom, width, scrollLeft, viewWidth }: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fps = project.settings.fps;
  const selectedMarker = useUiStore(s => s.selectedMarkerId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewWidth * dpr;
    canvas.height = RULER_HEIGHT * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, viewWidth, RULER_HEIGHT);
    const pxPerSecond = zoom * fps;
    const major = STEPS_SECONDS.find(step => step * pxPerSecond >= 90) ?? 3600;
    const minor = major / 5;
    const start = Math.floor(scrollLeft / pxPerSecond / minor) * minor;
    const end = (scrollLeft + viewWidth) / pxPerSecond;
    ctx.font = '10px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';
    for (let t = start; t <= end; t += minor) {
      const x = Math.round(t * pxPerSecond - scrollLeft) + 0.5;
      const isMajor = Math.abs(t / major - Math.round(t / major)) < 1e-6;
      ctx.fillStyle = isMajor ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)';
      ctx.fillRect(x, isMajor ? RULER_HEIGHT - 10 : RULER_HEIGHT - 5, 1, isMajor ? 10 : 5);
      if (isMajor) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        const frame = Math.round(t * fps);
        ctx.fillText(major < 1 ? `${shortTime(frame, fps)}:${String(frame % fps).padStart(2, '0')}` : shortTime(frame, fps), x + 4, 5);
      }
    }
  }, [zoom, fps, scrollLeft, viewWidth]);

  const frameAt = (clientX: number, element: HTMLElement) =>
    Math.max(0, Math.round((clientX - element.getBoundingClientRect().left) / zoom));

  return (
    <div
      className='relative cursor-text border-b border-line bg-surface'
      style={{ width, height: RULER_HEIGHT }}
      onPointerDown={e => {
        const element = e.currentTarget;
        element.setPointerCapture(e.pointerId);
        const anchor = frameAt(e.clientX, element);
        const history = useProjectStore.getState();
        if (e.shiftKey) {
          history.begin('Set range');
          element.onpointermove = ev => {
            const frame = frameAt(ev.clientX, element);
            history.update(draft => {
              draft.inPoint = Math.min(anchor, frame);
              draft.outPoint = Math.max(anchor, frame + 1);
            });
          };
        } else {
          seek(anchor);
          element.onpointermove = ev => seek(frameAt(ev.clientX, element));
        }
        element.onpointerup = () => {
          element.onpointermove = null;
          element.onpointerup = null;
          if (e.shiftKey) history.end();
        };
      }}
    >
      <canvas ref={canvasRef} className='pointer-events-none sticky block' style={{ left: HEADER_WIDTH, width: viewWidth, height: RULER_HEIGHT }} />
      {project.inPoint !== null && project.outPoint !== null && (
        <div
          className='pointer-events-none absolute bottom-0 h-1 bg-timecode/80'
          style={{ left: project.inPoint * zoom, width: (project.outPoint - project.inPoint) * zoom }}
        />
      )}
      {project.markers.map(marker => (
        <button
          key={marker.id}
          type='button'
          aria-label={marker.name}
          title={marker.name}
          className='absolute top-0 -translate-x-1/2'
          style={{ left: marker.frame * zoom }}
          onPointerDown={e => {
            e.stopPropagation();
            useUiStore.getState().selectMarker(marker.id);
            const startX = e.clientX;
            let frame = marker.frame;
            const move = (ev: PointerEvent) => {
              frame = Math.max(0, marker.frame + Math.round((ev.clientX - startX) / zoom));
              (e.target as HTMLElement).closest('button')!.style.left = `${frame * zoom}px`;
            };
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
              if (frame !== marker.frame) commit('Move marker', draft => upsertMarker(draft, { ...marker, frame }));
              else seek(marker.frame);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        >
          <svg width='10' height='12' viewBox='0 0 10 12'>
            <path d='M0 0h10v8l-5 4-5-4z' fill={marker.color} stroke={selectedMarker === marker.id ? '#fff' : '#000'} strokeWidth='1' />
          </svg>
          {marker.duration > 0 && (
            <span className='absolute top-0 left-1/2 h-1 opacity-70' style={{ width: marker.duration * zoom, background: marker.color }} />
          )}
        </button>
      ))}
    </div>
  );
}
