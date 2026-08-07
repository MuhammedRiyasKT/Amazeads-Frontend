"use client";

import React, { useEffect, useState } from "react";
import { X, Truck, Calendar, Tag } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDeliveryTypes, moveOrderToTransit } from "../services/courierTracking.service";

interface MoveToTransitModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber: string | null;
  defaultDeliveryTypeId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MoveToTransitModal({
  isOpen,
  orderId,
  orderNumber,
  defaultDeliveryTypeId,
  onClose,
  onSuccess,
}: MoveToTransitModalProps) {
  const [deliveryTypes, setDeliveryTypes] = useState<any[]>([]);
  const [trackingId, setTrackingId] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState<number>(0);
  const [expectedDays, setExpectedDeliveryDays] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getDeliveryTypes()
        .then((types) => {
          setDeliveryTypes(types || []);
          if (defaultDeliveryTypeId) {
            setDeliveryTypeId(defaultDeliveryTypeId);
          } else if (types && types.length > 0) {
            setDeliveryTypeId(types[0].id);
          }
        })
        .catch(console.error);

      setTrackingId("");
      setExpectedDeliveryDays(3);
    }
  }, [isOpen, defaultDeliveryTypeId]);

  if (!isOpen || !orderId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      alert("Please enter a Tracking ID / Waybill Number!");
      return;
    }
    if (!deliveryTypeId) {
      alert("Please select a Courier / Delivery Method!");
      return;
    }

    setIsSubmitting(true);
    try {
      await moveOrderToTransit(orderId, {
        tracking_id: trackingId.trim(),
        expected_delivery_days: Number(expectedDays),
        delivery_type_id: Number(deliveryTypeId),
      });
      alert(`Order #${orderNumber || orderId} moved to Transit successfully!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Failed to move order to transit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck className="text-indigo-600" size={20} />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Move To Transit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-600">
          
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-slate-700">
            Dispatching Order: <strong className="text-indigo-900 font-extrabold">#{orderNumber || orderId}</strong>
          </div>

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
            />
          </div>

          {/* Delivery Method Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery / Courier Method *</label>
            <select
              value={deliveryTypeId}
              onChange={(e) => setDeliveryTypeId(parseInt(e.target.value))}
              className="h-10 border border-slate-300 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              required
            >
              <option value={0}>Select Delivery Type</option>
              {deliveryTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name.toUpperCase()}
                </option>
              ))}
            </select>
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
              onChange={(e) => setExpectedDeliveryDays(parseInt(e.target.value) || 1)}
              className="h-10 border border-slate-300 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !trackingId.trim() || !deliveryTypeId}>
              {isSubmitting ? "Dispatching..." : "Save & Move To Transit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}