import { create } from 'zustand';
import type { CompactFont, FontInfo } from '@/features/editor/types';

interface DataState {
  fonts: FontInfo[];
  compactFonts: CompactFont[];
  setFonts: (fonts: FontInfo[]) => void;
  setCompactFonts: (compactFonts: CompactFont[]) => void;
}

const useDataState = create<DataState>(set => ({
  fonts: [],
  compactFonts: [],
  setFonts: fonts => set({ fonts }),
  setCompactFonts: compactFonts => set({ compactFonts }),
}));

export default useDataState;
