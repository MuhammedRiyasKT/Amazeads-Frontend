// src/modules/expenses/components/DeleteExpenseDialog.tsx

"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Expense } from "../types";

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  expense: Expense | null;
}

export default function DeleteExpenseDialog({
  isOpen,
  onClose,
  onConfirm,
  expense,
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !expense) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[2500] flex items-center justify-center p-4">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Dialog Box */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden z-10 border animate-zoom-in">
        {/* Header Alert Icon */}
        <div className="p-5 flex items-start gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Delete Expense?
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Are you sure you want to delete this expense? This action is permanent and cannot be undone.
            </p>

            {/* Target Item Summary */}
            <div className="bg-slate-50 border rounded-lg p-3.5 mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate pr-2">
                {expense.category_name}
              </span>
              <strong className="text-slate-900 text-sm font-extrabold shrink-0">
                ₹{(expense.amount || 0).toLocaleString("en-IN")}.00
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-5 py-3.5 flex items-center justify-end gap-2.5 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="cursor-pointer font-bold bg-rose-600 text-white hover:bg-rose-500 flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Expense"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
