const ALLOWED = new Set(['v1/search', 'v1/curated', 'videos/search', 'videos/popular']);

export async function GET(request: Request, ctx: RouteContext<'/api/pexels/[...path]'>) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return Response.json({ error: 'PEXELS_API_KEY is not configured' }, { status: 501 });

  const path = (await ctx.params).path.join('/');
  if (!ALLOWED.has(path)) return Response.json({ error: 'Not found' }, { status: 404 });

  const response = await fetch(`https://api.pexels.com/${path}${new URL(request.url).search}`, {
    headers: { Authorization: apiKey },
  });
  if (!response.ok) return Response.json({ error: `Pexels error ${response.status}` }, { status: response.status });
  return Response.json(await response.json());
}
