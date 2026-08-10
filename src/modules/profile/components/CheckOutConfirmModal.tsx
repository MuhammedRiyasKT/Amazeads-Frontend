// src/modules/profile/components/CheckOutConfirmModal.tsx

"use client";

import React from "react";
import { LogOut, X } from "lucide-react";

interface CheckOutConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CheckOutConfirmModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: CheckOutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2500] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 flex flex-col gap-5 text-center animate-in fade-in zoom-in duration-150">
        <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <LogOut size={26} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-extrabold text-slate-900 text-base">
            Are you sure you want to check out?
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Your attendance will be marked as completed for today.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isLoading ? "Checking Out..." : "Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
