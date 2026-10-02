import type { IDesign } from '@designcombo/types';
import type { RenderJob } from '@/server/render-jobs';

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `Request failed with ${response.status}`);
  return body;
}

export async function startRender(design: IDesign) {
  const { video } = await request<{ video: RenderJob }>('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ design }),
  });
  return video;
}

export async function getRender(id: string) {
  const { video } = await request<{ video: RenderJob }>(`/api/render/${id}`);
  return video;
}
