import { create } from 'zustand';
import type CanvasTimeline from '@/features/editor/timeline/items/timeline';
import type { EditorState, MoveableRef } from '@/features/editor/types';

interface EditorStore extends EditorState {
  setTimeline: (timeline: CanvasTimeline) => void;
  setScale: (scale: EditorState['scale']) => void;
  setState: (state: Partial<EditorState>) => void;
  setPlayerRef: (playerRef: EditorState['playerRef']) => void;
  setSceneMoveableRef: (ref: MoveableRef) => void;
}

const useStore = create<EditorStore>(set => ({
  size: { width: 1080, height: 1920 },
  background: { type: 'color', value: 'transparent' },
  timeline: null,
  duration: 1000,
  fps: 30,
  scale: { index: 7, unit: 300, zoom: 1 / 300, segments: 5 },
  scroll: { left: 0, top: 0 },
  playerRef: null,
  structure: [],
  activeIds: [],
  targetIds: [],
  tracks: [],
  trackItemIds: [],
  transitionIds: [],
  transitionsMap: {},
  trackItemsMap: {},
  sceneMoveableRef: null,
  setTimeline: timeline => set({ timeline }),
  setScale: scale => set({ scale }),
  setState: state => set(state),
  setPlayerRef: playerRef => set({ playerRef }),
  setSceneMoveableRef: sceneMoveableRef => set({ sceneMoveableRef }),
}));

export default useStore;
