export const secondsToFrames = (seconds: number, fps: number) => Math.round(seconds * fps);
export const framesToSeconds = (frames: number, fps: number) => frames / fps;

const pad = (value: number, length = 2) => String(Math.floor(value)).padStart(length, '0');

export function timecode(frame: number, fps: number) {
  const totalSeconds = Math.floor(frame / fps);
  return `${pad(totalSeconds / 3600)}:${pad((totalSeconds % 3600) / 60)}:${pad(totalSeconds % 60)}:${pad(frame % fps)}`;
}

export function shortTime(frame: number, fps: number) {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  return `${pad(minutes)}:${pad(totalSeconds % 60)}`;
}

export const dbToGain = (db: number) => (db <= -60 ? 0 : 10 ** (db / 20));
