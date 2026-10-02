import { timeMsToUnits } from '@designcombo/timeline';
import type { ITimelineScaleState } from '@designcombo/types';
import { TIMELINE_ZOOM_LEVELS } from '@/features/editor/constants/scale';

const LAST = TIMELINE_ZOOM_LEVELS.length - 1;

export const getZoomByIndex = (index: number) => TIMELINE_ZOOM_LEVELS[index];

export const getPreviousZoomLevel = (current: ITimelineScaleState) =>
  TIMELINE_ZOOM_LEVELS.findLast(level => level.zoom < current.zoom) ?? TIMELINE_ZOOM_LEVELS[0];

export const getNextZoomLevel = (current: ITimelineScaleState) =>
  TIMELINE_ZOOM_LEVELS.find(level => level.zoom > current.zoom) ?? TIMELINE_ZOOM_LEVELS[LAST];

export function getFitZoomLevel(totalLengthMs: number, zoom = 1, scrollOffset = 8): ITimelineScaleState {
  const canvasWidth = document.getElementById('designcombo-timeline-canvas')?.offsetWidth ?? document.body.offsetWidth;
  const visibleWidth = Math.max(1, canvasWidth - Math.max(0, scrollOffset));
  const targetZoom = zoom * (visibleWidth / timeMsToUnits(totalLengthMs, zoom));
  const index = TIMELINE_ZOOM_LEVELS.findIndex(level => level.zoom > targetZoom);
  return { segments: 5, index: index === -1 ? LAST : index, zoom: targetZoom, unit: 1 / targetZoom };
}
