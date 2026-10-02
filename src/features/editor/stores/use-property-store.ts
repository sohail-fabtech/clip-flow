import { create } from 'zustand';

interface PropertiesStore {
  activePropertyItem: string;
  showPropertyItem: boolean;
  drawerOpen: boolean;
  setActivePropertyItem: (activePropertyItem: string) => void;
  setShowPropertyItem: (showPropertyItem: boolean) => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
  resetProperties: () => void;
}

const usePropertiesStore = create<PropertiesStore>(set => ({
  activePropertyItem: '',
  showPropertyItem: false,
  drawerOpen: false,
  setActivePropertyItem: activePropertyItem => set({ activePropertyItem }),
  setShowPropertyItem: showPropertyItem => set({ showPropertyItem }),
  setDrawerOpen: drawerOpen => set({ drawerOpen }),
  resetProperties: () => set({ activePropertyItem: '', showPropertyItem: false, drawerOpen: false }),
}));

export default usePropertiesStore;
