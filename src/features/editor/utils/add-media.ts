import { dispatch } from '@designcombo/events';
import { ADD_AUDIO, ADD_IMAGE, ADD_VIDEO } from '@designcombo/state';
import { generateId } from '@designcombo/timeline';
import type { UploadRecord } from '@/features/editor/types';

export const mediaSource = (item: UploadRecord) =>
  item.metadata?.uploadedUrl || item.filePath || item.metadata?.originalUrl || item.url || '';

export function addMediaToTimeline(item: UploadRecord) {
  const src = mediaSource(item);
  if (item.type === 'video') {
    dispatch(ADD_VIDEO, {
      payload: { id: generateId(), details: { src }, metadata: { previewUrl: item.metadata?.thumbnailUrl } },
      options: { resourceId: 'main', scaleMode: 'fit' },
    });
  } else if (item.type === 'image') {
    dispatch(ADD_IMAGE, {
      payload: { id: generateId(), type: 'image', display: { from: 0, to: 5000 }, details: { src }, metadata: {} },
      options: {},
    });
  } else if (item.type === 'audio') {
    dispatch(ADD_AUDIO, {
      payload: { id: generateId(), type: 'audio', details: { src }, metadata: {} },
      options: {},
    });
  }
}
