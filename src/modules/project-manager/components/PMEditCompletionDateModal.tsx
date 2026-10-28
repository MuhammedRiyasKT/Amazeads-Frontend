"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, AlertCircle, Hash, Edit3 } from "lucide-react";
import { updateOrderCompletionDate, assignOrderNumber, UserRole } from "../services/managerOrder.service";
import { formatDateStyle } from "@/lib/formatDate";

interface PMEditCompletionDateModalProps {
  isOpen: boolean;
  order: {
    id: number;
    order_number?: string | null;
    customer_name?: string;
    commit_date?: string | null;
    completion_date?: string | null;
    projects?: any[];
  } | null;
  role?: UserRole;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PMEditCompletionDateModal({
  isOpen,
  order,
  role = "project-manager",
  onClose,
  onSuccess,
}: PMEditCompletionDateModalProps) {
  const [completionDate, setCompletionDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setCompletionDate(order.completion_date ? order.completion_date.split("T")[0] : "");
      setOrderNumber(order.order_number || "");
      setError(null);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const validateCompletionDate = (valStr: string) => {
    if (!valStr) {
      setError("Please select a completion date.");
      return false;
    }

    if (order.commit_date) {
      const cVal = new Date(order.commit_date).setHours(0, 0, 0, 0);
      const val = new Date(valStr).setHours(0, 0, 0, 0);
      if (val < cVal) {
        setError(`Completion date cannot be earlier than Commit Date (${formatDateStyle(order.commit_date)})`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCompletionDate(completionDate)) {
      return;
    }

    const trimmedOrderNumber = orderNumber.trim();
    const originalOrderNumber = (order.order_number || "").trim();
    const isOrderNumberChanged = trimmedOrderNumber !== originalOrderNumber;

    const originalCompletionDate = order.completion_date ? order.completion_date.split("T")[0] : "";
    const isDateChanged = completionDate !== originalCompletionDate;

    if (!isOrderNumberChanged && !isDateChanged) {
      onClose();
      return;
    }

    if (isOrderNumberChanged && !trimmedOrderNumber) {
      setError("Please enter a valid order number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const promises: Promise<any>[] = [];

      if (isDateChanged) {
        promises.push(
          updateOrderCompletionDate(
            order.id,
            completionDate,
            role
          )
        );
      }

      if (isOrderNumberChanged) {
        promises.push(
          assignOrderNumber(order.id, trimmedOrderNumber)
        );
      }

      await Promise.all(promises);

      alert("Order details updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating order details:", err);
      const detail = err?.response?.data?.detail;
      let errMsg = "Failed to update order details. Please try again.";
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d: any) => d?.msg || (typeof d === "string" ? d : JSON.stringify(d))).join(", ");
      } else if (detail && typeof detail === "object" && detail.msg) {
        errMsg = detail.msg;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Edit3 size={17} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase leading-tight">
                Update Order Details
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 max-w-[280px] truncate">
                <span className="text-indigo-700 font-extrabold mr-1">
                  {order.order_number ? `#${order.order_number}` : `Order #${order.id}`}
                </span>
                {order.customer_name && <>— <span className="text-slate-800">{order.customer_name}</span></>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order reference banner */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Commit Date</span>
              <strong className="text-indigo-700 font-extrabold">{formatDateStyle(order.commit_date)}</strong>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Current Completion</span>
              <strong className="text-slate-700 font-extrabold">{formatDateStyle(order.completion_date)}</strong>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2 text-[11px] font-semibold text-rose-600 items-start">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Number Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-black tracking-wider flex items-center gap-1">
              <Hash size={12} className="text-indigo-600" />
              <span>Order Number</span>
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => {
                setOrderNumber(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. ART345"
              className="w-full bg-white border border-slate-200 focus:ring-indigo-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500 uppercase"
            />
            <span className="text-[10px] text-slate-400 font-medium">
              Update if staff entered the wrong order number.
            </span>
          </div>

          {/* Completion Date Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-slate-500 font-black tracking-wider flex items-center gap-1">
              <Calendar size={12} className="text-indigo-600" />
              <span>New Completion Target Date *</span>
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => {
                setCompletionDate(e.target.value);
                validateCompletionDate(e.target.value);
              }}
              min={order.commit_date ? order.commit_date.substring(0, 10) : undefined}
              className={`w-full bg-white border ${
                error ? "border-rose-300 focus:ring-rose-50" : "border-slate-200 focus:ring-indigo-50"
              } rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500 cursor-pointer`}
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t flex justify-end gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !completionDate || !!error}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
