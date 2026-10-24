// src/modules/products/components/DeliveryTypeDialog.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Truck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { DeliveryType } from "../types/deliveryType";
import { createDeliveryType, updateDeliveryType } from "../services/deliveryType.service";

interface DeliveryTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: DeliveryType | null;
}

export default function DeliveryTypeDialog({
  isOpen,
  onClose,
  onSuccess,
  item,
}: DeliveryTypeDialogProps) {
  const isEditMode = item !== null;
  const [name, setName] = useState("");
  const [status, setStatus] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name || "");
        setStatus(item.status !== undefined ? Boolean(item.status) : true);
      } else {
        setName("");
        setStatus(true);
      }
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("Delivery type name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEditMode && item) {
        await updateDeliveryType(item.id, {
          name: trimmedName,
          status,
        });
      } else {
        await createDeliveryType({
          name: trimmedName,
          status,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save delivery type:", err);
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to save delivery type. Please try again.";
      setErrorMsg(typeof backendMessage === "string" ? backendMessage : JSON.stringify(backendMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Truck size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditMode ? "Edit Delivery Type" : "Add Delivery Type"}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {isEditMode
                  ? "Update delivery method information"
                  : "Define a new shipping or fulfillment method"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Method Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Pickup, DTDC, KSRTC..."
              required
              disabled={isSubmitting}
              autoFocus
              className="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all capitalize"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Status *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus(true)}
                disabled={isSubmitting}
                className={`h-10 px-3.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  status
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 size={15} className={status ? "text-emerald-600" : "text-slate-400"} />
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus(false)}
                disabled={isSubmitting}
                className={`h-10 px-3.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !status
                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${!status ? "bg-rose-500" : "bg-slate-400"}`} />
                Inactive
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="cursor-pointer font-bold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Save Changes" : "Create Method"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
