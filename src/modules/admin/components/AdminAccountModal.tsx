// src/modules/admin/components/AdminAccountModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Landmark, Check } from "lucide-react";
import { AdminAccount } from "../types/adminAccount.types";
import { createAdminAccount, updateAdminAccount } from "../services/adminAccount.service";

interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  account: AdminAccount | null;
  existingAccounts: AdminAccount[];
}

export default function AdminAccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
  existingAccounts = [],
}: AdminAccountModalProps) {
  const isEditMode = Boolean(account);
  const [accountName, setAccountName] = useState("");
  const [status, setStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setAccountName(account.account_name || "");
        setStatus(account.status ?? true);
      } else {
        setAccountName("");
        setStatus(true);
      }
      setError(null);
      setValidationError(null);
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = accountName.trim();

    if (!trimmedName) {
      setValidationError("Account Name is required");
      return;
    }

    // Duplicate account name validation (Case-insensitive & Trimmed)
    const normalizedInput = trimmedName.toLowerCase();
    const isDuplicate = existingAccounts.some((existing) => {
      if (isEditMode && account && existing.id === account.id) {
        return false;
      }
      return existing.account_name?.trim().toLowerCase() === normalizedInput;
    });

    if (isDuplicate) {
      setValidationError("This account already exists.");
      return;
    }

    setValidationError(null);
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode && account) {
        await updateAdminAccount(account.id, {
          account_name: trimmedName,
          status,
        });
        onSuccess(`Account "${trimmedName}" updated successfully`);
      } else {
        await createAdminAccount({
          account_name: trimmedName,
          status,
        });
        onSuccess(`Account "${trimmedName}" created successfully`);
      }
      onClose();
    } catch (err: any) {
      console.error("Account save error:", err);
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} account. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Landmark size={18} />
            </div>
            <h3 className="text-base font-black text-slate-800">
              {isEditMode ? "Edit Account" : "Add New Account"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* API Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {/* Account Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Amaze-Ads, Cash, Bank..."
              disabled={isSubmitting}
              className={`h-10 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold ${
                validationError ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {validationError && (
              <p className="text-xs text-rose-500 font-medium">{validationError}</p>
            )}
          </div>

          {/* Status Toggle / Switch */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Account Status
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    status ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                <span className="text-xs font-bold text-slate-800">
                  {status ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                disabled={isSubmitting}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  status ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    status ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Inactive accounts will be disabled for transaction entry.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4.5 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{isEditMode ? "Save Changes" : "Create Account"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
