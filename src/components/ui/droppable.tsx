import type { ReactNode } from 'react';
import Dropzone, { type Accept } from 'react-dropzone';
import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DroppableProps {
  onValueChange: (files: File[]) => void;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children: (open: () => void) => ReactNode;
}

const MEDIA: Accept = { 'image/*': [], 'video/*': [], 'audio/*': [] };

export function Droppable({
  onValueChange,
  accept = MEDIA,
  maxSize = 2 * 1024 * 1024 * 1024,
  maxFiles = 10,
  disabled = false,
  className,
  children,
}: DroppableProps) {
  return (
    <Dropzone
      onDrop={accepted => accepted.length > 0 && onValueChange(accepted)}
      accept={accept}
      maxSize={maxSize}
      maxFiles={maxFiles}
      multiple={maxFiles > 1}
      disabled={disabled}
      noClick
    >
      {({ getRootProps, getInputProps, isDragActive, open }) => (
        <div
          {...getRootProps()}
          className={cn(
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled && 'pointer-events-none opacity-60',
            className,
          )}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <div className='flex h-full flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-600 bg-zinc-900'>
              <div className='rounded-full border border-dashed p-3'>
                <PlusIcon className='size-5 text-muted-foreground' aria-hidden='true' />
              </div>
              <p className='font-medium text-muted-foreground'>Drop the files here</p>
            </div>
          ) : (
            children(open)
          )}
        </div>
      )}
    </Dropzone>
  );
}
