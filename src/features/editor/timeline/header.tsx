import { useEffect, useState } from 'react';
import { Copy, SquareSplitHorizontal, Trash, ZoomIn, ZoomOut } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { ACTIVE_SPLIT, LAYER_CLONE, LAYER_DELETE, TIMELINE_SCALE_CHANGED } from '@designcombo/state';
import type { ITimelineScaleState } from '@designcombo/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Hint } from '@/components/ui/hint';
import { PLAYER_PAUSE, PLAYER_PLAY, PLAYER_SEEK } from '@/features/editor/constants/events';
import { currentTimeMs, frameToTimeString, timeToString } from '@/features/editor/utils/time';
import useStore from '@/features/editor/stores/use-store';
import {
  getFitZoomLevel,
  getNextZoomLevel,
  getPreviousZoomLevel,
  getZoomByIndex,
} from '@/features/editor/utils/timeline';
import { useCurrentPlayerFrame } from '@/features/editor/hooks/use-current-frame';
import useUpdateAncestors from '@/features/editor/hooks/use-update-ancestors';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { useTimelineOffsetX } from '@/features/editor/hooks/use-timeline-offset';

const IconPlayerPlayFilled = ({ size }: { size: number }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={size} viewBox='0 0 24 24' fill='currentColor'>
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z' />
  </svg>
);

const IconPlayerPauseFilled = ({ size }: { size: number }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={size} viewBox='0 0 24 24' fill='currentColor'>
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z' />
    <path d='M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z' />
  </svg>
);
const IconPlayerSkipBack = ({ size }: { size: number }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M20 5v14l-12 -7z' />
    <path d='M4 5l0 14' />
  </svg>
);

const IconPlayerSkipForward = ({ size }: { size: number }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M4 5v14l12 -7z' />
    <path d='M20 5l0 14' />
  </svg>
);
const Header = () => {
  const [playing, setPlaying] = useState(false);
  const { duration, fps, scale, playerRef, activeIds } = useStore();
  const isLargeScreen = useIsLargeScreen();
  useUpdateAncestors({ playing, playerRef });

  const currentFrame = useCurrentPlayerFrame(playerRef);

  const doActiveDelete = () => dispatch(LAYER_DELETE);
  const doActiveSplit = () => dispatch(ACTIVE_SPLIT, { payload: {}, options: { time: currentTimeMs(playerRef, fps) } });
  const seekTo = (time: number) => dispatch(PLAYER_SEEK, { payload: { time } });
  const changeScale = (scale: ITimelineScaleState) => dispatch(TIMELINE_SCALE_CHANGED, { payload: { scale } });

  useEffect(() => {
    const player = playerRef?.current;
    if (!player) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [playerRef]);

  return (
    <div
      style={{
        position: 'relative',
        height: '50px',
        flex: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: 50,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            height: 36,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: isLargeScreen ? '1fr 260px 1fr' : '1fr 1fr 1fr',
            alignItems: 'center',
          }}
        >
          <div className='flex px-2'>
            <Hint label='Delete' side='bottom' sideOffset={5}>
              <Button
                disabled={!activeIds.length}
                onClick={doActiveDelete}
                variant={'ghost'}
                size={isLargeScreen ? 'sm' : 'icon'}
                className='flex items-center gap-1 px-2 cursor-pointer'
              >
                <Trash size={14} /> <span className='hidden lg:block'>Delete</span>
              </Button>
            </Hint>

            <Hint label='Split' side='bottom' sideOffset={5}>
              <Button
                disabled={!activeIds.length}
                onClick={doActiveSplit}
                variant={'ghost'}
                size={isLargeScreen ? 'sm' : 'icon'}
                className='flex items-center gap-1 px-2 cursor-pointer'
              >
                <SquareSplitHorizontal size={15} /> <span className='hidden lg:block'>Split</span>
              </Button>
            </Hint>

            <Hint label='Clone' side='bottom' sideOffset={5}>
              <Button
                disabled={!activeIds.length}
                onClick={() => dispatch(LAYER_CLONE)}
                variant={'ghost'}
                size={isLargeScreen ? 'sm' : 'icon'}
                className='flex items-center gap-1 px-2 cursor-pointer'
              >
                <Copy size={15} /> <span className='hidden lg:block'>Clone</span>
              </Button>
            </Hint>
          </div>
          <div className='flex items-center justify-center'>
            <div className='flex items-center gap-1'>
              <Hint label='Skip Back' side='bottom' sideOffset={5}>
                <Button
                  className='hidden lg:inline-flex cursor-pointer'
                  onClick={() => seekTo(0)}
                  variant={'ghost'}
                  size={'icon'}
                  aria-label='Skip back'
                >
                  <IconPlayerSkipBack size={14} />
                </Button>
              </Hint>
              <Hint label='Play/Pause' side='bottom' sideOffset={5}>
                <Button
                  onClick={() => dispatch(playing ? PLAYER_PAUSE : PLAYER_PLAY)}
                  aria-label={playing ? 'Pause' : 'Play'}
                  variant={'ghost'}
                  size={'icon'}
                  className='cursor-pointer'
                >
                  {playing ? <IconPlayerPauseFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
                </Button>
              </Hint>
              <Hint label='Skip Forward' side='bottom' sideOffset={5}>
                <Button
                  className='hidden lg:inline-flex cursor-pointer'
                  onClick={() => seekTo(duration)}
                  variant={'ghost'}
                  size={'icon'}
                  aria-label='Skip forward'
                >
                  <IconPlayerSkipForward size={14} />
                </Button>
              </Hint>
            </div>
            <div
              className='text-xs font-light flex'
              style={{
                alignItems: 'center',
                gridTemplateColumns: '54px 4px 54px',
                paddingTop: '2px',
                justifyContent: 'center',
              }}
            >
              <div
                className=' text-zinc-500'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {frameToTimeString({ frame: currentFrame }, { fps })}
              </div>
              <span className='px-1'>|</span>
              <div
                className='text-muted-foreground hidden lg:block'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {timeToString({ time: duration })}
              </div>
            </div>
          </div>

          <ZoomControl scale={scale} onChangeTimelineScale={changeScale} duration={duration} />
        </div>
      </div>
    </div>
  );
};

interface ZoomControlProps {
  scale: ITimelineScaleState;
  onChangeTimelineScale: (scale: ITimelineScaleState) => void;
  duration: number;
}

const ZoomControl = ({ scale, onChangeTimelineScale, duration }: ZoomControlProps) => {
  const [localValue, setLocalValue] = useState(scale.index);
  const timelineOffsetX = useTimelineOffsetX();

  useEffect(() => {
    setLocalValue(scale.index);
  }, [scale.index]);

  const onZoomOutClick = () => {
    const previousZoom = getPreviousZoomLevel(scale);
    onChangeTimelineScale(previousZoom);
  };

  const onZoomInClick = () => {
    const nextZoom = getNextZoomLevel(scale);
    onChangeTimelineScale(nextZoom);
  };

  const onZoomFitClick = () => {
    const fitZoom = getFitZoomLevel(duration, scale.zoom, timelineOffsetX);
    onChangeTimelineScale(fitZoom);
  };

  return (
    <div className='flex items-center justify-end gap-4'>
      <div className='flex pr-2'>
        <Hint label='Zoom Out' side='bottom' sideOffset={5}>
          <Button size={'icon'} variant={'ghost'} onClick={onZoomOutClick} className='cursor-pointer'>
            <ZoomOut size={16} />
          </Button>
        </Hint>
        <Slider
          className='w-28 hidden lg:flex'
          value={[localValue]}
          min={0}
          max={12}
          step={1}
          trackColor='bg-gray-300'
          rangeColor='bg-[var(--primary)]'
          onValueChange={([value]) => setLocalValue(value)}
          onValueCommit={() => onChangeTimelineScale(getZoomByIndex(localValue))}
        />
        <Hint label='Zoom In' side='bottom' sideOffset={5}>
          <Button size={'icon'} variant={'ghost'} onClick={onZoomInClick} className='cursor-pointer'>
            <ZoomIn size={16} />
          </Button>
        </Hint>
        <Hint label='Zoom Fit' side='left' sideOffset={5}>
          <Button onClick={onZoomFitClick} variant={'ghost'} size={'icon'}>
            <svg xmlns='http://www.w3.org/2000/svg' width='16' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M20 8V6h-2q-.425 0-.712-.288T17 5t.288-.712T18 4h2q.825 0 1.413.588T22 6v2q0 .425-.288.713T21 9t-.712-.288T20 8M2 8V6q0-.825.588-1.412T4 4h2q.425 0 .713.288T7 5t-.288.713T6 6H4v2q0 .425-.288.713T3 9t-.712-.288T2 8m18 12h-2q-.425 0-.712-.288T17 19t.288-.712T18 18h2v-2q0-.425.288-.712T21 15t.713.288T22 16v2q0 .825-.587 1.413T20 20M4 20q-.825 0-1.412-.587T2 18v-2q0-.425.288-.712T3 15t.713.288T4 16v2h2q.425 0 .713.288T7 19t-.288.713T6 20zm2-6v-4q0-.825.588-1.412T8 8h8q.825 0 1.413.588T18 10v4q0 .825-.587 1.413T16 16H8q-.825 0-1.412-.587T6 14'
              />
            </svg>
          </Button>
        </Hint>
      </div>
    </div>
  );
};

export default Header;
