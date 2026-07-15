import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  staff_name: string;
  email: string;
  image_url: string;
  address: string;
  role_name: string;
  created_on: string;
  account_status?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean; // Next.js Hydration ട്രാക്ക് ചെയ്യാൻ

  setAuth: (token: string, user: User) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false, // ആദ്യം ഫാൽസ് ആയിരിക്കും

      setAuth: (token, user) => {
        set({
          token,
          user,
        });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      logout: () => {
        // ലോഗൗട്ട് ചെയ്യുമ്പോൾ കുക്കികളും ഡാറ്റകളും പൂർണ്ണമായി ഒഴിവാക്കുന്നു
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        set({
          token: null,
          user: null,
        });
      },
    }),
    {
      name: "amaze-erp-auth", // ലോക്കൽ സ്റ്റോറേജ് കീ
      storage: createJSONStorage(() => localStorage),
      // റീ-ഹൈഡ്രേഷൻ പൂർത്തിയാകുമ്പോൾ സ്റ്റാറ്റസ് ട്രൂ ആക്കുന്നു
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);