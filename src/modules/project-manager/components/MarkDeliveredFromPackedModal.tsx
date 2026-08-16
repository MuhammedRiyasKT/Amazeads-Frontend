"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, FileText, Truck, Tag, Calendar, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDeliveryTypes, markOrderDeliveredFromPacked, moveOrderToTransit } from "../services/courierTracking.service";

interface MarkDeliveredFromPackedModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber: string | null;
  deliveryTypeName?: string;
  defaultDeliveryTypeId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkDeliveredFromPackedModal({
  isOpen,
  orderId,
  orderNumber,
  deliveryTypeName,
  defaultDeliveryTypeId,
  onClose,
  onSuccess,
}: MarkDeliveredFromPackedModalProps) {
  const [deliveryTypes, setDeliveryTypes] = useState<any[]>([]);
  const [selectedDeliveryTypeId, setSelectedDeliveryTypeId] = useState<number>(defaultDeliveryTypeId || 0);
  const [invoiceId, setInvoiceId] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [expectedDays, setExpectedDays] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct delivery type names (Customer Pickup / Self Installation)
  const DIRECT_DELIVERY_NAMES = ["customer pickup", "self installation"];

  useEffect(() => {
    if (isOpen) {
      setInvoiceId("");
      setTrackingId("");
      setExpectedDays(3);
      
      if (defaultDeliveryTypeId) {
        setSelectedDeliveryTypeId(defaultDeliveryTypeId);
      }

      getDeliveryTypes()
        .then((types) => {
          setDeliveryTypes(types || []);
          if (!defaultDeliveryTypeId && types && types.length > 0) {
            setSelectedDeliveryTypeId(types[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, defaultDeliveryTypeId]);

  if (!isOpen || !orderId) return null;

  // 🌟 ഓർഡറിന്റെ നിലവിലെ ഡെലിവറി ടൈപ്പ് നെയിം കണ്ടെത്തുന്നു
  const currentDeliveryName =
    deliveryTypeName ||
    deliveryTypes.find((dt) => dt.id === selectedDeliveryTypeId)?.name ||
    "Customer Pickup";

  const isDirectDelivery = DIRECT_DELIVERY_NAMES.includes(currentDeliveryName.toLowerCase().trim()) || selectedDeliveryTypeId === 1 || selectedDeliveryTypeId === 2;
  const isTransitMode = !isDirectDelivery;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDirectDelivery) {
      // Direct Delivery -> Mark Delivered directly
      if (!invoiceId.trim()) {
        alert("Please enter an Invoice ID before marking as delivered!");
        return;
      }
      setIsSubmitting(true);
      try {
        await markOrderDeliveredFromPacked(orderId, invoiceId.trim());
        alert(`Order #${orderNumber || orderId} marked as Delivered successfully!`);
        onSuccess();
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.detail || "Failed to mark order as delivered.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Courier Delivery -> Move to Transit
      if (!trackingId.trim()) {
        alert("Please enter a Tracking ID / Waybill Number!");
        return;
      }
      const activeTypeId = selectedDeliveryTypeId || defaultDeliveryTypeId || 8;

      setIsSubmitting(true);
      try {
        await moveOrderToTransit(orderId, {
          tracking_id: trackingId.trim(),
          expected_delivery_days: Number(expectedDays),
          delivery_type_id: Number(activeTypeId),
        });
        alert(`Order #${orderNumber || orderId} moved to Transit successfully!`);
        onSuccess();
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.detail || "Failed to move order to transit.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isTransitMode ? "bg-indigo-50/50" : "bg-emerald-50/50"}`}>
          <div className="flex items-center gap-2">
            {isTransitMode ? (
              <Truck className="text-indigo-600" size={20} />
            ) : (
              <CheckCircle2 className="text-emerald-600" size={20} />
            )}
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
              {isTransitMode ? "Move To Transit" : "Mark As Delivered"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-600">

          {/* Order Info Banner */}
          <div className={`p-3 rounded-xl border text-slate-700 ${isTransitMode ? "bg-indigo-50/60 border-indigo-100" : "bg-emerald-50/70 border-emerald-100"}`}>
            Order <strong className={`font-extrabold ${isTransitMode ? "text-indigo-900" : "text-emerald-900"}`}>#{orderNumber || orderId}</strong>
            {" — "}
            {isTransitMode ? (
              <span>Dispatching to <strong className="text-indigo-800">Transit</strong></span>
            ) : (
              <span>Marking as <strong className="text-emerald-800">Delivered</strong></span>
            )}
          </div>

          {/* 🌟 STATIC DELIVERY METHOD DISPLAY (No Dropdown Select - Fixed Display) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
              <ShieldCheck size={12} className="text-slate-400" /> Delivery / Courier Method
            </span>
            <div className="h-10 border border-slate-200 bg-slate-50 rounded-xl px-3 flex items-center justify-between font-bold text-xs text-slate-800">
              <span className="capitalize font-black text-slate-900">{currentDeliveryName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-extrabold uppercase">
                {isDirectDelivery ? "Direct" : "Courier"}
              </span>
            </div>
            {isDirectDelivery && (
              <span className="text-[10px] text-emerald-600 font-bold">
                ✓ Direct delivery — can mark as Delivered without Transit.
              </span>
            )}
            {isTransitMode && (
              <span className="text-[10px] text-indigo-600 font-bold">
                ✓ Courier delivery — order will be moved to Transit.
              </span>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* ── DIRECT DELIVERY FIELDS ── */}
          {isDirectDelivery && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <FileText size={12} className="text-emerald-600" /> Invoice ID *
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-00123"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="h-10 border border-slate-300 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                required
                autoFocus
              />
            </div>
          )}

          {/* ── TRANSIT COURIER FIELDS ── */}
          {isTransitMode && (
            <>
              {/* Tracking ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Tag size={12} className="text-indigo-600" /> Tracking ID / Waybill Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DTDC-80491823, KSRTC-9041..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="h-10 border border-slate-300 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  required
                  autoFocus
                />
              </div>

              {/* Expected Delivery Days */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={12} className="text-indigo-600" /> Expected Delivery Days *
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={expectedDays}
                  onChange={(e) => setExpectedDays(parseInt(e.target.value) || 1)}
                  className="h-10 border border-slate-300 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  required
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t mt-1">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={
                isSubmitting ||
                (isDirectDelivery && !invoiceId.trim()) ||
                (isTransitMode && !trackingId.trim())
              }
              className={`border-none text-white font-bold ${
                isTransitMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting
                ? isTransitMode
                  ? "Dispatching..."
                  : "Marking Delivered..."
                : isTransitMode
                ? "Save & Move To Transit"
                : "Confirm Delivered"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}