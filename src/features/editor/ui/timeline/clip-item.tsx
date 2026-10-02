import { memo, useEffect, useRef, useState } from 'react';
import { Link2, Type, Square, VolumeX } from 'lucide-react';
import type { Asset, Clip, Project } from '@/features/editor/model/types';
import { ANIMATABLE } from '@/features/editor/model/types';
import { getPeaks, getThumbs, PEAKS_PER_SECOND, type Thumbs } from '@/features/editor/media/analysis';
import { useUiStore } from '@/features/editor/store/ui-store';
import { seek } from '@/features/editor/store/playback-store';
import { commit } from '@/features/editor/store/project-store';
import { CLIP_COLOR, LABEL_HEIGHT, useDragStore } from '@/features/editor/ui/timeline/geometry';
import { beginClipGesture, rowTops } from '@/features/editor/ui/timeline/interactions';
import { cn } from '@/lib/utils';

interface ClipItemProps {
  clip: Clip;
  project: Project;
  height: number;
  zoom: number;
  viewStart: number;
  viewEnd: number;
  selected: boolean;
}

function Filmstrip({ asset, clip, zoom, width, offset, fps }: { asset: Asset; clip: Clip; zoom: number; width: number; offset: number; fps: number }) {
  const [thumbs, setThumbs] = useState<Thumbs | null>(null);
  useEffect(() => {
    let alive = true;
    getThumbs(asset.src, asset.durationSec).then(t => alive && setThumbs(t));
    return () => {
      alive = false;
    };
  }, [asset.src, asset.durationSec]);
  if (!thumbs || clip.kind !== 'video') return null;
  const tile = thumbs.width;
  const first = Math.floor(offset / tile);
  const count = Math.ceil(width / tile) + 1;
  return (
    <div className='absolute inset-0 overflow-hidden'>
      {Array.from({ length: count }, (_, i) => {
        const x = (first + i) * tile;
        const seconds = (clip.sourceIn + (x / zoom) * clip.speed) / fps;
        const index = Math.min(thumbs.frames.length - 1, Math.max(0, Math.floor(seconds / thumbs.interval)));
        return (
          <img
            key={first + i}
            alt=''
            draggable={false}
            src={thumbs.frames[index]}
            className='absolute top-0 h-full object-cover'
            style={{ left: x - offset, width: tile }}
          />
        );
      })}
    </div>
  );
}

function Waveform({ asset, clip, zoom, width, offset, fps }: { asset: Asset; clip: Clip; zoom: number; width: number; offset: number; fps: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  useEffect(() => {
    let alive = true;
    getPeaks(asset.src).then(p => alive && setPeaks(p));
    return () => {
      alive = false;
    };
  }, [asset.src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || (clip.kind !== 'audio' && clip.kind !== 'video')) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.min(4096, Math.round(width)));
    const h = canvas.clientHeight || 24;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const gain = 10 ** (clip.audio.volumeDb / 20);
    for (let x = 0; x < w; x++) {
      const frameA = clip.sourceIn + ((offset + x) / zoom) * clip.speed;
      const frameB = clip.sourceIn + ((offset + x + 1) / zoom) * clip.speed;
      const a = Math.floor((frameA / fps) * PEAKS_PER_SECOND);
      const b = Math.max(a + 1, Math.floor((frameB / fps) * PEAKS_PER_SECOND));
      let peak = 0;
      for (let i = a; i < b && i < peaks.length; i++) peak = Math.max(peak, peaks[i]);
      const bar = Math.max(1, Math.min(1, peak * gain) * (h - 2));
      ctx.fillRect(x, h - bar - 1, 1, bar);
    }
  }, [peaks, zoom, width, offset, fps, clip]);

  return <canvas ref={canvasRef} className='absolute bottom-0 left-0 h-full' style={{ width: Math.min(4096, width) }} />;
}

export const ClipItem = memo(function ClipItem({ clip, project, height, zoom, viewStart, viewEnd, selected }: ClipItemProps) {
  const drag = useDragStore(s => (s.drag?.ids.includes(clip.id) ? s.drag : null));

  let start = clip.start;
  let duration = clip.duration;
  let translateY = 0;
  if (drag) {
    if (drag.mode === 'move') {
      start += drag.delta;
      if (drag.trackShift) {
        const { tops } = rowTops(project);
        const index = project.tracks.findIndex(t => t.id === clip.trackId);
        const target = project.tracks[index + drag.trackShift];
        if (target) translateY = tops.get(target.id)! - tops.get(clip.trackId)!;
      }
    }
    if (drag.mode === 'trim-start') {
      start += drag.delta;
      duration -= drag.delta;
    }
    if (drag.mode === 'trim-end') duration += drag.delta;
  }

  const left = start * zoom;
  const width = Math.max(2, duration * zoom);
  const visibleLeft = Math.max(left, viewStart * zoom);
  const visibleRight = Math.min(left + width, viewEnd * zoom);
  const asset = 'assetId' in clip ? project.assets[clip.assetId] : undefined;
  const bodyHeight = height - LABEL_HEIGHT - 4;
  const muted = clip.kind === 'video' && clip.muted;
  const tool = useUiStore(s => s.tool);
  const transition = clip.transitionIn;

  const keyframeFrames = selected ? [...new Set(ANIMATABLE.flatMap(p => clip.keyframes[p]?.map(k => k.frame) ?? []))] : [];

  return (
    <div
      data-clip={clip.id}
      onPointerDown={e => e.button === 0 && beginClipGesture(e, clip.id, 'move')}
      className={cn(
        'absolute top-0.5 overflow-hidden rounded-[4px] border select-none',
        selected ? 'z-10 border-white' : 'border-black/80',
        drag && 'opacity-80 shadow-lg',
        tool === 'razor' ? 'cursor-crosshair' : tool === 'trim' ? 'cursor-ew-resize' : 'cursor-grab active:cursor-grabbing',
      )}
      style={{ left, width, height: height - 4, backgroundColor: CLIP_COLOR[clip.kind], translate: `0 ${translateY}px` }}
    >
      <div className='flex items-center gap-1 overflow-hidden bg-black/25 px-1.5 text-[10px] leading-none font-medium text-white/90' style={{ height: LABEL_HEIGHT }}>
        {clip.linkId && <Link2 className='size-2.5 shrink-0' />}
        {muted && <VolumeX className='size-2.5 shrink-0' />}
        {clip.kind === 'text' && <Type className='size-2.5 shrink-0' />}
        {clip.kind === 'shape' && <Square className='size-2.5 shrink-0' />}
        <span className='truncate'>{clip.kind === 'text' ? clip.text.content : clip.name}</span>
        {(clip.kind === 'video' || clip.kind === 'audio') && clip.speed !== 1 && <span className='ml-auto shrink-0 text-white/60'>{clip.speed}×</span>}
      </div>
      <div className='relative' style={{ height: bodyHeight }}>
        {visibleRight > visibleLeft && asset && (
          <div className='absolute top-0 h-full' style={{ left: visibleLeft - left, width: visibleRight - visibleLeft }}>
            {clip.kind === 'video' && (
              <Filmstrip asset={asset} clip={clip} zoom={zoom} width={visibleRight - visibleLeft} offset={visibleLeft - left} fps={project.settings.fps} />
            )}
            {clip.kind === 'image' && (
              <div className='absolute inset-0 bg-repeat-x opacity-80' style={{ backgroundImage: `url(${asset.src})`, backgroundSize: 'auto 100%' }} />
            )}
            {clip.kind === 'audio' && (
              <Waveform asset={asset} clip={clip} zoom={zoom} width={visibleRight - visibleLeft} offset={visibleLeft - left} fps={project.settings.fps} />
            )}
          </div>
        )}
        {clip.kind === 'text' && <div className='truncate px-1.5 pt-1 text-[11px] text-white/70'>{clip.text.caption ? 'Caption' : 'Text'}</div>}
      </div>

      {transition && (
        <div
          className='absolute top-0 left-0 h-full border-r border-white/40 bg-white/20'
          style={{ width: Math.max(4, transition.duration * zoom * 0.5) }}
          title={`Transition: ${transition.type}`}
        />
      )}

      {keyframeFrames.map(frame => (
        <button
          key={frame}
          type='button'
          aria-label={`Keyframe at ${frame}`}
          className='absolute bottom-0.5 z-20 size-2 -translate-x-1/2 rotate-45 border border-black bg-timecode'
          style={{ left: frame * zoom }}
          onPointerDown={e => {
            e.stopPropagation();
            const startX = e.clientX;
            let delta = 0;
            const move = (ev: PointerEvent) => {
              delta = Math.round((ev.clientX - startX) / zoom);
              (e.target as HTMLElement).style.translate = `${delta * zoom}px 0`;
            };
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
              (e.target as HTMLElement).style.translate = '';
              if (!delta) return seek(clip.start + frame);
              const target = Math.min(clip.duration - 1, Math.max(0, frame + delta));
              commit('Move keyframe', draft => {
                const c = draft.clips[clip.id];
                for (const prop of ANIMATABLE) {
                  const list = c.keyframes[prop];
                  if (!list) continue;
                  const k = list.find(x => x.frame === frame);
                  if (!k) continue;
                  c.keyframes[prop] = [...list.filter(x => x !== k && x.frame !== target), { ...k, frame: target }].sort((a, b) => a.frame - b.frame);
                }
              });
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        />
      ))}

      {tool === 'select' && (
        <>
          <div className='absolute top-0 left-0 z-10 h-full w-1.5 cursor-w-resize hover:bg-white/40' onPointerDown={e => beginClipGesture(e, clip.id, 'trim-start')} />
          <div className='absolute top-0 right-0 z-10 h-full w-1.5 cursor-e-resize hover:bg-white/40' onPointerDown={e => beginClipGesture(e, clip.id, 'trim-end')} />
        </>
      )}
    </div>
  );
});
