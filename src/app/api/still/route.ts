import type { Project } from '@/features/editor/model/types';
import { renderFrame } from '@/server/render-jobs';

export async function POST(request: Request) {
  const { project, frame } = (await request.json()) as { project?: Project; frame?: number };
  if (!project?.clips || typeof frame !== 'number') {
    return Response.json({ error: 'A project and frame are required' }, { status: 400 });
  }
  try {
    const png = await renderFrame(project, frame, new URL(request.url).origin);
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Capture failed' }, { status: 500 });
  }
}
