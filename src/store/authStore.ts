import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/axios";

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
  _hasHydrated: boolean;
  // Logout-ൽ duplicate calls ഒഴിവാക്കാനുള്ള flag
  isLoggingOut: boolean;

  setAuth: (token: string, user: User) => void;
  setHasHydrated: (state: boolean) => void;
  // User explicitly logout ചെയ്യുന്ന flow — backend API call ഉൾപ്പെടെ
  logout: () => Promise<void>;
  // Session expire / 401 / forced logout — backend call ഇല്ലാതെ immediate clear
  forceLogout: () => Promise<void>;
}

// ─── Auth State Clear Helper ─────────────────────────────────────────────────
// ഇത് ഈ tab-ലെ മാത്രം sessionStorage ഡാറ്റ clean ആക്കുന്നു (മറ്റ് tab-കളെ ബാധിക്കില്ല 🌟)
function clearAuthPersistence() {
  if (typeof window === "undefined") return;

  // Current tab-ന്റെ മാത്രം session storage keys clear ചെയ്യുന്നു
  sessionStorage.removeItem("amaze-erp-auth");
  sessionStorage.removeItem("amaze-erp-sales-category");
  sessionStorage.removeItem("amaze-erp-pm-category");

  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("checkin_dismissed_")) {
      sessionStorage.removeItem(key);
    }
  });
}

// ─── Redirect to Login ───────────────────────────────────────────────────────
// History stack replace ചെയ്ത് back button dashboard-ലേക്ക് പോകാതിരിക്കാൻ
function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  // replaceState — current history entry /login ആക്കുന്നു
  window.history.replaceState(null, "", "/login");
  window.location.replace("/login");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      isLoggingOut: false,

      setAuth: (token, user) => {
        // Login ചെയ്യുമ്പോൾ checkin-related session data clear ചെയ്യുന്നു
        if (typeof window !== "undefined") {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("checkin_dismissed_")) {
              sessionStorage.removeItem(key);
            }
          });
        }
        set({ token, user, isLoggingOut: false });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // ─── Explicit User Logout ─────────────────────────────────────────────
      // User logout button click ചെയ്യുമ്പോൾ ഉപയോഗിക്കുന്നത്
      logout: async () => {
        const state = get();

        // Already logout process-ൽ ആണെങ്കിൽ skip ചെയ്യുന്നു
        if (state.isLoggingOut) return;

        set({ isLoggingOut: true });

        try {
          // Token ഉള്ളപ്പോൾ മാത്രം backend logout call ചെയ്യുന്നു
          if (state.token) {
            await api.post("/auth/logout");
          }
        } catch (err) {
          // Backend logout fail ആയാലും client-side clear proceed ചെയ്യുന്നു
          console.warn("Backend logout API failed (proceeding with client-side logout):", err);
        }

        // Store clear + cookie/localStorage wipe
        set({ token: null, user: null, isLoggingOut: false });
        clearAuthPersistence();

        // History replace → back button will return to /login, not dashboard
        redirectToLogin();
      },

      // ─── Force Logout (Session Expiry / 401) ─────────────────────────────
      // Session expire ആകുമ്പോഴോ 401 കിട്ടുമ്പോഴോ backend call ഇല്ലാതെ immediate logout
      forceLogout: async () => {
        const state = get();

        // Already logout process-ൽ ആണെങ്കിൽ skip ചെയ്യുന്നു
        if (state.isLoggingOut) return;

        set({ isLoggingOut: true });

        // Store clear + cookie/localStorage wipe — no backend call
        set({ token: null, user: null, isLoggingOut: false });
        clearAuthPersistence();

        // History replace → back button will return to /login, not dashboard
        redirectToLogin();
      },
    }),
    {
      name: "amaze-erp-auth",
      storage: createJSONStorage(() => sessionStorage),
      // isLoggingOut persist ചെയ്യേണ്ടതില്ല — memory-only flag
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);