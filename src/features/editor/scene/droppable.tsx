import { useCallback, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import { dispatch } from '@designcombo/events';
import { ADD_AUDIO, ADD_IMAGE, ADD_VIDEO } from '@designcombo/state';
import { generateId } from '@designcombo/timeline';

const ADD_ACTIONS: Record<string, string> = {
  image: ADD_IMAGE,
  video: ADD_VIDEO,
  audio: ADD_AUDIO,
};

const draggedType = (event: DragEvent) => {
  try {
    const type = JSON.parse(event.dataTransfer.types[0] ?? '')?.type;
    return type in ADD_ACTIONS ? (type as string) : null;
  } catch {
    return null;
  }
};

interface DroppableAreaProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  onDragStateChange?: (dragging: boolean) => void;
}

export const DroppableArea = ({ children, className, style, onDragStateChange, id }: DroppableAreaProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const setDragging = useCallback(
    (dragging: boolean) => {
      setIsDraggingOver(dragging);
      onDragStateChange?.(dragging);
    },
    [onDragStateChange],
  );

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    if (draggedType(event)) setDragging(true);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    if (!isDraggingOver) return;
    event.preventDefault();
    setDragging(false);
    try {
      const data = JSON.parse(event.dataTransfer.getData(event.dataTransfer.types[0]));
      const action = ADD_ACTIONS[data.type];
      if (action) dispatch(action, { payload: { ...data, id: generateId() } });
    } catch {
      return;
    }
  };

  return (
    <div
      id={id}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={className}
      style={style}
      role='region'
      aria-label='Droppable area for images, videos, and audio'
    >
      {children}
    </div>
  );
};
