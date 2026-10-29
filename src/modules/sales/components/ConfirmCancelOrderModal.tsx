"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, FileText, Loader2, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { cancelSalesOrder, getOrderRemarks } from "../services/order.service";
import { refreshSalesBadges } from "@/store/salesStore";

interface ConfirmCancelOrderModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmCancelOrderModal({
  isOpen,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: ConfirmCancelOrderModalProps) {
  const [remarks, setRemarks] = useState("");
  const [existingRemarks, setExistingRemarks] = useState("");
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setRemarks("");
      setExistingRemarks("");
      setIsLoadingRemarks(true);

      getOrderRemarks(orderId)
        .then((res: any) => {
          const fetchedRemarks =
            typeof res === "string"
              ? res
              : res?.remarks || (Array.isArray(res) ? res[0]?.remarks : "") || "";
          if (fetchedRemarks) {
            setExistingRemarks(fetchedRemarks);
            setRemarks(fetchedRemarks);
          }
        })
        .catch((err) => {
          console.error("Error loading order remarks:", err);
        })
        .finally(() => {
          setIsLoadingRemarks(false);
        });
    } else {
      setRemarks("");
      setExistingRemarks("");
      setIsLoadingRemarks(false);
    }
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelSalesOrder(orderId, remarks.trim());
      alert("Order Cancelled Successfully");
      refreshSalesBadges();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to cancel order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-slate-50/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-rose-600" size={18} />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Cancel Sales Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={22} />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-slate-800 text-sm">
                Cancel Order {orderNumber ? `#${orderNumber}` : `#${orderId}`}?
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                This action cannot be undone and will mark the order as Cancelled.
              </p>
            </div>
          </div>

          {/* Existing Remarks Box or Loading Indicator */}
          {isLoadingRemarks ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs font-medium">
              <Loader2 className="animate-spin text-rose-500" size={14} />
              Fetching latest order remarks...
            </div>
          ) : existingRemarks ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                <FileText size={12} className="text-slate-400" />
                Previous Remarks
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{existingRemarks}</p>
            </div>
          ) : null}

          {/* Cancellation Remarks Textarea */}
          <div className="text-left">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                Cancellation Remarks / Reason
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Optional</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter reason for cancelling order (e.g. Customer cancelled, duplicate entry...)"
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all placeholder:text-slate-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Keep Order
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 border-none text-white font-bold cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
