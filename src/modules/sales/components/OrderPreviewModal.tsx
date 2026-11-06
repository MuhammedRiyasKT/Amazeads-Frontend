"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  User,
  Phone,
  Calendar,
  Truck,
  CreditCard,
  Package,
  MapPin,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Check,
} from "lucide-react";
import Button from "@/components/ui/Button";

export interface OrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;

  // Customer Details
  customerId: number;
  customerName: string;
  mobileSearch: string;
  whatsappNumber: string;
  billingAddress: string;
  billingDistrict: string;
  billingState: string;
  billingPincode: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryState: string;
  deliveryPincode: string;
  sameAsBilling: boolean;

  // Schedule & Order Info
  commitDate: string;
  completionDate: string;
  deliveryTypeName: string;
  orderType: string;

  // Products
  projects: any[];
  departments: any[];

  // Financials
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  paymentType: string;
  accountName: string;
  remarks: string;
}

export default function OrderPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  isEditMode = false,

  customerId,
  customerName,
  mobileSearch,
  whatsappNumber,
  billingAddress,
  billingDistrict,
  billingState,
  billingPincode,
  deliveryAddress,
  deliveryDistrict,
  deliveryState,
  deliveryPincode,
  sameAsBilling,

  commitDate,
  completionDate,
  deliveryTypeName,
  orderType,

  projects,
  departments,

  totalAmount,
  discount,
  finalAmount,
  paidAmount,
  paymentType,
  accountName,
  remarks,
}: OrderPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const balanceDue = Math.max(0, finalAmount - paidAmount);

  const getDepartmentNames = (deptIds?: number[]) => {
    if (!deptIds || deptIds.length === 0) return "None";
    return deptIds
      .map((id) => {
        const found = departments.find((d) => d.id === id);
        return found ? found.department_name : `#${id}`;
      })
      .join(", ");
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[86vh] my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isEditMode ? "Confirm Order Update" : "Review Order Before Submission"}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                {orderType || "Order"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Please double-check all details below to prevent order errors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">

          {/* Section 1: Customer Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User size={15} className="text-indigo-600" />
                <span className="font-bold text-slate-800 text-sm">Customer Details</span>
              </div>
              <div>
                {customerId > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Existing Customer #{customerId}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    New Customer (Will be created)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Customer Name</span>
                <span className="font-bold text-slate-800 text-sm">{customerName || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mobile Number</span>
                <span className="font-bold text-slate-800">{mobileSearch || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">WhatsApp</span>
                <span className="font-bold text-slate-800">{whatsappNumber || "—"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-150">
              <div>
                <span className="text-slate-400 block font-medium">Billing Address</span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {billingAddress ? `${billingAddress}, ${billingDistrict}, ${billingState} - ${billingPincode}` : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Delivery Address</span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {sameAsBilling
                    ? "Same as Billing Address"
                    : deliveryAddress
                    ? `${deliveryAddress}, ${deliveryDistrict}, ${deliveryState} - ${deliveryPincode}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Delivery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-3.5">
            <div>
              <span className="text-slate-400 block font-medium">Commit (Order) Date</span>
              <span className="font-bold text-slate-800">{commitDate || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Expected Completion</span>
              <span className="font-bold text-slate-800">{completionDate || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Delivery Mode</span>
              <span className="font-bold text-slate-800">{deliveryTypeName || "Standard"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Order Type</span>
              <span className="font-bold text-slate-800">{orderType || "Online"}</span>
            </div>
          </div>

          {/* Section 3: Products Breakdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-indigo-600" />
                <span className="font-bold text-slate-800">Products ({projects.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Total Units: {projects.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0)}
              </span>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2 px-3 w-8">#</th>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3">Departments</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {projects.map((proj, idx) => {
                    const rowAmount =
                      Number(proj.quantity || 0) * Number(proj.unit_price || 0) +
                      Number(proj.additional_amount || 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">{proj.project_name || "—"}</span>
                          {proj.image_code && (
                            <span className="text-[10px] text-indigo-600 font-mono block">
                              Code: {proj.image_code}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {getDepartmentNames(proj.department_ids)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {proj.quantity}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          ₹{(Number(proj.unit_price) || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-700">
                          ₹{(Number(rowAmount) || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Billing & Financial Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method Info */}
              <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={15} className="text-indigo-600" />
                  <span className="font-bold text-slate-800">Payment & Account</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-800">{paymentType || "Not Selected"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Receiving Account</span>
                  <span className="font-bold text-slate-800">{accountName || "Not Selected"}</span>
                </div>
                {remarks && (
                  <div>
                    <span className="text-slate-400 block font-medium">Remarks / Notes</span>
                    <span className="text-slate-600 italic block">{remarks}</span>
                  </div>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-1.5 text-right flex flex-col justify-center">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-700">₹{(Number(totalAmount) || 0).toLocaleString("en-IN")}</span>
                </div>
                {Number(discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{(Number(discount) || 0).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Final Total:</span>
                  <span className="text-indigo-700 text-base">₹{(Number(finalAmount) || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid Amount (Advance):</span>
                  <span className="font-bold text-emerald-700">₹{(Number(paidAmount) || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                  <span>Balance Remaining:</span>
                  <span className={balanceDue > 0 ? "text-amber-600" : "text-emerald-600"}>
                    ₹{(Number(balanceDue) || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="gap-2 cursor-pointer font-bold"
          >
            <ArrowLeft size={15} />
            <span>Edit / Go Back</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isEditMode ? "Updating Order..." : "Submitting Order..."}</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{isEditMode ? "Confirm & Update Order" : "Confirm & Place Order"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
