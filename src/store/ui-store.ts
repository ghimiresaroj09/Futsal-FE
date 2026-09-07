import { create } from "zustand";

interface UiState {
  /** Mobile sidebar drawer open state (desktop sidebar is always visible). */
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
