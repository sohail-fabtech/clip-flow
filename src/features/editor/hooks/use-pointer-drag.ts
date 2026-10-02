import { useRef, useState, type PointerEvent } from 'react';

export interface DragMove<T> {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  state: T;
}

export function usePointerDrag<T>(onMove: (move: DragMove<T>) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; state: T } | null>(null);

  const dragProps = (state: T) => ({
    onPointerDown: (event: PointerEvent<Element>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      startRef.current = { x: event.clientX, y: event.clientY, state };
      setIsDragging(true);
    },
    onPointerMove: (event: PointerEvent<Element>) => {
      const start = startRef.current;
      if (!start) return;
      event.preventDefault();
      onMove({
        x: event.clientX,
        y: event.clientY,
        deltaX: event.clientX - start.x,
        deltaY: event.clientY - start.y,
        state: start.state,
      });
    },
    onPointerUp: () => {
      startRef.current = null;
      setIsDragging(false);
    },
  });

  return { dragProps, isDragging };
}
