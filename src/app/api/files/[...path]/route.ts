import { contentTypeOf, isUploadType, saveFile, streamFile } from '@/server/storage';

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

export async function GET(request: Request, ctx: RouteContext<'/api/files/[...path]'>) {
  const { path } = await ctx.params;
  try {
    const response = await streamFile(path.join('/'), request.headers.get('range'));
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, ctx: RouteContext<'/api/files/[...path]'>) {
  const { path } = await ctx.params;
  const key = path.join('/');
  if (!key.startsWith('uploads/') || !isUploadType(contentTypeOf(key))) {
    return Response.json({ error: 'Unsupported file' }, { status: 400 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_UPLOAD_BYTES) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }
  try {
    await saveFile(key, new Uint8Array(await request.arrayBuffer()));
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: 'Invalid path' }, { status: 400 });
  }
}
