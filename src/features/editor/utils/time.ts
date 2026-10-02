import type { RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';

const formatSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mmss = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
};

export const frameToTimeString = ({ frame }: { frame: number }, { fps }: { fps: number }) => formatSeconds(frame / fps);

export const timeToString = ({ time }: { time: number }) => formatSeconds(time / 1000);

export const getSafeCurrentFrame = (playerRef: RefObject<PlayerRef | null> | null) => {
  const frame = playerRef?.current?.getCurrentFrame();
  return typeof frame === 'number' && Number.isFinite(frame) ? Math.max(0, frame) : 0;
};

export const currentTimeMs = (playerRef: RefObject<PlayerRef | null> | null, fps: number) =>
  (getSafeCurrentFrame(playerRef) / fps) * 1000;
