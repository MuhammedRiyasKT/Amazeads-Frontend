"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { markOrderDelivered } from "../services/courierTracking.service";

interface MarkDeliveredModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkDeliveredModal({
  isOpen,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: MarkDeliveredModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await markOrderDelivered(orderId);
      alert(`Order #${orderNumber || orderId} marked as Delivered!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Failed to mark order as delivered");
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
            <CheckCircle2 className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Confirm Delivery</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Mark Order Delivered?</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Are you sure Order <strong className="text-slate-800">#{orderNumber || orderId}</strong> has been successfully received by the customer?
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 border-none text-white font-bold"
            >
              {isSubmitting ? "Updating..." : "Yes, Mark Delivered"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}