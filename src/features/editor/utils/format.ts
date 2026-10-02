import { PREVIEW_FRAME_WIDTH } from '@/features/editor/constants/constants';

export function formatTimelineUnit(units: number) {
  if (!units) return '0';
  const time = units / PREVIEW_FRAME_WIDTH;
  const frames = Math.trunc(time) % 60;
  const seconds = Math.trunc(time / 60) % 60;
  const minutes = Math.trunc(time / 3600) % 60;
  const hours = Math.trunc(time / 216000);
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (time < 60) return `${pad(frames)}f`;
  if (time < 3600) return `${seconds}s`;
  if (time < 216000) return `${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
