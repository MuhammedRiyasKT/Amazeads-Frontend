"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { cancelSalesOrder } from "../services/order.service";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelSalesOrder(orderId);
      alert("Order Cancelled Successfully");
      refreshSalesBadges();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.message || err.message || "Failed to cancel order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-rose-600" size={18} />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Cancel Sales Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              Cancel Order {orderNumber ? `#${orderNumber}` : `#${orderId}`}?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Keep Order
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 border-none text-white font-bold cursor-pointer"
            >
              {isSubmitting ? "Cancelling..." : "Yes, Cancel Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
