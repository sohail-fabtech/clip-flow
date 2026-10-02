import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { Asset, AssetKind } from '@/features/editor/model/types';
import { commit } from '@/features/editor/store/project-store';
import { importRemote, uploadFile } from '@/features/editor/media/upload';
import { MAX_DECODE_BYTES, getPeaks, getThumbs, probe } from '@/features/editor/media/analysis';

export interface ImportJob {
  id: string;
  name: string;
  progress: number;
  error: string | null;
}

interface ImportStore {
  jobs: ImportJob[];
  upsert: (job: ImportJob) => void;
  remove: (id: string) => void;
}

export const useImportStore = create<ImportStore>(set => ({
  jobs: [],
  upsert: job => set(state => ({ jobs: [...state.jobs.filter(j => j.id !== job.id), job] })),
  remove: id => set(state => ({ jobs: state.jobs.filter(j => j.id !== id) })),
}));

const kindOf = (contentType: string): AssetKind | null => {
  const type = contentType.split('/')[0];
  return type === 'video' || type === 'audio' || type === 'image' ? type : null;
};

async function finalize(job: ImportJob, src: string, name: string, kind: AssetKind, size: number, local?: Blob) {
  const meta = await probe(src, kind);
  const peaks = kind === 'image' ? null : await getPeaks(src, local);
  const asset: Asset = {
    id: nanoid(),
    kind,
    name,
    src,
    folderId: null,
    durationSec: meta.durationSec,
    width: meta.width,
    height: meta.height,
    hasAudio: kind === 'audio' || (kind === 'video' && (peaks !== null || size > MAX_DECODE_BYTES)),
    size,
    createdAt: Date.now(),
  };
  if (kind === 'video') void getThumbs(src, meta.durationSec);
  commit(`Import ${name}`, draft => {
    draft.assets[asset.id] = asset;
  });
  useImportStore.getState().remove(job.id);
  return asset;
}

async function track<T>(name: string, run: (job: ImportJob) => Promise<T>) {
  const job: ImportJob = { id: nanoid(), name, progress: 0, error: null };
  const { upsert } = useImportStore.getState();
  upsert(job);
  try {
    return await run(job);
  } catch (error) {
    upsert({ ...job, error: error instanceof Error ? error.message : 'Import failed' });
    return null;
  }
}

export function importFiles(files: File[]) {
  return Promise.all(
    files.map(file =>
      track(file.name, async job => {
        const kind = kindOf(file.type);
        if (!kind) throw new Error('Unsupported file type');
        const info = await uploadFile(file, progress => useImportStore.getState().upsert({ ...job, progress }));
        return finalize(job, info.filePath, file.name, kind, file.size, file);
      }),
    ),
  );
}

export function importUrl(url: string) {
  return track(url, async job => {
    const info = await importRemote(url);
    const kind = kindOf(info.contentType);
    if (!kind) throw new Error('Unsupported media type');
    return finalize(job, info.filePath, info.fileName, kind, 0);
  });
}

