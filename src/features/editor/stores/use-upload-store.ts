import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { processUpload } from '@/features/editor/services/upload';
import { addMediaToTimeline } from '@/features/editor/utils/add-media';
import type { UploadRecord, UploadStatus, UploadTask } from '@/features/editor/types';

interface SelectedFile {
  id: string;
  file: File;
}

interface UploadStore {
  showUploadModal: boolean;
  files: SelectedFile[];
  pendingUploads: UploadTask[];
  activeUploads: UploadTask[];
  uploads: UploadRecord[];
  setShowUploadModal: (showUploadModal: boolean) => void;
  setFiles: (files: SelectedFile[] | ((files: SelectedFile[]) => SelectedFile[])) => void;
  addPendingUploads: (uploads: UploadTask[]) => void;
  processUploads: () => void;
  updateUploadProgress: (id: string, progress: number) => void;
  setUploadStatus: (id: string, status: UploadStatus, error?: string) => void;
  removeUpload: (id: string) => void;
  setUploads: (uploads: UploadRecord[] | ((uploads: UploadRecord[]) => UploadRecord[])) => void;
}

const STATUS_VISIBLE_MS = 3000;

const useUploadStore = create<UploadStore>()(
  persist(
    (set, get) => ({
      showUploadModal: false,
      files: [],
      pendingUploads: [],
      activeUploads: [],
      uploads: [],
      setShowUploadModal: showUploadModal => set({ showUploadModal }),
      setFiles: files => set(state => ({ files: typeof files === 'function' ? files(state.files) : files })),
      addPendingUploads: uploads => set(state => ({ pendingUploads: [...state.pendingUploads, ...uploads] })),
      processUploads: () => {
        const { pendingUploads, updateUploadProgress, setUploadStatus, removeUpload, setUploads } = get();
        const started = pendingUploads.map(upload => ({ ...upload, status: 'uploading' as const, progress: 0 }));
        set(state => ({ activeUploads: [...state.activeUploads, ...started], pendingUploads: [] }));

        const callbacks = {
          onProgress: updateUploadProgress,
          onStatus: (id: string, status: UploadStatus, error?: string) => {
            setUploadStatus(id, status, error);
            if (status === 'uploaded' || status === 'failed') setTimeout(() => removeUpload(id), STATUS_VISIBLE_MS);
          },
        };

        for (const upload of started) {
          processUpload(upload.id, upload, callbacks)
            .then(records => {
              setUploads(prev => [...records, ...prev]);
              if (upload.addToTimeline) records.forEach(addMediaToTimeline);
            })
            .catch(() => {});
        }
      },
      updateUploadProgress: (id, progress) =>
        set(state => ({ activeUploads: state.activeUploads.map(u => (u.id === id ? { ...u, progress } : u)) })),
      setUploadStatus: (id, status, error) =>
        set(state => ({ activeUploads: state.activeUploads.map(u => (u.id === id ? { ...u, status, error } : u)) })),
      removeUpload: id => set(state => ({ activeUploads: state.activeUploads.filter(u => u.id !== id) })),
      setUploads: uploads =>
        set(state => ({ uploads: typeof uploads === 'function' ? uploads(state.uploads) : uploads })),
    }),
    {
      name: 'upload-store',
      partialize: state => ({ uploads: state.uploads }),
    },
  ),
);

export default useUploadStore;
