import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SelectedSalesCategory {
  id: number;
  category_name: string;
}

interface SalesCategoryState {
  selectedCategory: SelectedSalesCategory | null;
  _hasHydrated: boolean;
  badgeRefreshKey: number;
  setSelectedCategory: (category: SelectedSalesCategory | null) => void;
  setHasHydrated: (state: boolean) => void;
  clearCategory: () => void;
  triggerBadgeRefresh: () => void;
}

export const useSalesStore = create<SalesCategoryState>()(
  persist(
    (set) => ({
      selectedCategory: null,
      _hasHydrated: false,
      badgeRefreshKey: 0,

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      clearCategory: () => {
        set({ selectedCategory: null });
      },

      triggerBadgeRefresh: () => {
        set((state) => ({ badgeRefreshKey: state.badgeRefreshKey + 1 }));
      },
    }),
    {
      name: "amaze-erp-sales-category", 
      // localStorage മാറ്റി പകരം sessionStorage നൽകി (പ്രധാന മാറ്റം 🌟)
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ selectedCategory: state.selectedCategory }),
    }
  )
);

export function refreshSalesBadges() {
  useSalesStore.getState().triggerBadgeRefresh();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("sales-badge-refresh"));
  }
}