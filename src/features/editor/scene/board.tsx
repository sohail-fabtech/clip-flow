import { useState, type ReactNode } from 'react';
import { DroppableArea } from '@/features/editor/scene/droppable';

const SceneBoard = ({ size, children }: { size: { width: number; height: number }; children: ReactNode }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  return (
    <DroppableArea id='artboard' onDragStateChange={setIsDraggingOver} style={size} className='pointer-events-auto'>
      <div
        style={size}
        className={`pointer-events-none absolute z-50 border transition-colors duration-200 ease-in-out ${
          isDraggingOver ? 'border-4 border-dashed border-white/60 bg-white/10' : 'border-white/20 bg-transparent'
        } shadow-[0_0_0_5000px_#18181b]`}
      />
      {children}
    </DroppableArea>
  );
};

export default SceneBoard;
