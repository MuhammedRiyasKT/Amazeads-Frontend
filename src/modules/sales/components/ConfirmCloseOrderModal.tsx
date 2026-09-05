"use client";

import React, { useState } from "react";
import { X, Lock, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { closeSalesOrder } from "../services/order.service";
import { refreshSalesBadges } from "@/store/salesStore";

interface ConfirmCloseOrderModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfirmCloseOrderModal({
  isOpen,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: ConfirmCloseOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleConfirmClose = async () => {
    setIsSubmitting(true);
    try {
      await closeSalesOrder(orderId);
      alert("Order Closed Successfully");
      refreshSalesBadges();
      onSuccess();
    } catch (err: any) {
      console.error("Error closing order:", err);
      alert("Failed to close order");
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
            <Lock className="text-purple-600" size={18} />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Close Sales Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Close Order #{orderNumber || orderId}?</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Are you sure you want to officially close this order? This action will archive the order in historical records.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleConfirmClose} 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 border-none text-white font-bold cursor-pointer"
            >
              {isSubmitting ? "Closing..." : "Yes, Close Order"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}