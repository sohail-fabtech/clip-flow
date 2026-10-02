import { useCurrentPlayerFrame } from '@/features/editor/hooks/use-current-frame';
import useStore from '@/features/editor/stores/use-store';
import { useEffect, useRef, useState } from 'react';
import { timeMsToUnits, unitsToTimeMs } from '@/features/editor/utils/timeline';
import { TIMELINE_OFFSET_CANVAS_LEFT } from '@/features/editor/constants/constants';
import { useTimelineOffsetX } from '@/features/editor/hooks/use-timeline-offset';

const Playhead = ({ scrollLeft }) => {
  const playheadRef = useRef(null);
  const { playerRef, fps, scale } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef);
  const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom) - scrollLeft;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(position);
  const timelineOffsetX = useTimelineOffsetX();

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = e => {
    e.preventDefault(); // Prevent default drag behavior
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragStartPosition(position);
  };

  const handleMouseMove = e => {
    if (isDragging) {
      e.preventDefault(); // Prevent default drag behavior
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - dragStartX + scrollLeft;
      const newPosition = dragStartPosition + delta;

      const time = unitsToTimeMs(newPosition, scale.zoom);
      playerRef?.current?.seekTo((time * fps) / 1000);
    }
  };

  useEffect(() => {
    const preventDefaultDrag = e => {
      e.preventDefault();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
      document.addEventListener('dragstart', preventDefaultDrag);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('dragstart', preventDefaultDrag);
    }

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('dragstart', preventDefaultDrag);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={playheadRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onDragStart={e => e.preventDefault()}
      style={{
        position: 'absolute',
        left: timelineOffsetX + TIMELINE_OFFSET_CANVAS_LEFT + position,
        top: 50,
        width: 1,
        height: 'calc(100% - 40px)',
        zIndex: 10,
        cursor: 'pointer',
        touchAction: 'none', // Prevent default touch actions
      }}
    >
      <div
        style={{
          borderRadius: '0 0 4px 4px',
        }}
        className='absolute top-0 h-4 w-2 -translate-x-1/2 transform bg-black text-xs font-semibold text-zinc-800'
      />
      <div className='relative h-full'>
        <div className='absolute top-0 h-full w-3 -translate-x-1/2 transform' />
        <div className='absolute top-0 h-full w-0.5 -translate-x-1/2 transform bg-black/80' />
      </div>
    </div>
  );
};

export default Playhead;
