"use client";

import React, { useEffect, useState } from "react";
import { X, User, Calculator, Image as ImageIcon, ZoomIn } from "lucide-react";
import Button from "@/components/ui/Button";
import { getOrderById } from "../services/order.service";

interface ViewOrderModalProps {
  isOpen: boolean;
  orderId: number | null;
  role?: string;
  onClose: () => void;
}

export default function ViewOrderModal({ isOpen, orderId, role = "sales", onClose }: ViewOrderModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // വലുതാക്കി കാണിക്കാനുള്ള ചിത്രത്തിന്റെ യുആർഎൽ സൂക്ഷിക്കുന്ന സ്റ്റേറ്റ് 🌟
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      getOrderById(orderId, role)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId, role]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm uppercase">Order Specifications</h3>
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
            <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              {/* Customer specs */}
              <div className="bg-slate-50 border p-4 rounded-xl flex items-center gap-4">
                <User className="text-indigo-600" size={24} />
                <div className="flex flex-col">
                  <strong className="text-slate-800 text-sm">{order.customer_name}</strong>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{order.customer_mobile_number} | whatsapp: {order.customer_whatsapp_number}</span>
                </div>
              </div>

              {/* Key Details: Order Type, Category, Price Category, Delivery Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-600">
                <div className="border p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Order Type</span>
                  <p className="text-slate-800 font-bold text-xs capitalize">
                    {order.order_type || order.order_type_name || (order.is_quotation ? "Quotation" : "Standard Order")}
                  </p>
                </div>
                <div className="border p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</span>
                  <p className="text-indigo-600 font-bold text-xs capitalize">
                    {order.category_name || order.category?.category_name || "—"}
                  </p>
                </div>
                <div className="border p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Price Category</span>
                  <p className="text-indigo-700 font-bold text-xs capitalize">
                    {order.price_category_name || order.product_price_category_name || "—"}
                  </p>
                </div>
                <div className="border p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Type</span>
                  <p className="text-slate-800 font-bold text-xs capitalize">
                    {order.delivery_type_name || order.delivery_type?.name || "—"}
                  </p>
                </div>
              </div>

              {/* Remarks / Notes Full Width */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Notes</span>
                <div className="border border-slate-200 bg-slate-50/50 p-3.5 rounded-xl text-slate-800 text-xs font-bold whitespace-pre-wrap leading-relaxed">
                  {order.remarks || "—"}
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="border p-3 rounded-lg bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Billing Address</span>
                  <p className="text-slate-800 font-bold">{order.billing_address?.address_line_1}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{order.billing_address?.district}, {order.billing_address?.state} - {order.billing_address?.pincode}</p>
                </div>
                <div className="border p-3 rounded-lg bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Address</span>
                  <p className="text-slate-800 font-bold">{order.shipping_address?.address_line_1}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{order.shipping_address?.district}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                </div>
              </div>

              {/* Projects / Items */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ordered Items ({order.projects?.length || 0})</span>
                <div className="flex flex-col gap-3">
                  {order.projects?.map((proj: any, idx: number) => {
                    const primaryImg = proj.project_images && proj.project_images.length > 0
                      ? proj.project_images[0].img_url
                      : null;

                    return (
                      <div key={idx} className="border p-4 bg-slate-50/50 rounded-xl flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            {/* ആദ്യത്തെ ചിത്രത്തിന്റെ ചെറിയ പ്രിവ്യൂ ബോക്സ് */}
                            <div
                              onClick={() => primaryImg && setActiveLightboxUrl(primaryImg)}
                              className="w-12 h-12 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-sm relative group cursor-pointer"
                              title="Click to zoom"
                            >
                              {primaryImg ? (
                                <>
                                  <img src={primaryImg} alt="product" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <ZoomIn size={12} className="text-white" />
                                  </div>
                                </>
                              ) : (
                                <ImageIcon size={18} className="text-slate-400" />
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <strong className="text-slate-800 text-xs font-bold">{proj.project_name}</strong>
                              <span className="text-slate-400">Qty: {proj.quantity} | Unit: ₹{proj.unit_price}</span>
                              {proj.description && <span className="text-slate-500 italic mt-0.5">"{proj.description}"</span>}
                            </div>
                          </div>
                          <strong className="text-slate-800 font-bold text-sm">₹{proj.amount}</strong>
                        </div>

                        {/* മൾട്ടിപ്പിൾ ഇമേജ് ഗാലറി ഡിസൈൻ ഇവിടെ ഉൾപ്പെടുത്തിയിരിക്കുന്നു 🌟 */}
                        {proj.project_images && proj.project_images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pl-15 border-t pt-2.5 mt-1 border-slate-100">
                            {proj.project_images.map((img: any, imgIdx: number) => (
                              <div
                                key={imgIdx}
                                onClick={() => setActiveLightboxUrl(img.img_url)}
                                className="w-10 h-10 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-sm flex-shrink-0 relative group"
                                title="Click to view large image"
                              >
                                <img src={img.img_url} alt="upload" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <ZoomIn size={10} className="text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing calculations */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Sub Total</span>
                    <strong className="text-sm block text-slate-800 mt-1">₹{order.total_amount}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Discount</span>
                    <strong className="text-sm block text-slate-800 mt-1">
                      ₹{Number(order.discount_amount) > 0
                        ? Number(order.discount_amount)
                        : Math.max(
                          0,
                          Number(order.total_amount || 0) -
                          Number(order.final_amount || 0)
                        )}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 uppercase text-emerald-600">Paid Amount</span>
                    <strong className="text-sm block text-emerald-600 font-bold mt-1">₹{order.paid_amount}</strong>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-red-600 uppercase">Balance Due</span>
                    <strong className="text-sm block text-red-700 font-bold mt-1">₹{order.balance_amount}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button variant="outline" size="sm" onClick={onClose}>Close Details</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          IMAGE LIGHTBOX OVERLAY (വലുതാക്കി വ്യക്തതയോടെ കാണാൻ) 🌟
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
              alt="Prisitin specification review"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-scale-up"
            />
          </div>
        </div>
      )}
    </>
  );
}