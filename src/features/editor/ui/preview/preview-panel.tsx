import { useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import {
  Camera,
  ChevronFirst,
  ChevronLast,
  Expand,
  Grid2x2,
  Pause,
  Play,
  Repeat,
  StepBack,
  StepForward,
} from 'lucide-react';
import { EditorComposition } from '@/features/editor/render/composition';
import { projectDuration } from '@/features/editor/engine/edits';
import { timecode } from '@/features/editor/model/time';
import { useProjectStore } from '@/features/editor/store/project-store';
import { seek, togglePlay, usePlaybackStore } from '@/features/editor/store/playback-store';
import { stepFrames } from '@/features/editor/actions';
import { IconButton, mod } from '@/features/editor/ui/common';
import { TransformOverlay } from '@/features/editor/ui/preview/transform-overlay';
import { captureStill } from '@/features/editor/ui/dialogs/export-dialog';

type ZoomMode = 'fit' | 0.5 | 1 | 2;
const PADDING = 24;

function Timecode() {
  const frame = usePlaybackStore(s => s.frame);
  const project = useProjectStore(s => s.project);
  const fps = project.settings.fps;
  return (
    <div className='flex items-center gap-1.5 font-mono text-xs tabular-nums'>
      <span className='text-timecode'>{timecode(frame, fps)}</span>
      <span className='text-ink-4'>/</span>
      <span className='text-ink-3'>{timecode(projectDuration(project), fps)}</span>
    </div>
  );
}

export function PreviewPanel() {
  const project = useProjectStore(s => s.project);
  const playing = usePlaybackStore(s => s.playing);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [guides, setGuides] = useState(false);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const { width, height, fps } = project.settings;
  const duration = Math.max(1, projectDuration(project));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const { setPlayer, setFrame, setPlaying } = usePlaybackStore.getState();
    setPlayer(player);
    player.seekTo(usePlaybackStore.getState().frame);
    const onFrame = (e: { detail: { frame: number } }) => {
      setFrame(e.detail.frame);
      const { inPoint, outPoint } = useProjectStore.getState().project;
      if (loopRef.current && player.isPlaying() && inPoint !== null && outPoint !== null && e.detail.frame >= outPoint)
        player.seekTo(inPoint);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('seeked', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('seeked', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      setPlayer(null);
    };
  }, []);

  const fit = Math.max(0.01, Math.min((box.width - PADDING) / width, (box.height - PADDING) / height));
  const scale = zoomMode === 'fit' ? fit : zoomMode;
  const playerWidth = width * scale;
  const playerHeight = height * scale;
  const offsetX = Math.max(0, (box.width - playerWidth) / 2);
  const offsetY = Math.max(0, (box.height - playerHeight) / 2);

  return (
    <div className='flex h-full flex-col bg-base' role='region' aria-label='Preview'>
      <div ref={containerRef} data-preview className='relative min-h-0 flex-1 overflow-auto bg-[#0f1012]'>
        <div className='absolute' style={{ left: offsetX, top: offsetY, width: playerWidth, height: playerHeight }}>
          <Player
            ref={playerRef}
            component={EditorComposition}
            inputProps={{ project }}
            durationInFrames={duration}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            style={{ width: '100%', height: '100%' }}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            moveToBeginningWhenEnded={false}
            acknowledgeRemotionLicense
          />
          {guides && (
            <div className='pointer-events-none absolute inset-0'>
              <div className='absolute inset-[5%] border border-dashed border-white/35' />
              <div className='absolute inset-[10%] border border-dashed border-white/20' />
              <div className='absolute top-1/2 left-0 h-px w-full bg-white/15' />
              <div className='absolute top-0 left-1/2 h-full w-px bg-white/15' />
            </div>
          )}
        </div>
        <TransformOverlay scale={scale} offsetX={offsetX} offsetY={offsetY} />
      </div>

      <div className='grid h-10 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t border-line bg-surface px-2'>
        <Timecode />
        <div className='flex items-center gap-0.5'>
          <IconButton label='Go to start' shortcut='Home' onClick={() => seek(0)}>
            <ChevronFirst />
          </IconButton>
          <IconButton label='Step backward' shortcut='←' onClick={() => stepFrames(-1)}>
            <StepBack />
          </IconButton>
          <IconButton
            label={playing ? 'Pause' : 'Play'}
            shortcut='Space'
            onClick={togglePlay}
            className='size-8 [&_svg]:size-5'
          >
            {playing ? <Pause fill='currentColor' /> : <Play fill='currentColor' />}
          </IconButton>
          <IconButton label='Step forward' shortcut='→' onClick={() => stepFrames(1)}>
            <StepForward />
          </IconButton>
          <IconButton label='Go to end' shortcut='End' onClick={() => seek(duration)}>
            <ChevronLast />
          </IconButton>
          <IconButton label='Loop in/out range' active={loop} onClick={() => setLoop(l => !l)}>
            <Repeat />
          </IconButton>
        </div>
        <div className='flex items-center justify-end gap-1'>
          <span className='px-1 font-mono text-[11px] text-ink-4'>
            {width}×{height} · {fps}
          </span>
          <select
            aria-label='Preview zoom'
            value={String(zoomMode)}
            onChange={e => setZoomMode(e.target.value === 'fit' ? 'fit' : (Number(e.target.value) as ZoomMode))}
            className='h-6 rounded border border-line bg-base px-1 text-[11px] text-ink-2 outline-none'
          >
            <option value='fit'>Fit</option>
            <option value='0.5'>50%</option>
            <option value='1'>100%</option>
            <option value='2'>200%</option>
          </select>
          <IconButton label='Safe guides' active={guides} onClick={() => setGuides(g => !g)}>
            <Grid2x2 />
          </IconButton>
          <IconButton label='Capture frame' shortcut={mod('⇧E')} onClick={captureStill}>
            <Camera />
          </IconButton>
          <IconButton label='Fullscreen' onClick={() => playerRef.current?.requestFullscreen()}>
            <Expand />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
