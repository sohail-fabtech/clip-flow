import { useRef, type PointerEvent } from 'react';
import { timeMsToUnits, unitsToTimeMs } from '@designcombo/timeline';
import { useCurrentPlayerFrame } from '@/features/editor/hooks/use-current-frame';
import useStore from '@/features/editor/stores/use-store';
import { TIMELINE_OFFSET_CANVAS_LEFT } from '@/features/editor/constants/constants';
import { useTimelineOffsetX } from '@/features/editor/hooks/use-timeline-offset';

const Playhead = ({ scrollLeft }: { scrollLeft: number }) => {
  const { playerRef, fps, scale } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef);
  const timelineOffsetX = useTimelineOffsetX();
  const dragRef = useRef<{ startX: number; startPosition: number } | null>(null);
  const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom) - scrollLeft;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startPosition: position };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const units = drag.startPosition + event.clientX - drag.startX + scrollLeft;
    playerRef?.current?.seekTo((unitsToTimeMs(units, scale.zoom) * fps) / 1000);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className='absolute top-[50px] z-10 w-px cursor-pointer touch-none'
      style={{ left: timelineOffsetX + TIMELINE_OFFSET_CANVAS_LEFT + position, height: 'calc(100% - 40px)' }}
    >
      <div className='absolute top-0 h-4 w-2 -translate-x-1/2 rounded-b bg-white' />
      <div className='relative h-full'>
        <div className='absolute top-0 h-full w-3 -translate-x-1/2' />
        <div className='absolute top-0 h-full w-0.5 -translate-x-1/2 bg-white/80' />
      </div>
    </div>
  );
};

export default Playhead;
