"use client";

import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, Calendar, User, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPrintingTaskDetails } from "../services/printingTask.service";

interface PrintingTaskDetailsModalProps {
  isOpen: boolean;
  taskId: number | null;
  onClose: () => void;
}

export default function PrintingTaskDetailsModal({ isOpen, taskId, onClose }: PrintingTaskDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      setIsLoading(true);
      getPrintingTaskDetails(taskId)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Printing Specifications & Design File</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500 font-semibold">Loading project details & artwork...</div>
        ) : !details ? (
          <div className="p-10 text-center text-xs text-red-500 font-semibold">Failed to load specifications.</div>
        ) : (
          <div className="p-6 flex flex-col gap-5 text-xs font-semibold text-slate-600 max-h-[80vh] overflow-y-auto">
            
            {/* Top Order Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order Number</span>
                <span className="font-extrabold text-slate-800 text-sm">#{details.order_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Customer Name</span>
                <span className="font-bold text-slate-700">{details.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Product Name</span>
                <span className="font-bold text-indigo-600">{details.product_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Printing Unit</span>
                <span className="font-bold text-slate-700">{details.sub_department_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Print Deadline</span>
                <span className="font-bold text-slate-700">{details.printing_date || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Design Status</span>
                <span className="font-bold text-emerald-600 capitalize">{details.designing_status || "—"}</span>
              </div>
            </div>

            {/* Approved Artwork Images Section */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Approved Design Artwork File</h4>
              {details.images && details.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {details.images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative group border rounded-lg overflow-hidden bg-slate-900/5 flex items-center justify-center p-2">
                      <img src={imgUrl} alt={`Artwork ${idx + 1}`} className="max-h-56 object-contain rounded" />
                      <a 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Open Full Image
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-center text-xs">No print image uploaded for this task.</div>
              )}
            </div>

            {/* Designer Details */}
            <div className="flex items-center justify-between border-t pt-3 text-[11px] text-slate-500">
              <span>Assigned By: <strong className="text-slate-700">{details.design_assigned_by_name || "—"}</strong></span>
              <span>Designer: <strong className="text-slate-700">{details.design_assigned_to_name || "—"}</strong></span>
            </div>

            <div className="flex justify-end border-t pt-3">
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}