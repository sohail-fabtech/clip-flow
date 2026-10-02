interface UploadInfo {
  fileName: string;
  filePath: string;
  contentType: string;
  presignedUrl?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status})`);
  return data;
}

function put(url: string, file: File, contentType: string, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = event => event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}

export async function uploadFile(file: File, onProgress: (fraction: number) => void) {
  const { uploads } = await postJson<{ uploads: UploadInfo[] }>('/api/uploads/presign', { fileNames: [file.name] });
  const [info] = uploads;
  await put(info.presignedUrl!, file, info.contentType, onProgress);
  return info;
}

export async function importRemote(url: string) {
  const { uploads } = await postJson<{ uploads: UploadInfo[] }>('/api/uploads/url', { urls: [url] });
  return uploads[0];
}
