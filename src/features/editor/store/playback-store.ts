import { create } from 'zustand';
import type { PlayerRef } from '@remotion/player';

interface PlaybackStore {
  frame: number;
  playing: boolean;
  player: PlayerRef | null;
  setPlayer: (player: PlayerRef | null) => void;
  setFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
}

export const usePlaybackStore = create<PlaybackStore>(set => ({
  frame: 0,
  playing: false,
  player: null,
  setPlayer: player => set({ player }),
  setFrame: frame => set({ frame }),
  setPlaying: playing => set({ playing }),
}));

export const getFrame = () => usePlaybackStore.getState().frame;

export function seek(frame: number) {
  const { player, setFrame } = usePlaybackStore.getState();
  const target = Math.max(0, Math.round(frame));
  setFrame(target);
  player?.seekTo(target);
}

export function togglePlay() {
  const { player } = usePlaybackStore.getState();
  if (!player) return;
  if (player.isPlaying()) player.pause();
  else player.play();
}
