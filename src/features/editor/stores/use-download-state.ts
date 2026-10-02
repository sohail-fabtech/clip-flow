import { create } from 'zustand';
import type { IDesign } from '@designcombo/types';
import { getRender, startRender } from '@/features/editor/services/render';
import { downloadBlob } from '@/features/editor/utils/download';

export type ExportType = 'mp4' | 'json';

interface DownloadState {
  exporting: boolean;
  exportType: ExportType;
  progress: number;
  error: string | null;
  output: { url: string; type: ExportType } | null;
  displayProgressModal: boolean;
  payload: IDesign | null;
  actions: {
    setExportType: (exportType: ExportType) => void;
    setPayload: (payload: IDesign) => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
    startExport: () => Promise<void>;
  };
}

const POLL_MS = 1500;

export const useDownloadState = create<DownloadState>((set, get) => ({
  exporting: false,
  exportType: 'mp4',
  progress: 0,
  error: null,
  output: null,
  displayProgressModal: false,
  payload: null,
  actions: {
    setExportType: exportType => set({ exportType }),
    setPayload: payload => set({ payload }),
    setDisplayProgressModal: displayProgressModal => set({ displayProgressModal }),
    startExport: async () => {
      const { payload, exportType } = get();
      if (!payload) return;

      if (exportType === 'json') {
        downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'design.json');
        return;
      }

      set({ exporting: true, displayProgressModal: true, progress: 0, error: null, output: null });
      try {
        let job = await startRender(payload);
        while (job.status === 'PENDING') {
          if (!get().displayProgressModal) return;
          set({ progress: job.progress });
          await new Promise(resolve => setTimeout(resolve, POLL_MS));
          job = await getRender(job.id);
        }
        if (job.status === 'FAILED' || !job.url) throw new Error(job.error ?? 'Render failed');
        set({ progress: 100, output: { url: job.url, type: 'mp4' } });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Render failed' });
      } finally {
        set({ exporting: false });
      }
    },
  },
}));
