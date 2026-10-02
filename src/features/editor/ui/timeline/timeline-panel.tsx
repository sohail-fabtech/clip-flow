import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Project } from '@/features/editor/model/types';
import { clipEnd, projectDuration, trackClips } from '@/features/editor/engine/edits';
import { snap, snapPoints } from '@/features/editor/engine/snapping';
import * as actions from '@/features/editor/actions';
import { useProjectStore, getProject } from '@/features/editor/store/project-store';
import { getFrame, seek, usePlaybackStore } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { ClipItem } from '@/features/editor/ui/timeline/clip-item';
import { Ruler } from '@/features/editor/ui/timeline/ruler';
import { TrackHeader } from '@/features/editor/ui/timeline/track-header';
import { TimelineToolbar } from '@/features/editor/ui/timeline/toolbar';
import {
  ASSET_MIME,
  END_PADDING_PX,
  HEADER_WIDTH,
  RULER_HEIGHT,
  SNAP_PX,
  TRANSITION_MIME,
  trackHeight,
  useDragStore,
} from '@/features/editor/ui/timeline/geometry';
import { rowTops, trackAt } from '@/features/editor/ui/timeline/interactions';
import { openMenu } from '@/features/editor/ui/context-menu';
import { mod } from '@/features/editor/ui/common';
import { Plus } from 'lucide-react';
import type { TransitionType } from '@/features/editor/model/types';

function clipMenu(event: React.MouseEvent, project: Project, clipId: string) {
  const ui = useUiStore.getState();
  if (!ui.selection.includes(clipId)) ui.select([clipId]);
  const clip = project.clips[clipId];
  const hasAudio = clip.kind === 'video' && project.assets[clip.assetId]?.hasAudio && !clip.muted;
  openMenu(event, [
    { label: 'Split at playhead', shortcut: mod('K'), onSelect: actions.split },
    { label: 'Cut', shortcut: mod('X'), onSelect: actions.cut },
    { label: 'Copy', shortcut: mod('C'), onSelect: actions.copy },
    { label: 'Paste', shortcut: mod('V'), onSelect: actions.paste, disabled: !ui.clipboard.length },
    { label: 'Duplicate', shortcut: mod('D'), onSelect: actions.duplicate },
    'separator',
    { label: clip.linkId ? 'Unlink' : 'Link', onSelect: actions.toggleLink },
    { label: 'Detach audio', onSelect: actions.detach, disabled: !hasAudio },
    ...(clip.transitionIn ? [{ label: 'Remove transition', onSelect: () => actions.setTransitionAtCut(clipId, null) }] : []),
    'separator',
    { label: 'Delete', shortcut: '⌫', onSelect: () => actions.remove(false), danger: true },
    { label: 'Ripple delete', shortcut: '⇧⌫', onSelect: () => actions.remove(true), danger: true },
  ]);
}

export function TimelinePanel() {
  const project = useProjectStore(s => s.project);
  const zoom = useUiStore(s => s.zoom);
  const selection = useUiStore(s => s.selection);
  const snapIndicator = useUiStore(s => s.snapIndicator);
  const marquee = useDragStore(s => s.marquee);
  const dropGhost = useDragStore(s => s.dropGhost);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<{ frame: number; x: number } | null>(null);
  const [view, setView] = useState({ left: 0, width: 800 });

  const duration = projectDuration(project);
  const contentWidth = Math.max(duration * zoom + END_PADDING_PX, view.width);
  const viewStart = Math.max(0, view.left / zoom - 50);
  const viewEnd = (view.left + view.width) / zoom + 50;
  const { total: lanesHeight } = rowTops(project);

  const updateView = useCallback(() => {
    const el = scrollerRef.current;
    if (el) setView({ left: el.scrollLeft, width: el.clientWidth - HEADER_WIDTH });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateView();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateView);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(updateView);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [updateView]);

  useEffect(() => {
    const place = (frame: number, playing: boolean) => {
      const el = playheadRef.current;
      const scroller = scrollerRef.current;
      if (!el || !scroller) return;
      const x = frame * useUiStore.getState().zoom;
      el.style.transform = `translateX(${x}px)`;
      const viewWidth = scroller.clientWidth - HEADER_WIDTH;
      if (playing && (x < scroller.scrollLeft || x > scroller.scrollLeft + viewWidth - 40)) scroller.scrollLeft = x - 40;
    };
    place(getFrame(), false);
    const unsubPlayback = usePlaybackStore.subscribe(s => place(s.frame, s.playing));
    const unsubZoom = useUiStore.subscribe(s => place(getFrame(), false));
    return () => {
      unsubPlayback();
      unsubZoom();
    };
  }, []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const el = scrollerRef.current;
    if (!anchor || !el) return;
    el.scrollLeft = anchor.frame * zoom - anchor.x;
    anchorRef.current = null;
  }, [zoom]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.altKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - HEADER_WIDTH;
      const { zoom: current, setZoom } = useUiStore.getState();
      anchorRef.current = { frame: (el.scrollLeft + x) / current, x };
      setZoom(current * Math.exp(-e.deltaY * 0.01));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const pointerFrame = (clientX: number) => {
    const rect = lanesRef.current!.getBoundingClientRect();
    return Math.max(0, Math.round((clientX - rect.left) / zoom));
  };

  const onLanesPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('[data-clip]')) return;
    const rect = lanesRef.current!.getBoundingClientRect();
    const x1 = e.clientX - rect.left;
    const y1 = e.clientY - rect.top;
    const additive = e.shiftKey || e.metaKey;
    const base = additive ? useUiStore.getState().selection : [];
    if (!additive) useUiStore.getState().select([]);
    const { setMarquee } = useDragStore.getState();
    let moved = false;
    const move = (ev: PointerEvent) => {
      const x2 = ev.clientX - rect.left;
      const y2 = ev.clientY - rect.top;
      if (!moved && Math.hypot(x2 - x1, y2 - y1) < 4) return;
      moved = true;
      setMarquee({ x1, y1, x2, y2 });
      const project = getProject();
      const { tops } = rowTops(project);
      const [left, right] = [Math.min(x1, x2) / zoom, Math.max(x1, x2) / zoom];
      const [top, bottom] = [Math.min(y1, y2), Math.max(y1, y2)];
      const hits = Object.values(project.clips)
        .filter(c => {
          const track = project.tracks.find(t => t.id === c.trackId)!;
          const rowTop = tops.get(c.trackId)!;
          return c.start < right && clipEnd(c) > left && rowTop < bottom && rowTop + trackHeight(track.kind) > top;
        })
        .map(c => c.id);
      useUiStore.getState().select([...new Set([...base, ...hits])]);
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setMarquee(null);
      if (!moved) seek(pointerFrame(ev.clientX));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onDragOver = (e: React.DragEvent) => {
    const types = e.dataTransfer.types;
    if (!types.includes(ASSET_MIME) && !types.includes(TRANSITION_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!types.includes(ASSET_MIME)) return;
    const rect = lanesRef.current!.getBoundingClientRect();
    const track = trackAt(project, e.clientY - rect.top);
    let frame = pointerFrame(e.clientX);
    const hit = snap([frame], snapPoints(project, new Set(), getFrame()), SNAP_PX / zoom);
    if (hit) frame = hit.at;
    useDragStore.getState().setDropGhost(track ? { trackId: track.id, frame, duration: 0 } : null);
  };

  const onDrop = (e: React.DragEvent) => {
    useDragStore.getState().setDropGhost(null);
    const rect = lanesRef.current!.getBoundingClientRect();
    const track = trackAt(project, e.clientY - rect.top);
    let frame = pointerFrame(e.clientX);
    const assetId = e.dataTransfer.getData(ASSET_MIME);
    if (assetId) {
      e.preventDefault();
      const hit = snap([frame], snapPoints(project, new Set(), getFrame()), SNAP_PX / zoom);
      if (hit) frame = hit.at;
      actions.addAsset(assetId, track ? { trackId: track.id, frame } : undefined, e.metaKey || e.ctrlKey);
      return;
    }
    const transition = e.dataTransfer.getData(TRANSITION_MIME) as TransitionType;
    if (transition && track) {
      e.preventDefault();
      const clips = trackClips(project, track.id);
      const cut = clips
        .filter(c => clips.some(prev => clipEnd(prev) === c.start))
        .sort((a, b) => Math.abs(a.start - frame) - Math.abs(b.start - frame))[0];
      if (cut) actions.setTransitionAtCut(cut.id, { type: transition, duration: Math.round(project.settings.fps / 2) * 2 });
    }
  };

  return (
    <div className='flex h-full flex-col bg-base' role='region' aria-label='Timeline'>
      <TimelineToolbar viewWidth={view.width} />
      <div ref={scrollerRef} className='relative min-h-0 flex-1 overflow-auto'>
        <div className='relative' style={{ width: HEADER_WIDTH + contentWidth, minHeight: '100%' }}>
          <div className='sticky top-0 z-30 flex'>
            <div className='sticky left-0 z-50 flex items-center border-r border-b border-line bg-surface px-2 text-[10px] text-ink-4' style={{ width: HEADER_WIDTH, height: RULER_HEIGHT }}>
              <button type='button' onClick={() => actions.newTrack('video')} className='flex items-center gap-1 rounded px-1 py-0.5 hover:bg-white/8 hover:text-ink'>
                <Plus className='size-3' /> Video
              </button>
              <button type='button' onClick={() => actions.newTrack('audio')} className='flex items-center gap-1 rounded px-1 py-0.5 hover:bg-white/8 hover:text-ink'>
                <Plus className='size-3' /> Audio
              </button>
            </div>
            <Ruler project={project} zoom={zoom} width={contentWidth} scrollLeft={view.left} viewWidth={view.width} />
          </div>

          <div className='flex'>
            <div className='sticky left-0 z-40 flex flex-col'>
              {project.tracks.map(track => (
                <TrackHeader key={track.id} track={track} canDelete={project.tracks.filter(t => t.kind === track.kind).length > 1} />
              ))}
            </div>
            <div
              ref={lanesRef}
              data-lanes
              className='relative'
              style={{ width: contentWidth, height: lanesHeight }}
              onPointerDown={onLanesPointerDown}
              onDragOver={onDragOver}
              onDragLeave={() => useDragStore.getState().setDropGhost(null)}
              onDrop={onDrop}
              onContextMenu={e => {
                const id = (e.target as HTMLElement).closest('[data-clip]')?.getAttribute('data-clip');
                if (id) clipMenu(e, project, id);
              }}
            >
              {project.tracks.map(track => (
                <div
                  key={track.id}
                  className={`relative border-b border-line-subtle ${track.locked ? 'bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgba(255,255,255,0.03)_6px_12px)]' : ''} ${track.hidden || track.muted ? 'opacity-50' : ''}`}
                  style={{ height: trackHeight(track.kind) }}
                >
                  {trackClips(project, track.id)
                    .filter(c => clipEnd(c) >= viewStart && c.start <= viewEnd)
                    .map(clip => (
                      <ClipItem
                        key={clip.id}
                        clip={clip}
                        project={project}
                        height={trackHeight(track.kind)}
                        zoom={zoom}
                        viewStart={viewStart}
                        viewEnd={viewEnd}
                        selected={selection.includes(clip.id)}
                      />
                    ))}
                  {dropGhost?.trackId === track.id && (
                    <div className='pointer-events-none absolute top-0 h-full w-0.5 bg-selection' style={{ left: dropGhost.frame * zoom }} />
                  )}
                </div>
              ))}

              {project.inPoint !== null && project.outPoint !== null && (
                <div
                  className='pointer-events-none absolute top-0 h-full bg-timecode/5'
                  style={{ left: project.inPoint * zoom, width: (project.outPoint - project.inPoint) * zoom }}
                />
              )}
              {snapIndicator !== null && (
                <div className='pointer-events-none absolute top-0 z-30 h-full w-px bg-selection' style={{ left: snapIndicator * zoom }} />
              )}
              {marquee && (
                <div
                  className='pointer-events-none absolute z-30 border border-selection bg-selection/10'
                  style={{
                    left: Math.min(marquee.x1, marquee.x2),
                    top: Math.min(marquee.y1, marquee.y2),
                    width: Math.abs(marquee.x2 - marquee.x1),
                    height: Math.abs(marquee.y2 - marquee.y1),
                  }}
                />
              )}
            </div>
          </div>

          <div
            ref={playheadRef}
            className='pointer-events-none absolute top-0 z-[35] h-full'
            style={{ left: HEADER_WIDTH }}
          >
            <div className='absolute top-0 -left-[5px] h-3 w-[11px] rounded-b-[3px] bg-playhead' />
            <div className='absolute top-0 left-0 h-full w-px bg-playhead' />
          </div>
        </div>
      </div>
    </div>
  );
}
