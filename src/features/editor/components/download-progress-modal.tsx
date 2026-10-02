import { CircleCheckIcon, CircleXIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDownloadState } from '@/features/editor/stores/use-download-state';
import { downloadUrl } from '@/features/editor/utils/download';

const DownloadProgressModal = () => {
  const { progress, displayProgressModal, output, error, actions } = useDownloadState();
  const close = () => actions.setDisplayProgressModal(false);

  return (
    <Dialog open={displayProgressModal} onOpenChange={actions.setDisplayProgressModal}>
      <DialogContent className='flex h-[627px] flex-col gap-0 bg-background p-0 text-white sm:max-w-[844px]'>
        <DialogTitle className='hidden'>Export</DialogTitle>
        <DialogDescription className='hidden'>Export progress</DialogDescription>
        <XIcon
          onClick={close}
          className='absolute right-4 top-5 h-5 w-5 text-zinc-400 hover:cursor-pointer hover:text-zinc-500'
        />
        <div className='flex h-16 items-center border-b px-4 font-medium'>Download</div>
        {error ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
            <CircleXIcon className='text-red-500' />
            <div className='font-bold'>Export failed</div>
            <div className='max-w-md text-zinc-400'>{error}</div>
            <Button variant='outline' onClick={close}>
              Close
            </Button>
          </div>
        ) : output ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
            <CircleCheckIcon />
            <div className='font-bold'>Exported</div>
            <div className='text-muted-foreground'>You can download the video to your device.</div>
            <Button onClick={() => downloadUrl(output.url, 'untitled.mp4')}>Download</Button>
          </div>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-4'>
            <div className='text-5xl font-semibold'>{Math.floor(progress)}%</div>
            <div className='font-bold'>Exporting...</div>
            <div className='text-center text-zinc-500'>Closing this window stops tracking the export.</div>
            <Button variant='outline' onClick={close}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadProgressModal;
