import { useEffect, useRef, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Droppable } from '@/components/ui/droppable';
import { DroppableArea } from '@/features/editor/scene/droppable';
import useStore from '@/features/editor/stores/use-store';
import useUploadStore from '@/features/editor/stores/use-upload-store';

const PADDING = 96;

const SceneEmpty = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [desiredSize, setDesiredSize] = useState<{ width: number; height: number } | null>(null);
  const size = useStore(state => state.size);
  const { addPendingUploads, processUploads } = useUploadStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const zoom = Math.min(
      (container.clientWidth - PADDING) / size.width,
      (container.clientHeight - PADDING) / size.height,
    );
    setDesiredSize({ width: size.width * zoom, height: size.height * zoom });
  }, [size]);

  const uploadFiles = (files: File[]) => {
    addPendingUploads(
      files.map(file => ({
        id: crypto.randomUUID(),
        file,
        type: file.type,
        status: 'pending' as const,
        progress: 0,
        addToTimeline: true,
      })),
    );
    processUploads();
  };

  return (
    <div ref={containerRef} className='absolute z-50 flex h-full w-full flex-1 bg-[#0E0E11]'>
      {desiredSize && (
        <Droppable onValueChange={uploadFiles} className='h-full w-full flex-1 bg-[#18181b]'>
          {open => (
            <DroppableArea
              onDragStateChange={setIsDraggingOver}
              className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-dashed text-center transition-colors duration-200 ease-in-out ${
                isDraggingOver ? 'border-white bg-white/10' : 'border-white/30'
              }`}
              style={desiredSize}
            >
              <button type='button' onClick={open} className='flex flex-col items-center justify-center gap-4 pb-12'>
                <span className='rounded-md border border-white/20 bg-[#27272A] p-2 text-white transition-colors duration-200 hover:bg-[#3F3F46]'>
                  <PlusIcon className='h-5 w-5' aria-hidden='true' />
                </span>
                <span className='flex flex-col gap-px'>
                  <span className='text-sm text-white'>Click to upload</span>
                  <span className='text-xs text-white/60'>Or drag and drop files here</span>
                </span>
              </button>
            </DroppableArea>
          )}
        </Droppable>
      )}
    </div>
  );
};

export default SceneEmpty;
