import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { nanoid } from 'nanoid';
import type { IDesign } from '@designcombo/types';
import { publicUrl, resolveKey } from '@/server/storage';

export interface RenderJob {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  progress: number;
  url?: string;
  error?: string;
}

const ENTRY = path.join(process.cwd(), 'src/features/editor/remotion/index.ts');

// ponytail: in-memory jobs on a single process; move to a queue + DB if this runs on more than one instance
const store = globalThis as typeof globalThis & { renderJobs?: Map<string, RenderJob>; renderBundle?: Promise<string> };
const jobs = (store.renderJobs ??= new Map());

const bundleOnce = () =>
  (store.renderBundle ??= import('@remotion/bundler')
    .then(({ bundle }) =>
      bundle({
        entryPoint: ENTRY,
        webpackOverride: config => ({
          ...config,
          resolve: {
            ...config.resolve,
            alias: { ...config.resolve?.alias, '@': path.join(process.cwd(), 'src') },
          },
        }),
      }),
    )
    .catch(error => {
      store.renderBundle = undefined;
      throw error;
    }));

const absolutize = (design: IDesign, origin: string): IDesign =>
  JSON.parse(JSON.stringify(design), (_, value) =>
    typeof value === 'string' && value.startsWith('/api/files/') ? `${origin}${value}` : value,
  );

async function run(job: RenderJob, design: IDesign) {
  try {
    const { renderMedia, selectComposition } = await import('@remotion/renderer');
    const serveUrl = await bundleOnce();
    const inputProps = { design };
    const composition = await selectComposition({ serveUrl, id: 'editor', inputProps });
    const key = `renders/${job.id}.mp4`;
    const outputLocation = resolveKey(key);
    await mkdir(path.dirname(outputLocation), { recursive: true });
    await renderMedia({
      serveUrl,
      composition,
      codec: 'h264',
      inputProps,
      outputLocation,
      onProgress: ({ progress }) => {
        job.progress = Math.round(progress * 100);
      },
    });
    Object.assign(job, { status: 'COMPLETED', progress: 100, url: publicUrl(key) });
  } catch (error) {
    Object.assign(job, { status: 'FAILED', error: error instanceof Error ? error.message : 'Render failed' });
  }
}

export function startRender(design: IDesign, origin: string) {
  const job: RenderJob = { id: nanoid(), status: 'PENDING', progress: 0 };
  jobs.set(job.id, job);
  run(job, absolutize(design, origin));
  return job;
}

export const getRenderJob = (id: string) => jobs.get(id);
