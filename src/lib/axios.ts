import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Tab-specific sessionStorage-ൽ നിന്നോ in-memory store-ൽ നിന്നോ token read ചെയ്യുന്നു
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const isAuthEndpoint =
      config.url?.includes("/auth/logout") ||
      config.url?.includes("/auth/login");

    let token: string | null = null;

    try {
      const authDataStr = sessionStorage.getItem("amaze-erp-auth");
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        token = authData?.state?.token || null;
      }
    } catch {
      token = null;
    }

    if (!token) {
      try {
        const { useAuthStore } = await import("@/store/authStore");
        token = useAuthStore.getState().token;
      } catch {
        token = null;
      }
    }

    if (token) {
      if (!isAuthEndpoint) {
        const expiry = getTokenExpiry(token);
        if (expiry && Date.now() >= expiry) {
          const { useAuthStore } = await import("@/store/authStore");
          const store = useAuthStore.getState();
          if (!store.isLoggingOut) {
            await store.forceLogout();
          }
          return Promise.reject(new axios.Cancel("Session expired"));
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 401 Unauthorized response വന്നാൽ centralized logout trigger ചെയ്യുന്നു.
// ഇത് globally handle ചെയ്യുന്നു — ഓരോ page-ലും separately handle ചെയ്യേണ്ടതില്ല.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Auth endpoints-ന് 401 വന്നാൽ interceptor skip ചെയ്യുന്നു:
    //   /auth/logout  → logout call-ൽ 401 വന്നാൽ loop ഒഴിവാക്കാൻ
    //   /auth/login   → wrong password-ൽ 401 ആകും; login page-ലെ catch block handle ചെയ്യും
    //   /auth/login1  → same as above (two-step login flow)
    // ഈ endpoints-ൽ forceLogout() call ചെയ്‌താൽ auth state clear ആകും,
    // cookie delete ആകും, window.location.replace("/login") fire ആകും → page reload →
    // login form stuck/reset ആകും. അത് ഒഴിവാക്കാൻ ഇവ bypass ചെയ്യുന്നു.
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/logout") ||
      error.config?.url?.includes("/auth/login");

    if (status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      // Dynamic import — circular dependency ഒഴിവാക്കാൻ
      const { useAuthStore } = await import("@/store/authStore");
      const store = useAuthStore.getState();

      // Already logging out ആണെങ്കിൽ duplicate calls ഒഴിവാക്കുന്നു
      if (!store.isLoggingOut) {
        await store.forceLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;