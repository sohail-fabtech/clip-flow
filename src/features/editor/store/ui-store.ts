import { create } from 'zustand';
import type { Clip } from '@/features/editor/model/types';

export type Tool = 'select' | 'razor' | 'trim';
export type LeftTab = 'media' | 'audio' | 'text' | 'captions' | 'transitions' | 'elements' | 'markers';
export type InspectorTab = 'video' | 'adjust' | 'audio' | 'text' | 'animate';

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 40;

interface UiStore {
  tool: Tool;
  zoom: number;
  selection: string[];
  selectedMarkerId: string | null;
  leftTab: LeftTab;
  inspectorTab: InspectorTab;
  snapping: boolean;
  linkedSelection: boolean;
  clipboard: Clip[];
  shortcutsOpen: boolean;
  exportOpen: boolean;
  snapIndicator: number | null;
  setTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  selectMarker: (id: string | null) => void;
  setLeftTab: (tab: LeftTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  toggleSnapping: () => void;
  toggleLinkedSelection: () => void;
  setClipboard: (clips: Clip[]) => void;
  setShortcutsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setSnapIndicator: (frame: number | null) => void;
}

export const useUiStore = create<UiStore>(set => ({
  tool: 'select',
  zoom: 2,
  selection: [],
  selectedMarkerId: null,
  leftTab: 'media',
  inspectorTab: 'video',
  snapping: true,
  linkedSelection: true,
  clipboard: [],
  shortcutsOpen: false,
  exportOpen: false,
  snapIndicator: null,
  setTool: tool => set({ tool }),
  setZoom: zoom => set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) }),
  select: selection => set({ selection, selectedMarkerId: null }),
  toggleSelect: id =>
    set(state => ({
      selection: state.selection.includes(id) ? state.selection.filter(s => s !== id) : [...state.selection, id],
    })),
  selectMarker: selectedMarkerId => set({ selectedMarkerId, selection: [] }),
  setLeftTab: leftTab => set({ leftTab }),
  setInspectorTab: inspectorTab => set({ inspectorTab }),
  toggleSnapping: () => set(state => ({ snapping: !state.snapping })),
  toggleLinkedSelection: () => set(state => ({ linkedSelection: !state.linkedSelection })),
  setClipboard: clipboard => set({ clipboard }),
  setShortcutsOpen: shortcutsOpen => set({ shortcutsOpen }),
  setExportOpen: exportOpen => set({ exportOpen }),
  setSnapIndicator: snapIndicator => set({ snapIndicator }),
}));
