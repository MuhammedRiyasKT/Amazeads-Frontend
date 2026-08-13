"use client";

import React, { useEffect, useState } from "react";
import { X, CreditCard, IndianRupee, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { getOrderPaymentDetails, updateOrderPayment, getSalesAccounts } from "../services/order.service";

interface UpdatePaymentModalProps {
  isOpen: boolean;
  orderId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdatePaymentModal({
  isOpen,
  orderId,
  onClose,
  onSuccess,
}: UpdatePaymentModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("Partial");
  const [accountId, setAccountId] = useState<number>(1);

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      Promise.all([getOrderPaymentDetails(orderId), getSalesAccounts()])
        .then(([payData, accs]) => {
          setDetails(payData);
          setAccounts(accs || []);
          setPaidAmount(payData.paid_amount || 0);
          setPaymentStatus(payData.payment_status || "Partial");
          setAccountId(payData.account_id || accs?.[0]?.id || 1);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  const finalAmount = details?.final_amount || 0;
  const balanceDue = Math.max(0, finalAmount - paidAmount);

  const handlePaidAmountChange = (val: number) => {
    setPaidAmount(val);
    if (val >= finalAmount && finalAmount > 0) {
      setPaymentStatus("Paid");
    } else if (val > 0) {
      setPaymentStatus("Partial");
    } else {
      setPaymentStatus("Pending");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setIsSubmitting(true);
    try {
      await updateOrderPayment(orderId, {
        paid_amount: paidAmount,
        payment_status: paymentStatus,
        account_id: accountId,
      });
      alert(`Payment updated successfully for Order #${orderId}`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update payment:", err);
      alert("Failed to update payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Update Order Payment (#{details?.order_number || orderId})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !details ? (
          <div className="p-10 text-center text-xs font-semibold text-slate-500">
            Loading payment information...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-600">
            {/* Amount Summary Cards */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Total</span>
                <span className="font-bold text-slate-900 text-sm">₹{finalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Paid</span>
                <span className="font-bold text-emerald-700 text-sm">₹{paidAmount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Balance Due</span>
                <span className="font-extrabold text-rose-600 text-sm">₹{balanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Paid Amount Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                New Paid Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={finalAmount}
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 border border-slate-200 rounded-lg pl-8 pr-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-white"
                  required
                />
                <IndianRupee size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Payment Status Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Account Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Receiving Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(parseInt(e.target.value))}
                className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Save Payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}