import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  PREVIEW_FRAME_WIDTH,
  SECONDARY_FONT,
  SMALL_FONT_SIZE,
  TIMELINE_OFFSET_CANVAS_LEFT,
} from '@/features/editor/constants/constants';
import { formatTimelineUnit } from '@/features/editor/utils/format';
import useStore from '@/features/editor/stores/use-store';
import { useTimelineOffsetX } from '@/features/editor/hooks/use-timeline-offset';

const HEIGHT = 40;
const SHORT_LINE = 10;
const LINE_ORIGIN_Y = 18;
const TEXT_OFFSET_Y = 17;
const DRAG_THRESHOLD = 5;

interface RulerProps {
  scrollLeft: number;
  onClick: (units: number) => void;
  onScroll: (scrollLeft: number) => void;
}

const Ruler = ({ scrollLeft, onClick, onScroll }: RulerProps) => {
  const timelineOffsetX = useTimelineOffsetX();
  const scale = useStore(state => state.scale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startScroll: number; dragged: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const offsetX = timelineOffsetX + TIMELINE_OFFSET_CANVAS_LEFT;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const draw = () => {
      const width = canvas.offsetParent instanceof HTMLElement ? canvas.offsetParent.offsetWidth : canvas.offsetWidth;
      canvas.width = width;
      canvas.height = HEIGHT;

      const { zoom, unit, segments } = scale;
      const zoomUnit = unit * zoom * PREVIEW_FRAME_WIDTH;
      const minRange = Math.floor(scrollLeft / zoomUnit);
      const maxRange = Math.ceil((scrollLeft + width) / zoomUnit);

      context.clearRect(0, 0, width, HEIGHT);
      context.save();
      context.fillStyle = '#71717a';
      context.strokeStyle = '#52525b';
      context.lineWidth = 1;
      context.font = `${SMALL_FONT_SIZE}px ${SECONDARY_FONT}`;
      context.textBaseline = 'top';
      context.translate(0.5, 0);

      for (let value = Math.max(0, minRange); value <= maxRange; value++) {
        const startPos = value * zoomUnit - scrollLeft;
        if (startPos < -zoomUnit || startPos >= width + zoomUnit) continue;
        const text = formatTimelineUnit((value * zoomUnit) / zoom);
        context.fillText(text, startPos + offsetX - context.measureText(text).width / 2, TEXT_OFFSET_Y);

        for (let segment = 1; segment < segments; segment++) {
          const x = startPos + offsetX + (segment / segments) * zoomUnit;
          if (x < 0 || x >= width) continue;
          context.beginPath();
          context.moveTo(x, LINE_ORIGIN_Y);
          context.lineTo(x, LINE_ORIGIN_Y + SHORT_LINE);
          context.stroke();
        }
      }
      context.restore();
    };

    draw();
    const observer = new ResizeObserver(draw);
    if (canvas.offsetParent) observer.observe(canvas.offsetParent);
    return () => observer.disconnect();
  }, [scale, scrollLeft, offsetX]);

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startScroll: scrollLeft, dragged: false };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = drag.startX - event.clientX;
    if (!drag.dragged && Math.abs(delta) <= DRAG_THRESHOLD) return;
    drag.dragged = true;
    onScroll(Math.max(0, drag.startScroll + delta));
  };

  const onPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!drag || drag.dragged) return;
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    onClick(x + scrollLeft - offsetX);
  };

  return (
    <div className='relative w-full border-t border-white/10' style={{ height: HEIGHT }}>
      <canvas
        ref={canvasRef}
        height={HEIGHT}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        className='block w-full touch-none'
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      />
    </div>
  );
};

export default Ruler;
