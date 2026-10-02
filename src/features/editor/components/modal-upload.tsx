import { useEffect, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileIcon, UploadIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import useUploadStore from '@/features/editor/stores/use-upload-store';

type MediaKind = 'all' | 'audio' | 'image' | 'video';

const ACCEPT: Record<MediaKind, string> = {
  all: 'audio/*,image/*,video/*',
  audio: 'audio/*',
  image: 'image/*',
  video: 'video/*',
};

const extractVideoThumbnail = (file: File) =>
  new Promise<string>(resolve => {
    const video = document.createElement('video');
    const src = URL.createObjectURL(file);
    video.src = src;
    video.currentTime = 1;
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(src);
      resolve(canvas.toDataURL('image/png'));
    };
    video.onerror = () => {
      URL.revokeObjectURL(src);
      resolve('');
    };
  });

const ModalUpload = ({ type = 'all' }: { type?: MediaKind }) => {
  const { setShowUploadModal, showUploadModal, setFiles, files, addPendingUploads, processUploads } = useUploadStore();
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [mediaUrl, setMediaUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showUploadModal) return;
    setFiles([]);
    setPreviews({});
    setMediaUrl('');
  }, [showUploadModal, setFiles]);

  const addFiles = async (list: FileList | null) => {
    const added = Array.from(list ?? [])
      .filter(file => !files.some(selected => selected.file.name === file.name))
      .map(file => ({ id: crypto.randomUUID(), file }));
    if (added.length === 0) return;

    setFiles(prev => [...added, ...prev]);
    const entries = await Promise.all(
      added.map(async ({ id, file }) => {
        if (file.type.startsWith('image/')) return [id, URL.createObjectURL(file)];
        if (file.type.startsWith('video/')) return [id, await extractVideoThumbnail(file)];
        return [id, ''];
      }),
    );
    setPreviews(prev => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  const onDrag = (event: DragEvent, over: boolean) => {
    event.preventDefault();
    setIsDragOver(over);
  };

  const handleUpload = () => {
    const url = mediaUrl.trim();
    addPendingUploads([
      ...files.map(({ id, file }) => ({ id, file, type: file.type, status: 'pending' as const, progress: 0 })),
      ...(url ? [{ id: crypto.randomUUID(), url, type: 'url', status: 'pending' as const, progress: 0 }] : []),
    ]);
    processUploads();
    setShowUploadModal(false);
  };

  return (
    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
      <DialogContent className='glass-bg border border-white/30'>
        <DialogHeader>
          <DialogTitle className='text-md text-white'>Upload media</DialogTitle>
        </DialogHeader>
        <div className='space-y-6'>
          <input
            type='file'
            accept={ACCEPT[type]}
            onChange={event => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
            multiple
            ref={fileInputRef}
            hidden
          />
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragOver ? 'border-white/60 bg-white/10' : 'border-border hover:border-muted-foreground/50'
            }`}
            onDragOver={event => onDrag(event, true)}
            onDragLeave={event => onDrag(event, false)}
            onDrop={event => {
              onDrag(event, false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <UploadIcon className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
            <p className='mb-2 text-sm text-muted-foreground'>Drag and drop files here, or</p>
            <Button onClick={() => fileInputRef.current?.click()} variant='outline' size='sm'>
              browse files
            </Button>
          </div>

          {files.length > 0 && (
            <div className='mt-2 flex flex-col gap-2'>
              <span className='text-xs text-muted-foreground'>Selected files:</span>
              <ScrollArea className='max-h-48'>
                <div className='flex flex-col gap-2'>
                  <AnimatePresence initial={false}>
                    {files.map(({ id, file }) => (
                      <motion.div
                        key={id}
                        className='relative flex w-full items-center justify-between rounded border p-1.5 shadow-sm sm:p-2'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        layout
                      >
                        <div className='flex flex-1 items-center gap-1 sm:gap-1.5 md:gap-2'>
                          {previews[id] ? (
                            <img
                              src={previews[id]}
                              alt={file.name}
                              className='h-5 w-5 rounded border object-cover sm:h-6 sm:w-6 md:h-8 md:w-8'
                            />
                          ) : (
                            <div className='flex h-5 w-5 items-center justify-center rounded border bg-muted sm:h-6 sm:w-6 md:h-8 md:w-8'>
                              <FileIcon className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3 md:h-4 md:w-4' />
                            </div>
                          )}
                          <div className='min-w-0'>
                            <div className='max-w-80 truncate text-xs text-muted-foreground' title={file.name}>
                              {file.name}
                            </div>
                            <div className='text-[9px] text-gray-400 sm:text-[10px]'>
                              {(file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          onClick={() => setFiles(prev => prev.filter(selected => selected.id !== id))}
                          size='icon'
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          )}

          <Input
            type='url'
            placeholder='Paste media link https://...'
            value={mediaUrl}
            onChange={event => setMediaUrl(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 && !mediaUrl.trim()}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUpload;
