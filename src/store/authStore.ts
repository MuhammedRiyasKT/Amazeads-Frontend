import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/axios"; // ബാക്കെൻഡ് API വിളിക്കാൻ അക്സിയോസ് ഇമ്പോർട്ട് ചെയ്തു (പ്രധാന മാറ്റം! 🌟)

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
  logout: () => Promise<void>; // ലോഗൗട്ട് പ്രോമിസ് ആക്കി മാറ്റി
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false, // ആദ്യം ഫാൽസ് ആയിരിക്കും

      setAuth: (token, user) => {
        if (typeof window !== "undefined") {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("checkin_dismissed_")) {
              sessionStorage.removeItem(key);
            }
          });
        }
        set({
          token,
          user,
        });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      logout: async () => {
        try {
          // 1. ബാക്കെൻഡ് ലോഗൗട്ട് API കോൾ ചെയ്ത് സെർവറിലെ ടോക്കൺ ഒഴിവാക്കുന്നു
          await api.post("/auth/logout");
        } catch (err) {
          console.error("Backend logout API failed:", err);
        }

        // 2. കുക്കികൾ ഒഴിവാക്കുന്നു
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        
        // 3. ലോക്കൽ സ്റ്റോറേജും സെഷൻ സ്റ്റോറേജും തനിയെ ഒഴിവാക്കുന്നു
        if (typeof window !== "undefined") {
          localStorage.removeItem("amaze-erp-sales-category");
          sessionStorage.removeItem("amaze-erp-sales-category");
          
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("checkin_dismissed_")) {
              sessionStorage.removeItem(key);
            }
          });
        }

        // 4. ഫ്രണ്ട്-എൻഡ് സ്റ്റേറ്റ് ക്ലിയർ ചെയ്യുന്നു
        set({
          token: null,
          user: null,
        });
      },
    }),
    {
      name: "amaze-erp-auth", // ലോക്കൽ സ്റ്റോറേജ് കീ
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);