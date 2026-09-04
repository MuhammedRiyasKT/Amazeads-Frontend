"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, User, Layout, ZoomIn, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDesignerProjectDetails } from "../services/designerTask.service";

interface DesignerTaskDetailsModalProps {
  isOpen: boolean;
  taskId: number | null;
  task?: any;
  onClose: () => void;
}

export default function DesignerTaskDetailsModal({ isOpen, taskId, task, onClose }: DesignerTaskDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      setIsLoading(true);
      getDesignerProjectDetails(taskId)
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
    <>
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layout className="text-indigo-600" size={18} />
              <h3 className="font-bold text-slate-800 text-sm uppercase">Artwork / Project Specifications</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-all">
              <X size={20} />
            </button>
          </div>

          {isLoading || !details ? (
            <div className="p-12 text-center text-slate-500 font-semibold">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading specifications...
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto text-xs font-semibold text-slate-600">
              
              {/* Customer specs */}
              <div className="bg-slate-50 border p-4 rounded-xl flex items-center gap-4">
                <User className="text-indigo-600" size={24} />
                <div className="flex flex-col">
                  <strong className="text-slate-800 text-sm">{details.customer_name}</strong>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{details.mobile_number} | Whatsapp: {details.whatsapp_number}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Product Name</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5">{details.product_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID (Number)</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5">{details.order_number || `Order #${details.order_id}`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <span className="text-indigo-600 font-bold text-xs mt-0.5 capitalize">{details.category_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order Type</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5 capitalize">{orderType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Created By</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5">{createdBy}</span>
                </div>
              </div>

              {/* Deadlines Mapped */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Commit Date</span>
                  <span className="text-slate-800 font-bold mt-0.5">{details.commit_date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Design Deadline</span>
                  <span className="text-indigo-600 font-bold mt-0.5">{details.design_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Print Deadline</span>
                  <span className="text-slate-800 font-bold mt-0.5">{details.printing_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Completion Deadline</span>
                  <span className="text-slate-800 font-bold mt-0.5">{details.completed_date || "—"}</span>
                </div>
              </div>

              {/* Image Gallery (നിർദ്ദേശിച്ച മൾട്ടിപ്പിൾ ഇമേജ് ഗാലറി) 🌟 */}
              {details.images && details.images.length > 0 && (
                <div className="flex flex-col gap-2 border-t pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Project Image Files ({details.images.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {details.images.map((imgUrl: string, imgIdx: number) => (
                      <div 
                        key={imgIdx} 
                        onClick={() => setActiveLightboxUrl(imgUrl)}
                        className="w-14 h-14 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-sm flex-shrink-0 relative group"
                        title="Click to view large image"
                      >
                        <img src={imgUrl} alt="gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <ZoomIn size={12} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Notes / Task Description */}
              {taskDesc && (
                <div className="flex flex-col gap-1 border-t pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Task Description</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border italic">"{taskDesc}"</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end p-4 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>Close Details</Button>
          </div>
        </div>
      </div>

      {/* ==========================================
          IMAGE LIGHTBOX OVERLAY 🌟
          ========================================== */}
      {activeLightboxUrl && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[3000] p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center bg-white/5 rounded-xl overflow-hidden p-2">
            <button 
              onClick={() => setActiveLightboxUrl(null)} 
              className="absolute top-4 right-4 bg-slate-900/60 text-white hover:bg-slate-900/90 p-2.5 rounded-full cursor-pointer z-50 transition-all border border-white/10 shadow-lg"
              title="Close image"
            >
              <X size={20} className="stroke-[2.5px]" />
            </button>
            <img 
              src={activeLightboxUrl} 
              alt="Artspec detail" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-scale-up" 
            />
          </div>
        </div>
      )}
    </>
  );
}