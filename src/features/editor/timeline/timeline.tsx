import { useEffect, useRef, useState, type UIEvent } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { filter, subject } from '@designcombo/events';
import type StateManager from '@designcombo/state';
import { TIMELINE_BOUNDING_CHANGED, timeMsToUnits, unitsToTimeMs } from '@designcombo/timeline';
import Header from '@/features/editor/timeline/header';
import Ruler from '@/features/editor/timeline/ruler';
import Playhead from '@/features/editor/timeline/playhead';
import CanvasTimeline from '@/features/editor/timeline/items/timeline';
import { Audio, Image, Text, Video } from '@/features/editor/timeline/items';
import useStore from '@/features/editor/stores/use-store';
import { useCurrentPlayerFrame } from '@/features/editor/hooks/use-current-frame';
import { useTimelineOffsetX } from '@/features/editor/hooks/use-timeline-offset';
import { useStateManagerEvents } from '@/features/editor/hooks/use-state-manager-events';
import { TIMELINE_OFFSET_CANVAS_LEFT, TIMELINE_OFFSET_CANVAS_RIGHT } from '@/features/editor/constants/constants';

CanvasTimeline.registerItems({ Text, Image, Audio, Video });

const EMPTY_SIZE = { width: 0, height: 0 };
const CHROME = { width: 40, height: 90 };

const Timeline = ({ stateManager }: { stateManager: StateManager }) => {
  const canScrollRef = useRef(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<CanvasTimeline | null>(null);
  const verticalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canvasSize, setCanvasSize] = useState(EMPTY_SIZE);
  const [size, setSize] = useState(EMPTY_SIZE);
  const { scale, playerRef, fps, duration, timeline, setTimeline } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef);
  const timelineOffsetX = useTimelineOffsetX();

  useStateManagerEvents(stateManager);

  useEffect(() => {
    const player = playerRef?.current;
    if (!player) return;
    const onPlay = () => (canScrollRef.current = true);
    const onPause = () => (canScrollRef.current = false);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [playerRef]);

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const scrollbar = horizontalScrollbarVpRef.current;
    if (!canvasEl || !scrollbar) return;

    const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom);
    const canvasRight = canvasEl.getBoundingClientRect().x + canvasEl.clientWidth;
    if (position - scrollLeft + 40 < canvasRight) return;

    const { clientWidth, scrollWidth, scrollLeft: current } = scrollbar;
    const remaining = (scrollWidth - (clientWidth + current)) / clientWidth;
    if (remaining < 0) return;
    scrollbar.scrollTo({ left: remaining > 1 ? current + clientWidth : scrollWidth - clientWidth });
  }, [currentFrame]);

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const container = timelineContainerRef.current;
    if (!canvasEl || !container) return;

    const width = container.clientWidth - CHROME.width;
    const height = container.clientHeight - CHROME.height;
    const canvas = new CanvasTimeline(canvasEl, {
      width,
      height,
      bounding: { width, height: 0 },
      selectionColor: 'rgba(0, 216, 214,0.1)',
      selectionBorderColor: 'rgba(0, 216, 214,1.0)',
      onScroll: ({ scrollTop, scrollLeft }) => {
        if (!horizontalScrollbarVpRef.current || !verticalScrollbarVpRef.current) return;
        verticalScrollbarVpRef.current.scrollTop = -scrollTop;
        horizontalScrollbarVpRef.current.scrollLeft = -scrollLeft;
        setScrollLeft(-scrollLeft);
      },
      onResizeCanvas: ({ width, height }) => setCanvasSize({ width, height }),
      scale,
      state: stateManager,
      duration,
      spacing: { left: TIMELINE_OFFSET_CANVAS_LEFT, right: TIMELINE_OFFSET_CANVAS_RIGHT },
      sizesMap: {
        text: 32,
        audio: 28,
        customTrack: 28,
        customTrack2: 28,
        linealAudioBars: 28,
        radialAudioBars: 28,
        waveAudioBars: 28,
        hillAudioBars: 28,
      },
      itemTypes: [
        'text',
        'image',
        'audio',
        'video',
        'helper',
        'track',
        'composition',
        'template',
        'linealAudioBars',
        'radialAudioBars',
        'progressFrame',
        'progressBar',
        'waveAudioBars',
        'hillAudioBars',
      ],
      acceptsMap: {
        text: ['text'],
        image: ['image', 'video'],
        video: ['video', 'image'],
        audio: ['audio'],
        template: ['template'],
        customTrack: ['video', 'image'],
        customTrack2: ['video', 'image'],
        main: ['video', 'image'],
        linealAudioBars: ['audio', 'linealAudioBars'],
        radialAudioBars: ['audio', 'radialAudioBars'],
        waveAudioBars: ['audio', 'waveAudioBars'],
        hillAudioBars: ['audio', 'hillAudioBars'],
      },
      guideLineColor: '#ffffff',
    });

    canvasRef.current = canvas;
    setCanvasSize({ width, height });
    setSize({ width, height: 0 });
    setTimeline(canvas);
    return () => canvas.purge();
  }, []);

  useEffect(() => {
    const subscription = subject
      .pipe(filter(({ key }) => key === TIMELINE_BOUNDING_CHANGED))
      .subscribe(({ value }) => {
        const bounding = value?.payload?.bounding;
        if (bounding) setSize({ width: bounding.width, height: bounding.height });
      });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const availableScroll = horizontalScrollbarVpRef.current?.scrollWidth;
    if (!availableScroll || !timeline) return;
    if (availableScroll < timeline.width + scrollLeft) {
      timeline.scrollTo({ scrollLeft: availableScroll - timeline.width });
    }
  }, [scale]);

  const handleOnScrollH = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft } = event.currentTarget;
    if (canScrollRef.current) canvasRef.current?.scrollTo({ scrollLeft });
    setScrollLeft(scrollLeft);
  };

  const handleOnScrollV = (event: UIEvent<HTMLDivElement>) => {
    if (canScrollRef.current) canvasRef.current?.scrollTo({ scrollTop: event.currentTarget.scrollTop });
  };

  const onClickRuler = (units: number) => {
    playerRef?.current?.seekTo((unitsToTimeMs(units, scale.zoom) * fps) / 1000);
  };

  const onRulerScroll = (nextScrollLeft: number) => {
    canvasRef.current?.scrollTo({ scrollLeft: nextScrollLeft });
    if (horizontalScrollbarVpRef.current) horizontalScrollbarVpRef.current.scrollLeft = nextScrollLeft;
    setScrollLeft(nextScrollLeft);
  };

  const allowScroll = () => (canScrollRef.current = true);
  const blockScroll = () => (canScrollRef.current = false);

  return (
    <div
      ref={timelineContainerRef}
      id='timeline-container'
      className='relative h-full w-full overflow-hidden border-t border-white/10 bg-[#0E0E11] text-white'
    >
      <Header />
      <Ruler onClick={onClickRuler} scrollLeft={scrollLeft} onScroll={onRulerScroll} />
      <Playhead scrollLeft={scrollLeft} />
      <div className='flex'>
        <div style={{ width: timelineOffsetX }} className='relative flex-none' />
        <div style={{ height: canvasSize.height }} className='relative flex-1'>
          <div style={{ height: canvasSize.height }} className='absolute top-0 w-full'>
            <canvas id='designcombo-timeline-canvas' ref={canvasElRef} />
          </div>
          <ScrollArea.Root
            type='always'
            style={{ position: 'absolute', width: 'calc(100vw - 40px)', height: '10px' }}
            className='ScrollAreaRootH'
            onPointerDown={allowScroll}
            onPointerUp={blockScroll}
          >
            <ScrollArea.Viewport
              onScroll={handleOnScrollH}
              className='ScrollAreaViewport'
              id='viewportH'
              ref={horizontalScrollbarVpRef}
            >
              <div
                style={{
                  width: size.width > canvasSize.width ? size.width + TIMELINE_OFFSET_CANVAS_RIGHT : size.width,
                }}
                className='pointer-events-none h-[10px]'
              />
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className='ScrollAreaScrollbar' orientation='horizontal'>
              <ScrollArea.Thumb onMouseDown={allowScroll} onMouseUp={blockScroll} className='ScrollAreaThumb' />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <ScrollArea.Root
            type='always'
            style={{ position: 'absolute', height: canvasSize.height, width: '10px' }}
            className='ScrollAreaRootV'
          >
            <ScrollArea.Viewport onScroll={handleOnScrollV} className='ScrollAreaViewport' ref={verticalScrollbarVpRef}>
              <div
                style={{ height: size.height > canvasSize.height ? size.height + 40 : canvasSize.height }}
                className='pointer-events-none w-[10px]'
              />
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className='ScrollAreaScrollbar' orientation='vertical'>
              <ScrollArea.Thumb onMouseDown={allowScroll} onMouseUp={blockScroll} className='ScrollAreaThumb' />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
