import type { ITrackItem } from '@designcombo/types';

export const mediaTiming = (item: ITrackItem, fps: number) => ({
  trimBefore: item.trim?.from ? Math.round((item.trim.from / 1000) * fps) : undefined,
  trimAfter: item.trim?.to ? Math.round((item.trim.to / 1000) * fps) : undefined,
  playbackRate: item.playbackRate || 1,
});

export const volumeOf = (volume?: number) => (volume ?? 100) / 100;
