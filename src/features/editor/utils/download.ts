export function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

export async function downloadUrl(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed with ${response.status}`);
  downloadBlob(await response.blob(), filename);
}
