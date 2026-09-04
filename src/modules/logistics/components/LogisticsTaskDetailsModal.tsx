"use client";

import React, { useEffect, useState } from "react";
import { X, Truck, Phone, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { getLogisticsTaskDetails } from "../services/logisticsTask.service";

interface LogisticsTaskDetailsModalProps {
  isOpen: boolean;
  taskId: number | null;
  task?: any;
  onClose: () => void;
}

export default function LogisticsTaskDetailsModal({ isOpen, taskId, task, onClose }: LogisticsTaskDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      setIsLoading(true);
      getLogisticsTaskDetails(taskId)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const taskDesc = details?.task_description || details?.description || task?.task_description || task?.description;
  const createdBy = details?.created_by_staff_name || details?.created_by_name || task?.created_by_staff_name || task?.created_by_name || details?.assigned_by_name || task?.assigned_by_name || "—";
  const orderType = details?.order_type || details?.order_type_name || task?.order_type || task?.order_type_name || "—";

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Logistics & Dispatch Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500 font-semibold">Loading logistics information...</div>
        ) : !details ? (
          <div className="p-10 text-center text-xs text-red-500 font-semibold">Failed to load details.</div>
        ) : (
          <div className="p-6 flex flex-col gap-5 text-xs font-semibold text-slate-600 max-h-[80vh] overflow-y-auto">
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order Number</span>
                <span className="font-extrabold text-slate-800 text-sm">#{details.order_number || details.order_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Customer Name</span>
                <span className="font-bold text-slate-700">{details.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Mobile Number</span>
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  <Phone size={11} /> {details.mobile_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">WhatsApp Number</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <MessageSquare size={11} /> {details.whatsapp_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Product Name</span>
                <span className="font-bold text-slate-700">{details.product_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order Type</span>
                <span className="font-bold text-slate-700 capitalize">{orderType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Created By</span>
                <span className="font-bold text-slate-800">{createdBy}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Product Images</h4>
              {details.images && details.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {details.images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative border rounded-lg overflow-hidden bg-slate-900/5 flex items-center justify-center p-2">
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="max-h-48 object-contain rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-center text-xs">No images available.</div>
              )}
            </div>

            {/* Task Description */}
            {taskDesc && (
              <div className="flex flex-col gap-1 border-t pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Task Description</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border italic">"{taskDesc}"</p>
              </div>
            )}

            <div className="flex justify-end border-t pt-3">
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}