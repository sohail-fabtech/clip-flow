import type { IDesign } from '@designcombo/types';
import { startRender } from '@/server/render-jobs';

export async function POST(request: Request) {
  const { design } = (await request.json()) as { design?: IDesign };
  if (!design?.trackItemsMap || !design.size || !design.fps) {
    return Response.json({ error: 'A valid design is required' }, { status: 400 });
  }
  if (!design.trackItemIds?.length) {
    return Response.json({ error: 'Add something to the timeline before exporting' }, { status: 400 });
  }
  return Response.json({ video: startRender(design, new URL(request.url).origin) });
}
