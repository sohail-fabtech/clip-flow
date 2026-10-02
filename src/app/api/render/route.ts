import type { Project } from '@/features/editor/model/types';
import type { ExportOptions } from '@/features/editor/remotion/constants';
import { startRender } from '@/server/render-jobs';

const CODECS = new Set(['h264', 'h265', 'prores']);
const RESOLUTIONS = new Set(['match', '720p', '1080p', '2k', '4k']);

export async function POST(request: Request) {
  const { project, options } = (await request.json()) as { project?: Project; options?: ExportOptions };
  if (!project?.clips || !project.settings?.fps) {
    return Response.json({ error: 'A valid project is required' }, { status: 400 });
  }
  if (!Object.keys(project.clips).length) {
    return Response.json({ error: 'Add something to the timeline before exporting' }, { status: 400 });
  }
  if (!options || !CODECS.has(options.codec) || !RESOLUTIONS.has(options.resolution)) {
    return Response.json({ error: 'Invalid export options' }, { status: 400 });
  }
  return Response.json({ video: startRender(project, options, new URL(request.url).origin) });
}
