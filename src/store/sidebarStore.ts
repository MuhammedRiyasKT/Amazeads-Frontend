

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean; // 🌟 മൊബൈൽ സൈഡ്ബാർ ഓപ്പൺ ആണോ എന്ന് അറിയാനുള്ള സ്റ്റേറ്റ്
  toggle: () => void;
  toggleMobile: () => void; // 🌟 മൊബൈലിൽ ഹാംബർഗർ ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ ടോഗിൾ ചെയ്യാൻ
  closeMobile: () => void;  // 🌟 മൊബൈൽ സൈഡ്ബാർ ക്ലോസ് ചെയ്യാൻ
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false, // 🌟 ഡിഫോൾട്ട് ആയി മൊബൈൽ സൈഡ്ബാർ ക്ലോസ് ആയിരിക്കും

      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      // 🌟 മൊബൈൽ ടോഗിൾ ഫങ്ഷൻ
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),

      // 🌟 മൊബൈൽ ക്ലോസ് ഫങ്ഷൻ
      closeMobile: () => set({ isMobileOpen: false }),

      setCollapsed: (value: boolean) => set({ isCollapsed: value }),
    }),
    {
      name: "amaze-erp-sidebar", // localStorage key
      storage: createJSONStorage(() => localStorage),
      
      // 🌟 LocalStorage-ൽ ഡെസ്ക്ടോപ്പ് കൊളാപ്സ് സ്റ്റേറ്റ് മാത്രം സ്റ്റോർ ചെയ്യുന്നു (പേജ് റിഫ്രഷ് ചെയ്യുമ്പോൾ മൊബൈൽ സൈഡ്ബാർ ഓപ്പൺ ആവാതിരിക്കാൻ)
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
