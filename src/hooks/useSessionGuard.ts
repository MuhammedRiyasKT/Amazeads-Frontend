"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

// ─── JWT Expiry Decoder ───────────────────────────────────────────────────────
// JWT-ൽ നിന്നും exp (expiry timestamp) read ചെയ്യുന്നു
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

// ─── Session Ping ─────────────────────────────────────────────────────────────
// GET /api/v1/auth/profile വഴി backend-ൽ session valid ആണോ എന്ന് confirm ചെയ്യുന്നു.
//
// Design rationale:
//   • 200 → session valid → do NOTHING. Stay on current page, no redirect, no reload.
//   • 401 → global axios interceptor (lib/axios.ts) already handles this:
//            it calls forceLogout() → clears state → redirects to /login.
//            We must NOT call forceLogout() here again (double-call).
//   • Network error / 5xx / timeout → silently ignored.
//            A transient network failure must NOT log the user out.
//
// This is the single correct pattern: the axios interceptor is the authoritative
// handler for 401. This function's only job is to trigger the API call.

// Module-level flag: prevents concurrent duplicate pings when both pageshow and
// visibilitychange fire at the same time (which happens on BFCache restoration).
let isPinging = false;

async function pingSession(): Promise<void> {
  if (isPinging) return;
  if (useAuthStore.getState().isLoggingOut) return;

  // No token means already logged out; middleware and the interceptor handle redirect.
  const token = useAuthStore.getState().token;
  if (!token) return;

  isPinging = true;
  try {
    await api.get("/auth/profile");
    // 200: session is valid — do nothing. Do NOT redirect, reload, or push history.
  } catch {
    // 401: the global axios response interceptor in lib/axios.ts has already fired
    //      forceLogout() before this catch block runs. No action needed here.
    // Other errors (network, 5xx): silently ignored. Don't logout prematurely.
  } finally {
    isPinging = false;
  }
}

// ─── useSessionGuard ─────────────────────────────────────────────────────────
/**
 * Dashboard layout-ൽ mount ചെയ്യുന്ന hook.
 * ഇത് ചെയ്യുന്നത്:
 *   1. JWT exp based proactive logout timer — token expire ആകുന്ന time-ൽ forceLogout()
 *   2. pageshow (persisted) — BFCache restore-ൽ session ping
 *   3. visibilitychange (visible) — tab-ലേക്ക് തിരിച്ചു വരുമ്പോൾ session ping
 *
 * Valid session ആണെങ്കിൽ: redirect ഇല്ല, reload ഇല്ല, history change ഇല്ല.
 * 401 ആണെങ്കിൽ: lib/axios.ts interceptor → forceLogout() → /login.
 */
export function useSessionGuard() {
  const token = useAuthStore((state) => state.token);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const forceLogout = useAuthStore((state) => state.forceLogout);

  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Effect: JWT Expiry Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }

    if (!token || isLoggingOut) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const now = Date.now();
    const msUntilExpiry = expiry - now;

    if (msUntilExpiry <= 0) {
      // Token already expired — immediate logout
      forceLogout();
      return;
    }

    // Set a timer to fire exactly when the JWT expires
    if (msUntilExpiry < 24 * 60 * 60 * 1000 * 24) {
      expiryTimerRef.current = setTimeout(() => {
        forceLogout();
      }, msUntilExpiry);
    }

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };
  }, [token, isLoggingOut, forceLogout]);

  // ─── Effect: Tab Visibility Change ────────────────────────────────────────
  // User switches back to this tab after being away → ping to detect expired session.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pingSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Effect: BFCache Pageshow (Browser Back/Forward) ─────────────────────
  // event.persisted === true means the page was restored from the browser's
  // Back/Forward Cache, not freshly loaded. Validate session in this case.
  // If valid → stay on the restored page (no redirect, no reload).
  // If 401 → interceptor → forceLogout → /login.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // isPinging flag deduplicates if visibilitychange fires at the same time
        pingSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
