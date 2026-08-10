// src/store/sidebarStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,

      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      setCollapsed: (value: boolean) => set({ isCollapsed: value }),
    }),
    {
      name: "amaze-erp-sidebar", // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
