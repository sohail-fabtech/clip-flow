import axios from 'axios';
import { nanoid } from 'nanoid';
import type { UploadRecord, UploadStatus } from '@/features/editor/types';

interface UploadCallbacks {
  onProgress: (uploadId: string, progress: number) => void;
  onStatus: (uploadId: string, status: UploadStatus, error?: string) => void;
}

interface UploadInfo {
  fileName: string;
  filePath: string;
  contentType: string;
  folder: string | null;
  presignedUrl?: string;
  originalUrl?: string;
}

const toRecord = (info: UploadInfo, fileSize: number, method: UploadRecord['method']): UploadRecord => ({
  id: nanoid(),
  fileName: info.fileName,
  filePath: info.filePath,
  fileSize,
  contentType: info.contentType,
  metadata: method === 'direct' ? { uploadedUrl: info.filePath } : { originalUrl: info.originalUrl },
  folder: info.folder,
  type: info.contentType.split('/')[0],
  method,
  origin: 'user',
  status: 'uploaded',
  isPreview: false,
});

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error) ? (error.response?.data?.error ?? error.message) : (error as Error).message;

async function uploadFile(uploadId: string, file: File, { onProgress }: UploadCallbacks) {
  const { data } = await axios.post<{ uploads: UploadInfo[] }>('/api/uploads/presign', { fileNames: [file.name] });
  const [info] = data.uploads;
  await axios.put(info.presignedUrl!, file, {
    headers: { 'Content-Type': info.contentType },
    onUploadProgress: event => onProgress(uploadId, Math.round((event.loaded * 100) / (event.total || 1))),
  });
  return [toRecord(info, file.size, 'direct')];
}

async function uploadUrl(uploadId: string, url: string, { onProgress }: UploadCallbacks) {
  onProgress(uploadId, 10);
  const { data } = await axios.post<{ uploads: UploadInfo[] }>('/api/uploads/url', { urls: [url] });
  onProgress(uploadId, 100);
  return data.uploads.map(info => toRecord(info, 0, 'url'));
}

export async function processUpload(
  uploadId: string,
  upload: { file?: File; url?: string },
  callbacks: UploadCallbacks,
): Promise<UploadRecord[]> {
  try {
    if (!upload.file && !upload.url) throw new Error('No file or URL provided');
    const records = upload.file
      ? await uploadFile(uploadId, upload.file, callbacks)
      : await uploadUrl(uploadId, upload.url!, callbacks);
    callbacks.onStatus(uploadId, 'uploaded');
    return records;
  } catch (error) {
    callbacks.onStatus(uploadId, 'failed', errorMessage(error));
    throw error;
  }
}
