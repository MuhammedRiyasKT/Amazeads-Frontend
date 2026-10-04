"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { X, User, Calculator, Image as ImageIcon, ZoomIn, Tag, Layers, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { getOrderById, getRoleSlug } from "../services/order.service";

interface ViewOrderModalProps {
  isOpen: boolean;
  orderId: number | null;
  role?: string;
  onClose: () => void;
}

export default function ViewOrderModal({ isOpen, orderId, role = "sales", onClose }: ViewOrderModalProps) {
  const pathname = usePathname() || "";
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enlarged preview lightbox state
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  // Determine effective department role from props or current pathname
  const effectiveRole = useMemo(() => {
    if (role && role !== "sales") {
      return getRoleSlug(role);
    }
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/project-manager")) return "project-manager";
    if (pathname.startsWith("/manager")) return "manager";
    if (pathname.startsWith("/sales")) return "sales";
    return getRoleSlug(role || "sales");
  }, [role, pathname]);

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      getOrderById(orderId, effectiveRole)
        .then((res) => {
          const data = res?.data?.id ? res.data : res?.id ? res : res?.data || res;
          setOrder(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId, effectiveRole]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Order Specifications
              </h3>
              {order?.id && (
                <span className="font-mono text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  {order.order_number || `#${order.id}`}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {isLoading || !order ? (
            <div className="p-16 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading specifications...</span>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              {/* Customer specs */}
              <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-slate-900 text-sm font-bold">{order.customer_name}</strong>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                      {order.customer_mobile_number} {order.customer_whatsapp_number && `· WhatsApp: ${order.customer_whatsapp_number}`}
                    </span>
                  </div>
                </div>

                {order.order_status && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
                    {order.order_status}
                  </span>
                )}
              </div>

              {/* Key Details: Order Type, Category, Price Category, Delivery Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-600">
                <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Order Type</span>
                  <p className="text-slate-800 font-bold text-xs capitalize">
                    {order.order_type || order.order_type_name || (order.is_quotation ? "Quotation" : "Standard Order")}
                  </p>
                </div>
                <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</span>
                  <p className="text-indigo-600 font-bold text-xs capitalize">
                    {order.category_name || order.category?.category_name || "—"}
                  </p>
                </div>
                <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Price Category</span>
                  <p className="text-indigo-700 font-bold text-xs capitalize">
                    {order.price_category_name || order.product_price_category_name || "—"}
                  </p>
                </div>
                <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Type</span>
                  <p className="text-slate-800 font-bold text-xs capitalize">
                    {order.delivery_type_name || order.delivery_type?.name || "—"}
                  </p>
                </div>
              </div>

              {/* Remarks / Notes */}
              {order.remarks && order.remarks !== "Nil" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Notes</span>
                  <div className="border border-slate-200 bg-slate-50/60 p-3 rounded-xl text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
                    {order.remarks}
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="border border-slate-200/80 p-3 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Billing Address</span>
                  <p className="text-slate-800 font-bold">{order.billing_address?.address_line_1 || "—"}</p>
                  {order.billing_address?.district && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {order.billing_address.district}, {order.billing_address.state} - {order.billing_address.pincode}
                    </p>
                  )}
                </div>
                <div className="border border-slate-200/80 p-3 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Address</span>
                  <p className="text-slate-800 font-bold">{order.shipping_address?.address_line_1 || order.delivery_address?.address_line_1 || "—"}</p>
                  {(order.shipping_address?.district || order.delivery_address?.district) && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {order.shipping_address?.district || order.delivery_address?.district}, {order.shipping_address?.state || order.delivery_address?.state} - {order.shipping_address?.pincode || order.delivery_address?.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Ordered Items / Projects */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ordered Items ({order.projects?.length || 0})
                </span>
                <div className="flex flex-col gap-3">
                  {order.projects?.map((proj: any, idx: number) => {
                    // Extract Image Code, Image Name, Image Category, and Primary Image
                    const imageCode = proj.image_code_details?.image_code || proj.image_code;
                    const imageName = proj.image_code_details?.image_name || proj.image_name;
                    const imageCategory = proj.image_code_details?.category_name || proj.image_category_name;
                    const primaryImg =
                      proj.image_code_details?.image_url ||
                      (proj.project_images && proj.project_images.length > 0 ? proj.project_images[0].img_url : null);

                    // Combine unique images
                    const allImages: Array<{ img_url: string }> = [
                      ...(proj.image_code_details?.image_url ? [{ img_url: proj.image_code_details.image_url }] : []),
                      ...(proj.project_images || []),
                    ].filter((img, i, arr) => arr.findIndex((t) => t.img_url === img.img_url) === i);

                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 p-4 bg-white rounded-xl shadow-2xs flex flex-col gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* 1. Image Thumbnail with Zoom Lightbox */}
                            <div
                              onClick={() => primaryImg && setActiveLightboxUrl(primaryImg)}
                              className="w-16 h-16 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-2xs relative group cursor-pointer"
                              title={primaryImg ? "Click to enlarge image" : "No image"}
                            >
                              {primaryImg ? (
                                <>
                                  <img
                                    src={primaryImg}
                                    alt={imageName || proj.project_name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <ZoomIn size={14} className="text-white" />
                                  </div>
                                </>
                              ) : (
                                <ImageIcon size={20} className="text-slate-400" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <strong className="text-slate-900 text-xs font-bold leading-snug">
                                {proj.project_name}
                              </strong>

                              {/* 2, 3, 4: Image Code, Image Name, and Image Category */}
                              {(imageCode || imageName || imageCategory) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {/* 2. Image Code */}
                                  {imageCode && (
                                    <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                      <Tag size={10} className="text-indigo-500" /> #{imageCode}
                                    </span>
                                  )}

                                  {/* 3. Image Name */}
                                  {imageName && (
                                    <span
                                      className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 truncate max-w-[220px]"
                                      title={imageName}
                                    >
                                      <ImageIcon size={11} className="text-slate-400 shrink-0" /> {imageName}
                                    </span>
                                  )}

                                  {/* 4. Image Category */}
                                  {imageCategory && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                      Category: {imageCategory}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Quantity & Unit Price */}
                              <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium mt-0.5">
                                <span>
                                  Qty: <strong className="text-slate-700">{proj.quantity}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Unit Price: <strong className="text-slate-700">₹{proj.unit_price}</strong>
                                </span>
                                {Number(proj.additional_amount) > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 font-semibold">+₹{proj.additional_amount} Addl</span>
                                  </>
                                )}
                              </div>

                              {/* Description */}
                              {proj.description && (
                                <span className="text-slate-500 italic text-[11px] line-clamp-2">
                                  "{proj.description}"
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount */}
                          <div className="flex flex-col sm:items-end justify-between self-stretch shrink-0">
                            <strong className="text-slate-900 font-extrabold text-sm sm:text-base">
                              ₹{proj.amount}
                            </strong>
                            {proj.status && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {proj.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extra Gallery Images */}
                        {allImages.length > 1 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                              All Images ({allImages.length}):
                            </span>
                            {allImages.map((img: any, imgIdx: number) => (
                              <div
                                key={imgIdx}
                                onClick={() => setActiveLightboxUrl(img.img_url)}
                                className="w-10 h-10 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-2xs flex-shrink-0 relative group"
                                title="Click to zoom image"
                              >
                                <img src={img.img_url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <ZoomIn size={10} className="text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Department Workflow Pills */}
                        {proj.departments && proj.departments.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                              Workflow:
                            </span>
                            {proj.departments.map((dept: any, dIdx: number) => (
                              <span
                                key={dIdx}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${
                                  dept.status?.toLowerCase() === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : dept.status?.toLowerCase() === "in progress"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {dept.department_name}: {dept.status}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing calculations */}
              <div className="border-t border-slate-200/80 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Sub Total</span>
                    <strong className="text-sm block text-slate-800 mt-1">₹{order.total_amount}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Discount</span>
                    <strong className="text-sm block text-slate-800 mt-1">
                      ₹{Number(order.discount_amount) > 0
                        ? Number(order.discount_amount)
                        : Math.max(
                            0,
                            Number(order.total_amount || 0) - Number(order.final_amount || 0)
                          )}
                    </strong>
                  </div>
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Paid Amount</span>
                    <strong className="text-sm block text-emerald-700 font-bold mt-1">₹{order.paid_amount}</strong>
                  </div>
                  <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                    <span className="text-[9px] font-bold text-rose-600 uppercase">Balance Due</span>
                    <strong className="text-sm block text-rose-700 font-bold mt-1">₹{order.balance_amount}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {activeLightboxUrl && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[3000] p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setActiveLightboxUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/60 text-white hover:bg-slate-900/90 p-2.5 rounded-full cursor-pointer z-50 transition-all border border-white/10 shadow-lg"
              title="Close image"
            >
              <X size={20} className="stroke-[2.5px]" />
            </button>
            <img
              src={activeLightboxUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/5 animate-scale-up"
            />
          </div>
        </div>
      )}
    </>
  );
}