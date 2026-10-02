import { useState } from 'react';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadBlob, downloadUrl } from '@/lib/download';
import { projectDuration } from '@/features/editor/engine/edits';
import { timecode } from '@/features/editor/model/time';
import { getProject, useProjectStore } from '@/features/editor/store/project-store';
import { getFrame } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { Row, SelectRow } from '@/features/editor/ui/common';
import { toast } from '@/features/editor/ui/toasts';
import { EXTENSION, SHORT_SIDE, type ExportOptions } from '@/features/editor/remotion/constants';

interface Job {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  progress: number;
  url?: string;
  error?: string;
}

const POLL_MS = 1000;
const safeName = (name: string) => name.replace(/[^\w.-]+/g, '_') || 'export';

export async function captureStill() {
  const project = getProject();
  if (!Object.keys(project.clips).length) return toast('Add something to the timeline first', 'error');
  toast('Capturing frame…');
  const response = await fetch('/api/still', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, frame: getFrame() }),
  });
  if (!response.ok) return toast((await response.json()).error ?? 'Capture failed', 'error');
  downloadBlob(await response.blob(), `${safeName(project.name)}-${getFrame()}.png`);
}

export function ExportDialog() {
  const open = useUiStore(s => s.exportOpen);
  const setOpen = useUiStore(s => s.setExportOpen);
  const project = useProjectStore(s => s.project);
  const [options, setOptions] = useState<ExportOptions>({ codec: 'h264', resolution: 'match', range: 'all' });
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width, height, fps } = project.settings;
  const hasRange = project.inPoint !== null && project.outPoint !== null;
  const scale = options.resolution === 'match' ? 1 : SHORT_SIDE[options.resolution] / Math.min(width, height);
  const length =
    options.range === 'inout' && hasRange ? project.outPoint! - project.inPoint! : projectDuration(project);

  const start = async () => {
    setError(null);
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, options }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      let current: Job = body.video;
      setJob(current);
      while (current.status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, POLL_MS));
        current = (await (await fetch(`/api/render/${current.id}`)).json()).video;
        setJob(current);
      }
      if (current.status === 'FAILED') throw new Error(current.error ?? 'Render failed');
      toast('Export finished');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setJob(null);
    }
  };

  const close = (next: boolean) => {
    setOpen(next);
    if (!next && job?.status !== 'PENDING') setJob(null);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>Render the timeline to a video file.</DialogDescription>
        </DialogHeader>

        {!job && (
          <div className='space-y-2'>
            <Row label='Format'>
              <SelectRow
                label='Format'
                value={options.codec}
                onChange={codec => setOptions(o => ({ ...o, codec }))}
                options={[
                  { value: 'h264', label: 'H.264 (MP4)' },
                  { value: 'h265', label: 'H.265 / HEVC (MP4)' },
                  { value: 'prores', label: 'Apple ProRes 422 HQ (MOV)' },
                ]}
              />
            </Row>
            <Row label='Resolution'>
              <SelectRow
                label='Resolution'
                value={options.resolution}
                onChange={resolution => setOptions(o => ({ ...o, resolution }))}
                options={[
                  { value: 'match', label: `Match timeline (${width}×${height})` },
                  { value: '720p', label: '720p' },
                  { value: '1080p', label: '1080p' },
                  { value: '2k', label: '2K (1440p)' },
                  { value: '4k', label: '4K (2160p)' },
                ]}
              />
            </Row>
            <Row label='Range'>
              <SelectRow
                label='Range'
                value={options.range}
                onChange={range => setOptions(o => ({ ...o, range }))}
                options={[
                  { value: 'all', label: 'Entire timeline' },
                  ...(hasRange ? [{ value: 'inout' as const, label: 'In to Out' }] : []),
                ]}
              />
            </Row>
            <div className='rounded-md bg-base px-3 py-2 font-mono text-[11px] text-ink-3'>
              {Math.round((width * scale) / 2) * 2}×{Math.round((height * scale) / 2) * 2} · {fps} fps ·{' '}
              {timecode(length, fps)} · .{EXTENSION[options.codec]}
            </div>
            {error && (
              <div className='flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-xs text-danger'>
                <CircleX className='mt-px size-4 shrink-0' /> {error}
              </div>
            )}
          </div>
        )}

        {job && (
          <div className='flex flex-col items-center gap-3 py-6 text-center'>
            {job.status === 'COMPLETED' ? (
              <CircleCheck className='size-8 text-success' />
            ) : (
              <Loader2 className='size-8 animate-spin text-ink-3' />
            )}
            <div className='text-sm font-medium'>
              {job.status === 'COMPLETED' ? 'Export complete' : `Rendering… ${job.progress}%`}
            </div>
            <div className='h-1 w-full overflow-hidden rounded-full bg-white/10'>
              <div className='h-full bg-selection transition-[width]' style={{ width: `${job.progress}%` }} />
            </div>
            {job.status === 'PENDING' && (
              <div className='text-[11px] text-ink-4'>The first export prepares the renderer and takes longer.</div>
            )}
          </div>
        )}

        <DialogFooter>
          {job?.status === 'COMPLETED' && job.url ? (
            <Button onClick={() => downloadUrl(job.url!, `${safeName(project.name)}.${EXTENSION[options.codec]}`)}>
              Download
            </Button>
          ) : (
            <>
              <Button variant='ghost' onClick={() => close(false)}>
                {job ? 'Close' : 'Cancel'}
              </Button>
              {!job && (
                <Button onClick={start} disabled={!length}>
                  Export
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
