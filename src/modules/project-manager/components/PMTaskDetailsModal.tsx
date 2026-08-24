"use client";

import React, { useEffect, useState } from "react";
import { X, ClipboardList, User, Calendar, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPMTaskDetailsById, UserRole } from "../services/managerOrder.service";

interface PMTaskDetailsModalProps {
  isOpen: boolean;
  taskId: number | null;
  onClose: () => void;
  role?: UserRole;
}

export default function PMTaskDetailsModal({ isOpen, taskId, onClose, role = "project-manager" }: PMTaskDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      setIsLoading(true);
      getPMTaskDetailsById(taskId, role)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, taskId, role]);

  if (!isOpen) return null;

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Task & Product Specifications</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500 font-semibold">Loading task specifications...</div>
        ) : !details ? (
          <div className="p-10 text-center text-xs text-red-500 font-semibold">Failed to load specifications.</div>
        ) : (
          <div className="p-6 flex flex-col gap-5 text-xs font-semibold text-slate-600 max-h-[80vh] overflow-y-auto">

            {/* Overview Grid */}
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
                <span className="text-[10px] text-slate-400 uppercase block">Product Name</span>
                <span className="font-bold text-indigo-600">{details.product_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Department Unit</span>
                <span className="font-bold text-slate-700 capitalize">
                  {details.department_name} {details.sub_department_name ? `(${details.sub_department_name})` : ""}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Commit Deadline</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Calendar size={11} /> {formatDateStyle(details.commit_date)}
                </span>
              </div>
            </div>

            {/* Staff Info */}
            <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100 text-[11px]">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-indigo-600" />
                <span>Created By: <strong className="text-slate-800">{details.created_by_staff_name || "Aslam"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-indigo-600" />
                <span>Assigned By: <strong className="text-slate-800">{details.assigned_by_staff_name || "Roshan"}</strong></span>
              </div>
            </div>

            {/* Artwork Images Section */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Product Artwork Images</h4>
              {details.images && details.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {details.images.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative border rounded-lg overflow-hidden bg-slate-900/5 flex items-center justify-center p-2">
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="max-h-48 object-contain rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-center text-xs">No artwork image uploaded.</div>
              )}
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