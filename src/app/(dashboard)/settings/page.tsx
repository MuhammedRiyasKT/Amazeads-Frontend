"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Settings, ArrowLeft, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

export default function SettingsPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  const roleName = user?.role_name?.toLowerCase() || "";
  const isAdmin = roleName.includes("admin");

  // If an administrator accesses /settings directly, redirect them to /admin/settings
  useEffect(() => {
    if (_hasHydrated && isAdmin) {
      router.replace("/admin/settings");
    }
  }, [_hasHydrated, isAdmin, router]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">Redirecting to Admin Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500">
            System configuration and preferences
          </p>
        </div>
      </div>

      {/* Access Notice Card */}
      <div className="flex items-center justify-center py-12">
        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Admin Access Only</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            Settings are accessible to system administrators only.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Current role:{" "}
            <span className="font-semibold text-slate-700 capitalize">
              {user?.role_name || "Staff"}
            </span>
          </p>
          <Button
            variant="outline"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
