"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  CreditCard,
  IndianRupee,
  Wallet,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Plus,
  Clock,
  User,
  History
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getOrderPaymentHistory,
  updatePaymentHistoryItem,
  deletePaymentHistoryItem,
  updatePaymentTypeAndAccount,
  updateOrderPayment,
  getSalesAccounts
} from "../services/order.service";

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
  const [historyData, setHistoryData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Account Edit & Disclaimer States ───
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("Cash");
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // ─── Payment Item Edit States ───
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState<number>(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("Partial");
  const [isSavingItemEdit, setIsSavingItemEdit] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

  // ─── New Payment Entry States ───
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);

  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!orderId) return;
    if (!isSilent) setIsLoading(true);
    try {
      const [histRes, accsRes] = await Promise.all([
        getOrderPaymentHistory(orderId),
        getSalesAccounts().catch(() => [])
      ]);

      const data = (histRes as any)?.data || histRes;
      setHistoryData(data);
      const accList: any[] = Array.isArray(accsRes) ? accsRes : (accsRes as any)?.data || [];
      setAccounts(accList);

      const defaultAccId = data?.account_id !== undefined && data?.account_id !== null && data?.account_id !== 0
        ? data.account_id
        : (accList[0]?.id || 1);
      setSelectedAccountId(defaultAccId);

      const accObj = accList.find((a: any) => Number(a.id) === Number(defaultAccId));
      const isCash = (accObj?.account_name || "").toLowerCase().includes("cash") ||
                     (accObj?.account_type || "").toLowerCase().includes("cash");

      setSelectedPaymentType(isCash ? "Cash" : (data?.payment_type || "Cash"));
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      setIsEditingAccount(false);
      setEditingPaymentId(null);
      setNewPaymentAmount(0);
      fetchHistory();
    }
  }, [isOpen, orderId, fetchHistory]);

  if (!isOpen || !orderId) return null;

  const totalAmount = historyData?.total_amount || 0;
  const currentPaid = historyData?.paid_amount || 0;
  const currentDue = historyData?.due_amount !== undefined ? historyData.due_amount : Math.max(0, totalAmount - currentPaid);
  const paymentsList: any[] = historyData?.payments || [];

  // Derived calculations for adding a new payment
  const newTotalPaid = currentPaid + newPaymentAmount;
  const remainingDue = Math.max(0, totalAmount - newTotalPaid);
  const newDerivedStatus =
    newTotalPaid >= totalAmount && totalAmount > 0
      ? "Paid"
      : newTotalPaid > 0
        ? "Partial"
        : "Not Paid";

  // 🌟 Two-Way Cash Rule:
  // 1. Account "Cash" ആണെങ്കിൽ Payment Type "Cash" മാത്രമായിരിക്കും.
  // 2. Payment Type "Cash" ആണെങ്കിൽ Account "Cash" മാത്രമായിരിക്കും.
  const isAccountCash = (acc?: any) => {
    if (!acc) return false;
    const name = (acc.account_name || "").toLowerCase();
    const type = (acc.account_type || "").toLowerCase();
    return name.includes("cash") || type.includes("cash");
  };

  const selectedAccountObj = accounts.find((a) => Number(a.id) === Number(selectedAccountId));
  const isCashAccount = isAccountCash(selectedAccountObj);

  const cashAccounts = accounts.filter(isAccountCash);
  const nonCashAccounts = accounts.filter((a) => !isAccountCash(a));

  const filteredAccounts = selectedPaymentType === "Cash"
    ? (cashAccounts.length > 0 ? cashAccounts : accounts)
    : (nonCashAccounts.length > 0 ? nonCashAccounts : accounts);

  const handlePaymentTypeChange = (newType: string) => {
    setSelectedPaymentType(newType);
    if (newType === "Cash") {
      // Must switch to a Cash account
      if (!isAccountCash(selectedAccountObj)) {
        const firstCashAcc = accounts.find(isAccountCash);
        if (firstCashAcc) {
          setSelectedAccountId(firstCashAcc.id);
        }
      }
    } else {
      // Must switch to a Non-Cash account (Bank / Online)
      if (isAccountCash(selectedAccountObj)) {
        const firstNonCashAcc = accounts.find((a) => !isAccountCash(a));
        if (firstNonCashAcc) {
          setSelectedAccountId(firstNonCashAcc.id);
        }
      }
    }
  };

  const handleAccountChange = (accId: number) => {
    setSelectedAccountId(accId);
    const acc = accounts.find((a) => Number(a.id) === Number(accId));
    if (isAccountCash(acc)) {
      setSelectedPaymentType("Cash");
    } else if (selectedPaymentType === "Cash") {
      setSelectedPaymentType("Bank");
    }
  };

  // Check if account type/id was modified
  const isAccountChanged =
    historyData &&
    (selectedPaymentType !== (historyData.payment_type || "Cash") ||
      Number(selectedAccountId) !== Number(historyData.account_id));

  // ─── 1. Handle Account & Type Update ───
  const handleSaveAccountType = async () => {
    if (!orderId) return;
    setIsUpdatingAccount(true);
    try {
      await updatePaymentTypeAndAccount(orderId, {
        payment_type: selectedPaymentType,
        account_id: Number(selectedAccountId)
      });
      alert("Payment account and type updated successfully.");
      setIsEditingAccount(false);
      await fetchHistory(true);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to update payment type and account:", err);
      alert(err.response?.data?.detail || err.message || "Failed to update account");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // ─── 2. Handle Edit Single Payment Transaction ───
  const handleStartEditPayment = (payment: any) => {
    setEditingPaymentId(payment.id);
    setEditPaymentAmount(payment.payed_amount || 0);
    setEditPaymentStatus(payment.updated_payment_status || "Partial");
  };

  const handleSavePaymentItem = async (paymentId: number) => {
    if (editPaymentAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    setIsSavingItemEdit(true);
    try {
      await updatePaymentHistoryItem(orderId, paymentId, {
        payed_amount: editPaymentAmount,
        updated_payment_status: editPaymentStatus
      });
      alert("Payment transaction updated successfully.");
      setEditingPaymentId(null);
      await fetchHistory(true);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to update payment item:", err);
      alert(err.response?.data?.detail || err.message || "Failed to update payment transaction");
    } finally {
      setIsSavingItemEdit(false);
    }
  };

  // ─── 3. Handle Delete Single Payment Transaction ───
  const handleDeletePaymentItem = async (payment: any) => {
    const confirmMsg = `Are you sure you want to delete the payment record of ₹${(payment.payed_amount || 0).toLocaleString("en-IN")}?\n\nThis will remove the transaction and recalculate the balance due.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingPaymentId(payment.id);
    try {
      await deletePaymentHistoryItem(payment.id);
      alert("Payment transaction deleted successfully.");
      await fetchHistory(true);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to delete payment transaction:", err);
      alert(err.response?.data?.detail || err.message || "Failed to delete payment transaction");
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // ─── 4. Handle Add New Balance Payment ───
  const handleAddNewPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (newPaymentAmount <= 0) {
      alert("Please enter a valid payment amount greater than ₹0.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrderPayment(orderId, {
        paid_amount: newPaymentAmount,
        payment_status: newDerivedStatus,
        account_id: Number(selectedAccountId),
      });
      alert(`Payment of ₹${newPaymentAmount.toLocaleString("en-IN")} recorded successfully for Order #${historyData?.order_number || orderId}`);
      setNewPaymentAmount(0);
      await fetchHistory(true);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to add payment:", err);
      alert(err.response?.data?.detail || err.message || "Failed to record payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "partial") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "pending" || s === "not paid") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* ─── Modal Header ─── */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Order Payment Management (#{historyData?.order_number || orderId})
                </h3>
                {historyData?.payment_status && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getStatusBadge(historyData.payment_status)}`}>
                    {historyData.payment_status?.toLowerCase() === "pending" ? "Not Paid" : historyData.payment_status}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-450">
                View transactions history, edit previous payments, or record balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Modal Body (Scrollable) ─── */}
        {isLoading || !historyData ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-indigo-600" />
            <span>Loading payment records & ledger...</span>
          </div>
        ) : (
          <div className="p-5 space-y-4.5 overflow-y-auto text-xs font-semibold text-slate-600">
            
            {/* 1. Summary Badges */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Final Amount</span>
                <span className="font-bold text-slate-900 text-sm">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Total Paid</span>
                <span className="font-bold text-emerald-700 text-sm">₹{currentPaid.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Balance Due</span>
                <span className="font-extrabold text-rose-600 text-sm">₹{currentDue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 2. Account & Payment Type Configuration with Disclaimer */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Wallet size={15} className="text-indigo-600" />
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                    Assigned Account & Payment Method
                  </span>
                </div>
                {!isEditingAccount && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAccount(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50/60 border border-indigo-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  >
                    <Edit2 size={11} /> Change Account
                  </button>
                )}
              </div>

              {!isEditingAccount ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Method:</span>
                    <span className="text-slate-800">{historyData.payment_type || "Cash"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Account:</span>
                    <span className="text-slate-800">{historyData.account_name || "—"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Payment Type:
                      </label>
                      <select
                        value={selectedPaymentType}
                        onChange={(e) => handlePaymentTypeChange(e.target.value)}
                        className="w-full h-8.5 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Advance Payment">Advance Payment</option>
                      </select>
                      {selectedPaymentType === "Cash" && (
                        <span className="text-[9.5px] text-amber-700 font-bold mt-0.5 block">
                          🔒 Cash payment: Deposit account must be Cash.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Deposit Account:
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => handleAccountChange(Number(e.target.value))}
                        className="w-full h-8.5 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        {filteredAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.account_name} ({acc.account_type || "Account"})
                          </option>
                        ))}
                      </select>
                      {selectedPaymentType !== "Cash" && (
                        <span className="text-[9.5px] text-slate-500 font-medium mt-0.5 block">
                          Showing non-cash accounts (Bank / Online).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 🌟 Mandatory Disclaimer Alert Box */}
                  <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex items-start gap-2.5 text-amber-800 animate-in fade-in">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-amber-900">Important Disclaimer:</p>
                      <p className="font-semibold text-amber-800 leading-relaxed text-[11px]">
                        If you change the account for this order, all payments associated with this order will henceforth be recorded and tracked under this newly selected account.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingAccount(false);
                        const origAccId = historyData.account_id || 1;
                        setSelectedAccountId(origAccId);
                        const accObj = accounts.find((a: any) => Number(a.id) === Number(origAccId));
                        const isCash = (accObj?.account_name || "").toLowerCase().includes("cash") ||
                                       (accObj?.account_type || "").toLowerCase().includes("cash");
                        setSelectedPaymentType(isCash ? "Cash" : (historyData.payment_type || "Cash"));
                      }}
                      disabled={isUpdatingAccount}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAccountType}
                      disabled={isUpdatingAccount || !isAccountChanged}
                      className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {isUpdatingAccount ? "Saving..." : "Confirm & Update Account"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Transactions Ledger / History List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History size={15} className="text-indigo-600" />
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                    Payment Transactions History
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
                    {paymentsList.length}
                  </span>
                </div>
              </div>

              {paymentsList.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No previous payment transactions recorded for this order.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {paymentsList.map((item, idx) => {
                    const isEditingThis = editingPaymentId === item.id;
                    const isDeletingThis = deletingPaymentId === item.id;

                    return (
                      <div key={item.id || idx} className="p-3 transition-colors hover:bg-slate-50/50">
                        {isEditingThis ? (
                          /* Inline Edit Form for this transaction */
                          <div className="space-y-2.5 bg-indigo-50/40 border border-indigo-200 rounded-lg p-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-indigo-900">
                                Edit Transaction #{item.id}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDateTime(item.payment_date || item.created_on)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">
                                  Paid Amount (₹):
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  step="any"
                                  value={editPaymentAmount}
                                  onChange={(e) => setEditPaymentAmount(parseFloat(e.target.value) || 0)}
                                  className="w-full h-8 bg-white border border-slate-200 rounded-md px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                              </div>

                              <div>
                                <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">
                                  Updated Status:
                                </label>
                                <select
                                  value={editPaymentStatus}
                                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                                  className="w-full h-8 bg-white border border-slate-200 rounded-md px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                >
                                  <option value="Partial">Partial</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Not Paid">Not Paid</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingPaymentId(null)}
                                disabled={isSavingItemEdit}
                                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSavePaymentItem(item.id)}
                                disabled={isSavingItemEdit}
                                className="px-3 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded cursor-pointer shadow-2xs disabled:opacity-50"
                              >
                                {isSavingItemEdit ? "Saving..." : "Save Transaction"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Transaction Details Row */
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900 text-xs">
                                  ₹{(item.payed_amount || 0).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-1.5 py-0.2 rounded">
                                  {item.payment_type || (item.is_advance ? "Advance Payment" : "Balance Payment")}
                                </span>
                                {item.updated_payment_status && (
                                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${getStatusBadge(item.updated_payment_status)}`}>
                                    {item.updated_payment_status}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-450 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={10} /> {formatDateTime(item.payment_date || item.created_on)}
                                </span>
                                {(item.recorded_by_name || item.created_by_name) && (
                                  <span className="flex items-center gap-1">
                                    • <User size={10} /> By {item.recorded_by_name || item.created_by_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions: Edit & Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditPayment(item)}
                                className="p-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 rounded-md cursor-pointer transition-colors"
                                title="Edit this payment amount"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePaymentItem(item)}
                                disabled={isDeletingThis}
                                className="p-1 text-rose-600 hover:text-rose-800 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                title="Delete this payment record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Add New Payment (Record Balance Payment) */}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Plus size={15} className="text-emerald-600" />
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                  Record New Payment Receipt
                </span>
              </div>

              {currentDue <= 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                  🎉 Order is fully paid. No outstanding balance due.
                </div>
              ) : (
                <form onSubmit={handleAddNewPaymentSubmit} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      New Amount Received (₹):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={currentDue}
                        step="any"
                        value={newPaymentAmount === 0 ? "" : newPaymentAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const safeVal = isNaN(val) ? 0 : val;
                          if (safeVal > currentDue) {
                            setNewPaymentAmount(currentDue);
                          } else if (safeVal < 0) {
                            setNewPaymentAmount(0);
                          } else {
                            setNewPaymentAmount(safeVal);
                          }
                        }}
                        className="w-full h-9 border border-slate-200 rounded-lg pl-8 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-white"
                        placeholder={`Enter amount (max ₹${currentDue.toLocaleString("en-IN")})`}
                        required
                      />
                      <IndianRupee size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  {newPaymentAmount > 0 && (
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-2.5 space-y-1.5 text-[11px] font-semibold text-slate-700">
                      <div className="flex justify-between items-center">
                        <span>New Total Paid:</span>
                        <span className="font-extrabold text-slate-900">₹{newTotalPaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>New Balance Due:</span>
                        <span className="font-extrabold text-indigo-700">₹{remainingDue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-indigo-100">
                        <span>Status After Payment:</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusBadge(newDerivedStatus)}`}>
                          {newDerivedStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || newPaymentAmount <= 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? "Recording..." : "Record Payment Receipt"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ─── Modal Footer ─── */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}