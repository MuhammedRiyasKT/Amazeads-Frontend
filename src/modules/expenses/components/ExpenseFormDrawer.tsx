// src/modules/expenses/components/ExpenseFormDrawer.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Check, Loader2, Image as ImageIcon, Trash2, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { uploadToCloudinary } from "@/modules/sales/services/cloudinary.service";
import { createExpenseCategory } from "../services/expense.service";
import {
  Expense,
  ExpenseCategory,
  ExpenseAccount,
  CreateExpensePayload
} from "../types";

interface ExpenseFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
  categories: ExpenseCategory[];
  accounts: ExpenseAccount[];
  expense?: Expense | null;
}

export default function ExpenseFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  categories,
  accounts,
  expense,
}: ExpenseFormDrawerProps) {
  // Form states
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [expenseDate, setExpenseDate] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<string>("");
  const [status, setStatus] = useState<string>("Paid");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // ─── Cash sync helpers ────────────────────────────────────────────────────
  // Account name-ൽ "cash" ഉള്ളതിനെ cash account ആയി identify ചെയ്യുന്നു
  const isCashAccount = (id: number) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.account_name.toLowerCase().includes("cash") : false;
  };
  const cashAccount = accounts.find((a) => a.account_name.toLowerCase().includes("cash"));

  // Account change → cash account ആണെങ്കിൽ payment type auto = "Cash"
  // Cash account → non-cash ആകുമ്പോൾ payment type reset ചെയ്യുന്നു
  const handleAccountChange = (id: number) => {
    setAccountId(id);
    if (isCashAccount(id)) {
      setPaymentType("Cash");
    } else if (isCashAccount(accountId)) {
      // Previously was cash account → now changed to non-cash → reset payment type
      setPaymentType("");
    }
  };

  // Payment type change → Cash ആണെങ്കിൽ cash account auto-select
  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    if (type === "Cash" && cashAccount) {
      setAccountId(cashAccount.id);
    }
  };


  // Upload/Save states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (expense) {
      setCategoryId(expense.expense_category_id);
      setExpenseDate(expense.expense_date);
      setAmount(String(expense.amount));
      setAccountId(expense.account_id);
      setPaymentType(expense.payment_type);
      setStatus(expense.status);
      setDescription(expense.description || "");
      setAttachmentUrl(expense.attachment_url || null);

      const matchedCat = categories.find(c => c.id === expense.expense_category_id);
      setCategoryQuery(matchedCat ? matchedCat.category_name : expense.category_name || "");
    } else {
      // Defaults for Add
      setCategoryId(0);
      setCategoryQuery("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setAmount("");
      setAccountId(0);
      setPaymentType("Cash");
      setStatus("Paid");
      setDescription("");
      setAttachmentUrl(null);
    }
    setErrors({});
  }, [expense, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    c.category_name.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  const showCreateOption =
    categoryQuery.trim() !== "" &&
    !categories.some((c) => c.category_name.toLowerCase() === categoryQuery.trim().toLowerCase());

  // Handle Cloudinary upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload JPG, PNG or PDF receipt.");
      return;
    }

    setIsUploading(true);
    try {
      const data = await uploadToCloudinary(file);
      if (data && data.secure_url) {
        setAttachmentUrl(data.secure_url);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt attachment");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl(null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!categoryQuery.trim()) errs.categoryQuery = "Category is required";
    if (!expenseDate) errs.expenseDate = "Date is required";
    if (!amount || parseFloat(amount) <= 0) errs.amount = "Amount must be greater than ₹0";
    if (!accountId) errs.accountId = "Account is required";
    if (!paymentType) errs.paymentType = "Payment type is required";
    if (!status) errs.status = "Status is required";

    // Cash mismatch validation
    if (paymentType === "Cash" && accountId && !isCashAccount(accountId)) {
      errs.accountId = "Cash payment type requires a Cash account. Please select a Cash account or change the payment type.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let finalCategoryId = categoryId;
      let finalCategoryName = categoryQuery.trim();
      let finalCategoryDescription = "Auto-created Category";

      // Match typed category against categories case-insensitively
      const matchedCat = categories.find(
        (c) => c.category_name.toLowerCase() === finalCategoryName.toLowerCase()
      );

      if (matchedCat) {
        finalCategoryId = matchedCat.id;
        finalCategoryName = matchedCat.category_name;
        finalCategoryDescription = matchedCat.description || "";
      } else if (finalCategoryName) {
        // Create new category inline
        try {
          const newCat = await createExpenseCategory({
            category_name: finalCategoryName,
            description: "Auto-created Category"
          });
          finalCategoryId = newCat.id;
          finalCategoryName = newCat.category_name;
          finalCategoryDescription = newCat.description || "Auto-created Category";
        } catch (catErr) {
          console.error("Failed to create category inline, using 0", catErr);
          finalCategoryId = 0; // Fallback
        }
      }

      const payload: CreateExpensePayload = {
        expense_category_id: finalCategoryId,
        category_name: finalCategoryName,
        category_description: finalCategoryDescription,
        expense_date: expenseDate,
        amount: parseFloat(amount),
        account_id: accountId,
        payment_type: paymentType,
        description: description,
        attachment_url: attachmentUrl,
        status: status,
      };

      await onSubmit(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[2000] flex justify-end">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card Panel */}
      <div className="relative bg-white w-full max-w-lg h-full border-l shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase">
            {expense ? "Edit Expense" : "Add Expense"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. EXPENSE INFORMATION */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Expense Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Category selector (Combobox Autocomplete) */}
              <div className="flex flex-col gap-1.5 col-span-2 relative" ref={suggestionsRef}>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or enter category name..."
                    value={categoryQuery}
                    onChange={(e) => {
                      setCategoryQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className={`w-full h-10 pl-3 pr-10 text-xs bg-white border rounded-lg focus:outline-none focus:border-indigo-600 ${errors.categoryQuery ? "border-red-500" : "border-slate-200"
                      }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                </div>

                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-[62px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(c.id);
                            setCategoryQuery(c.category_name);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 border-b border-slate-100 last:border-0 font-semibold"
                        >
                          {c.category_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs text-slate-400 italic">
                        No matching categories.
                      </div>
                    )}

                    {showCreateOption && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryId(0);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/60 font-bold border-t border-indigo-100 flex items-center justify-between"
                      >
                        <span>Add new category: "{categoryQuery}"</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                          New Category
                        </span>
                      </button>
                    )}
                  </div>
                )}
                {errors.categoryQuery && <p className="text-[10px] text-red-500 font-bold">{errors.categoryQuery}</p>}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Expense Date *</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className={`w-full h-10 px-3 text-xs bg-white border rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer ${errors.expenseDate ? "border-red-500" : "border-slate-200"
                    }`}
                />
                {errors.expenseDate && <p className="text-[10px] text-red-500 font-bold">{errors.expenseDate}</p>}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full h-10 px-3 text-xs bg-white border rounded-lg focus:outline-none focus:border-indigo-600 ${errors.amount ? "border-red-500" : "border-slate-200"
                    }`}
                />
                {errors.amount && <p className="text-[10px] text-red-500 font-bold">{errors.amount}</p>}
              </div>
            </div>
          </div>

          {/* 2. ACCOUNT & PAYMENT */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Account & Payment
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Account */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Account *</label>
                <select
                  value={accountId}
                  onChange={(e) => handleAccountChange(parseInt(e.target.value) || 0)}
                  className={`w-full h-10 px-3 text-xs bg-white border rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer ${errors.accountId ? "border-red-500" : "border-slate-200"}`}
                >
                  <option value={0}>Select Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_name}
                    </option>
                  ))}
                </select>
                {errors.accountId && <p className="text-[10px] text-red-500 font-bold">{errors.accountId}</p>}
              </div>

              {/* Payment Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Payment Type *
                  {isCashAccount(accountId) && (
                    <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                      Auto (Cash Account)
                    </span>
                  )}
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  disabled={isCashAccount(accountId)}
                  className={`w-full h-10 px-3 text-xs border rounded-lg focus:outline-none focus:border-indigo-600 ${
                    isCashAccount(accountId)
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                      : "bg-white cursor-pointer"
                  } ${errors.paymentType ? "border-red-500" : "border-slate-200"}`}
                >
                  <option value="">Select Type</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                {errors.paymentType && <p className="text-[10px] text-red-500 font-bold">{errors.paymentType}</p>}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full h-10 px-3 text-xs bg-white border rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer ${errors.status ? "border-red-500" : "border-slate-200"
                    }`}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
                {errors.status && <p className="text-[10px] text-red-500 font-bold">{errors.status}</p>}
              </div>
            </div>
          </div>

          {/* 3. DESCRIPTION */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Description
            </h4>
            <div className="flex flex-col gap-1.5">
              <textarea
                placeholder="Description of the purchase/expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-600 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* 4. ATTACHMENT */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Attachment
            </h4>

            {!attachmentUrl ? (
              <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center gap-1.5 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  disabled={isUploading}
                />

                {isUploading ? (
                  <>
                    <Loader2 className="text-indigo-600 animate-spin" size={24} />
                    <span className="text-xs font-bold text-indigo-700">Uploading receipt to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400" size={24} />
                    <span className="text-xs font-extrabold text-slate-700">Upload Receipt</span>
                    <span className="text-[10px] text-slate-400 font-semibold">JPG, PNG, PDF up to 5MB</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <ImageIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">receipt_attachment</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mt-0.5">Uploaded</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                    title="Remove Attachment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-2.5 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="cursor-pointer font-bold flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {expense ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Check size={14} />
                {expense ? "Update Expense" : "Save Expense"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
