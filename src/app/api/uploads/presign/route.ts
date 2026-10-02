import { contentTypeOf, isMediaType, publicUrl, storageKey } from '@/server/storage';

export async function POST(request: Request) {
  const { fileNames } = (await request.json()) as { fileNames?: string[] };
  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    return Response.json({ error: 'fileNames is required' }, { status: 400 });
  }

  const unsupported = fileNames.find(name => !isMediaType(contentTypeOf(name)));
  if (unsupported) return Response.json({ error: `Unsupported file type: ${unsupported}` }, { status: 400 });

  const uploads = fileNames.map(fileName => {
    const url = publicUrl(storageKey('uploads', fileName));
    return { fileName, filePath: url, url, presignedUrl: url, contentType: contentTypeOf(fileName), folder: null };
  });
  return Response.json({ uploads });
}
