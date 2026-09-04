import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SelectedProjectManagerCategory {
  id: number;
  category_name: string;
}

interface ProjectManagerCategoryState {
  selectedCategory: SelectedProjectManagerCategory | null;
  _hasHydrated: boolean;
  setSelectedCategory: (category: SelectedProjectManagerCategory | null) => void;
  setHasHydrated: (state: boolean) => void;
  clearCategory: () => void;
}

export const useProjectManagerStore = create<ProjectManagerCategoryState>()(
  persist(
    (set) => ({
      selectedCategory: null,
      _hasHydrated: false,

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      clearCategory: () => {
        set({ selectedCategory: null });
      },
    }),
    {
      name: "amaze-erp-pm-category",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
