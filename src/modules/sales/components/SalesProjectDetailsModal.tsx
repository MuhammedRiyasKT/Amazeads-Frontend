"use client";

import React, { useEffect, useState } from "react";
import { X, User, Layout, ZoomIn, Calendar, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { getSalesProjectById } from "../services/designApproval.service";

interface SalesProjectDetailsModalProps {
  isOpen: boolean;
  projectId: number | null;
  onClose: () => void;
}

export default function SalesProjectDetailsModal({ isOpen, projectId, onClose }: SalesProjectDetailsModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      setIsLoading(true);
      getSalesProjectById(projectId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  // പ്രൊജക്റ്റുകളിൽ നിന്നും കറന്റ് സെലക്ട് ചെയ്ത പ്രൊജക്റ്റ് ഒബ്ജക്റ്റ് കണ്ടെത്തുന്നു
  const currentProject = order?.projects?.find((p: any) => p.id === projectId) || order?.projects?.[0];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layout className="text-indigo-600" size={18} />
              <h3 className="font-bold text-slate-800 text-sm uppercase">Project Design Specifications</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-all">
              <X size={20} />
            </button>
          </div>

          {isLoading || !order ? (
            <div className="p-12 text-center text-slate-500 font-semibold">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading specifications...
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto text-xs font-semibold text-slate-600">

              {/* Customer specs */}
              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-slate-800 text-sm">{order.customer_name}</strong>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      {order.customer_mobile_number} {order.customer_whatsapp_number ? `| whatsapp: ${order.customer_whatsapp_number}` : ""}
                    </span>
                  </div>
                </div>

                {order.created_by_name && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto shadow-2xs">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Created By:</span>
                    <span className="text-indigo-900 font-black">{order.created_by_name}</span>
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Product Name</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5">{currentProject?.project_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID (Number)</span>
                  <span className="text-slate-800 font-bold text-xs mt-0.5">{order.order_number || `Order #${order.id}`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <span className="text-indigo-600 font-bold text-xs mt-0.5 capitalize">{currentProject?.category_name || order.price_category_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Created By</span>
                  <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs font-extrabold mt-0.5 inline-block self-start">
                    {order.created_by_name || "—"}
                  </span>
                </div>
              </div>

              {/* Deadlines */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Commit Date</span>
                  <span className="text-slate-800 font-bold mt-0.5">{order.commit_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Design Deadline</span>
                  <span className="text-indigo-600 font-bold mt-0.5">{currentProject?.design_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Print Deadline</span>
                  <span className="text-slate-800 font-bold mt-0.5">{currentProject?.printing_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Completion Date</span>
                  <span className="text-emerald-600 font-bold mt-0.5">{order.completion_date || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Type</span>
                  <span className="text-slate-800 font-bold mt-0.5 capitalize">{order.delivery_type_name || "—"}</span>
                </div>
              </div>

              {/* Image Gallery 🌟 */}
              {currentProject?.project_images && currentProject.project_images.length > 0 && (
                <div className="flex flex-col gap-2 border-t pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Project Image Files ({currentProject.project_images.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.project_images.map((img: any, imgIdx: number) => (
                      <div
                        key={imgIdx}
                        onClick={() => setActiveLightboxUrl(img.img_url)}
                        className="w-14 h-14 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-sm flex-shrink-0 relative group"
                        title="Click to view large image"
                      >
                        <img src={img.img_url} alt="gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <ZoomIn size={12} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sourcing Specs */}
              {currentProject?.description && (
                <div className="flex flex-col gap-1 border-t pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Custom Specification notes</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border italic">"{currentProject.description}"</p>
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
              alt="Design spec"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-scale-up"
            />
          </div>
        </div>
      )}
    </>
  );
}