import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  signInModalOpen: boolean;
  selectedDriver: any | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setSignInModalOpen: (open: boolean) => void;
  setSelectedDriver: (driver: any | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  signInModalOpen: false,
  selectedDriver: null,

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setSignInModalOpen: (open: boolean) => {
    set({ signInModalOpen: open });
  },

  setSelectedDriver: (driver: any | null) => {
    set({ selectedDriver: driver });
  },
}));

