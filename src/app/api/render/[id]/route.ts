import { getRenderJob } from '@/server/render-jobs';

export async function GET(_request: Request, ctx: RouteContext<'/api/render/[id]'>) {
  const { id } = await ctx.params;
  const video = getRenderJob(id);
  if (!video) return Response.json({ error: 'Render not found' }, { status: 404 });
  return Response.json({ video });
}
