// src/modules/admin/components/DeleteAccountDialog.tsx

"use client";

import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  accountName: string;
  isDeleting: boolean;
  error?: string | null;
}

export default function DeleteAccountDialog({
  isOpen,
  onClose,
  onConfirm,
  accountName,
  isDeleting,
  error,
}: DeleteAccountDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Delete Account</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-800">"{accountName}"</span>? This action
            cannot be undone.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4.5 h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
