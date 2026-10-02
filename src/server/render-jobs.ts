import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { nanoid } from 'nanoid';
import type { Project } from '@/features/editor/model/types';
import { publicUrl, resolveKey } from '@/server/storage';
import { COMPOSITION_ID, EXTENSION, SHORT_SIDE, type ExportOptions } from '@/features/editor/remotion/constants';

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

const absolutize = (project: Project, origin: string): Project =>
  JSON.parse(JSON.stringify(project), (_, value) =>
    typeof value === 'string' && value.startsWith('/api/files/') ? `${origin}${value}` : value,
  );

const GL = process.platform === 'darwin' ? 'angle' : 'swangle';

async function run(job: RenderJob, project: Project, options: ExportOptions) {
  try {
    const { renderMedia, selectComposition } = await import('@remotion/renderer');
    const serveUrl = await bundleOnce();
    const inputProps = { project };
    const chromiumOptions = { gl: GL } as const;
    const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps, chromiumOptions });
    const key = `renders/${job.id}.${EXTENSION[options.codec]}`;
    const outputLocation = resolveKey(key);
    await mkdir(path.dirname(outputLocation), { recursive: true });
    const shortSide = Math.min(composition.width, composition.height);
    const scale = options.resolution === 'match' ? 1 : SHORT_SIDE[options.resolution] / shortSide;
    const range =
      options.range === 'inout' &&
      project.inPoint !== null &&
      project.outPoint !== null &&
      project.outPoint > project.inPoint
        ? ([project.inPoint, Math.min(project.outPoint, composition.durationInFrames) - 1] as [number, number])
        : null;
    await renderMedia({
      serveUrl,
      composition,
      codec: options.codec,
      inputProps,
      outputLocation,
      scale,
      chromiumOptions,
      frameRange: range,
      proResProfile: options.codec === 'prores' ? 'hq' : undefined,
      onProgress: ({ progress }) => {
        job.progress = Math.round(progress * 100);
      },
    });
    Object.assign(job, { status: 'COMPLETED', progress: 100, url: publicUrl(key) });
  } catch (error) {
    Object.assign(job, { status: 'FAILED', error: error instanceof Error ? error.message : 'Render failed' });
  }
}

export function startRender(project: Project, options: ExportOptions, origin: string) {
  const job: RenderJob = { id: nanoid(), status: 'PENDING', progress: 0 };
  jobs.set(job.id, job);
  run(job, absolutize(project, origin), options);
  return job;
}

export const getRenderJob = (id: string) => jobs.get(id);

export async function renderFrame(project: Project, frame: number, origin: string) {
  const { renderStill, selectComposition } = await import('@remotion/renderer');
  const serveUrl = await bundleOnce();
  const inputProps = { project: absolutize(project, origin) };
  const chromiumOptions = { gl: GL } as const;
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps, chromiumOptions });
  const { buffer } = await renderStill({
    serveUrl,
    composition,
    inputProps,
    chromiumOptions,
    frame: Math.min(Math.max(0, Math.round(frame)), composition.durationInFrames - 1),
    imageFormat: 'png',
  });
  return buffer!;
}
