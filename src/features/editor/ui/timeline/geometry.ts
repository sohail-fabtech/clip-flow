import { create } from 'zustand';
import type { ClipKind, TrackKind } from '@/features/editor/model/types';

export const HEADER_WIDTH = 160;
export const RULER_HEIGHT = 28;
export const LABEL_HEIGHT = 16;
export const SNAP_PX = 8;
export const END_PADDING_PX = 400;

export const trackHeight = (kind: TrackKind) => (kind === 'video' ? 60 : 44);

export const CLIP_COLOR: Record<ClipKind, string> = {
  video: 'var(--clip-video)',
  audio: 'var(--clip-audio)',
  image: 'var(--clip-image)',
  text: 'var(--clip-text)',
  shape: 'var(--clip-shape)',
};

export type DragMode = 'move' | 'trim-start' | 'trim-end' | 'slip';

export interface DragState {
  mode: DragMode;
  ids: string[];
  delta: number;
  trackShift: number;
  ripple: boolean;
}

interface DragStore {
  drag: DragState | null;
  marquee: { x1: number; y1: number; x2: number; y2: number } | null;
  dropGhost: { trackId: string; frame: number; duration: number } | null;
  setDrag: (drag: DragState | null) => void;
  setMarquee: (marquee: DragStore['marquee']) => void;
  setDropGhost: (ghost: DragStore['dropGhost']) => void;
}

export const useDragStore = create<DragStore>(set => ({
  drag: null,
  marquee: null,
  dropGhost: null,
  setDrag: drag => set({ drag }),
  setMarquee: marquee => set({ marquee }),
  setDropGhost: dropGhost => set({ dropGhost }),
}));

export const ASSET_MIME = 'application/x-editor-asset';
export const TRANSITION_MIME = 'application/x-editor-transition';
