import { create } from 'zustand';
import type { ITrackItem } from '@designcombo/types';

interface LayoutStore {
  activeMenuItem: string;
  showMenuItem: boolean;
  cropTarget: ITrackItem | null;
  floatingControl: string;
  drawerOpen: boolean;
  controItemDrawerOpen: boolean;
  typeControlItem: string;
  labelControlItem: string;
  trackItem: ITrackItem | null;
  setCropTarget: (cropTarget: ITrackItem | null) => void;
  setActiveMenuItem: (activeMenuItem: string) => void;
  setShowMenuItem: (showMenuItem: boolean) => void;
  setFloatingControl: (floatingControl: string) => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
  setTrackItem: (trackItem: ITrackItem | null) => void;
  setControItemDrawerOpen: (controItemDrawerOpen: boolean) => void;
  setTypeControlItem: (typeControlItem: string) => void;
  setLabelControlItem: (labelControlItem: string) => void;
}

const useLayoutStore = create<LayoutStore>(set => ({
  activeMenuItem: '',
  showMenuItem: false,
  cropTarget: null,
  floatingControl: '',
  drawerOpen: false,
  controItemDrawerOpen: false,
  typeControlItem: '',
  labelControlItem: '',
  trackItem: null,
  setCropTarget: cropTarget => set({ cropTarget }),
  setActiveMenuItem: activeMenuItem => set({ activeMenuItem }),
  setShowMenuItem: showMenuItem => set({ showMenuItem }),
  setFloatingControl: floatingControl => set({ floatingControl }),
  setDrawerOpen: drawerOpen => set({ drawerOpen }),
  setTrackItem: trackItem => set({ trackItem }),
  setControItemDrawerOpen: controItemDrawerOpen => set({ controItemDrawerOpen }),
  setTypeControlItem: typeControlItem => set({ typeControlItem }),
  setLabelControlItem: labelControlItem => set({ labelControlItem }),
}));

export default useLayoutStore;
