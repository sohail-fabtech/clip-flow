import { cloneElement, useEffect, useState, type DragEvent, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DraggableProps {
  children: ReactElement<{ draggable?: boolean; onDragStart?: (e: DragEvent) => void; onDragEnd?: () => void }>;
  renderCustomPreview?: ReactNode;
  data?: object;
  shouldDisplayPreview?: boolean;
}

const Draggable = ({ children, renderCustomPreview, data = {}, shouldDisplayPreview = true }: DraggableProps) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragging = position !== null;

  useEffect(() => {
    if (!dragging) return;
    const onDragOver = (event: globalThis.DragEvent) => {
      event.preventDefault();
      setPosition({ x: event.clientX, y: event.clientY });
    };
    document.addEventListener('dragover', onDragOver);
    return () => document.removeEventListener('dragover', onDragOver);
  }, [dragging]);

  const onDragStart = (event: DragEvent) => {
    const json = JSON.stringify(data);
    event.dataTransfer.setDragImage(new Image(), 0, 0);
    event.dataTransfer.setData(json, json);
    event.dataTransfer.effectAllowed = 'move';
    setPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      {cloneElement(children, { draggable: true, onDragStart, onDragEnd: () => setPosition(null) })}
      {position && shouldDisplayPreview && renderCustomPreview
        ? createPortal(
            <div
              className='pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2'
              style={{ left: position.x, top: position.y }}
            >
              {renderCustomPreview}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default Draggable;
