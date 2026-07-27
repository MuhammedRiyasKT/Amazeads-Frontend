import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SelectedSalesCategory {
  id: number;
  category_name: string;
}

interface SalesCategoryState {
  selectedCategory: SelectedSalesCategory | null;
  _hasHydrated: boolean;
  setSelectedCategory: (category: SelectedSalesCategory | null) => void;
  setHasHydrated: (state: boolean) => void;
  clearCategory: () => void;
}

export const useSalesStore = create<SalesCategoryState>()(
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
      name: "amaze-erp-sales-category", 
      // localStorage മാറ്റി പകരം sessionStorage നൽകി (പ്രധാന മാറ്റം 🌟)
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);