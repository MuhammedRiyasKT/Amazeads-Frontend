// src/modules/accounts/pages/AccountsExpensesPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";

import {
  Expense,
  ExpenseCategory,
  ExpenseAccount,
  ExpenseFilters as IExpenseFilters,
  CreateExpensePayload
} from "../types";

import {
  getExpenses,
  getExpenseById,
  getExpenseCategories,
  getExpenseAccounts,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/accounts.service";

import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseFormDrawer from "../components/ExpenseFormDrawer";
import ExpenseDetailsDrawer from "../components/ExpenseDetailsDrawer";
import ExpenseAttachmentPreview from "../../expenses/components/ExpenseAttachmentPreview"; // reuse preview modal
import DeleteExpenseDialog from "../../expenses/components/DeleteExpenseDialog"; // reuse delete dialog

export default function AccountsExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);

  // Pagination & Filters States
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [filters, setFilters] = useState<IExpenseFilters>({});

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

  // Overlay state controllers
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState<boolean>(false);

  // Target item selections
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeAttachmentUrl, setActiveAttachmentUrl] = useState<string | null>(null);

  // Toast alerts
  const [toastMsg, setToastMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load dropdown lists on mount
  useEffect(() => {
    setIsLoadingCategories(true);
    getExpenseCategories()
      .then(setCategories)
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setIsLoadingCategories(false));

    setIsLoadingAccounts(true);
    getExpenseAccounts()
      .then(setAccounts)
      .catch((err) => console.error("Error loading accounts:", err))
      .finally(() => setIsLoadingAccounts(false));
  }, []);

  // Fetch expenses list
  const fetchExpensesList = async () => {
    setIsLoading(true);
    try {
      const queryFilters: IExpenseFilters = {
        page,
        page_size: pageSize,
        ...filters,
      };

      const res = await getExpenses(queryFilters);
      setExpenses(res.items || []);
      setTotalCount(res.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error loading accounts expenses:", err);
      setToastMsg({
        type: "error",
        text: "Failed to load expenses list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesList();
  }, [page, pageSize, filters]);

  // Mutation Submit Handlers
  const handleFormSubmit = async (payload: CreateExpensePayload) => {
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, payload);
        setToastMsg({
          type: "success",
          text: "Expense updated successfully.",
        });
      } else {
        await createExpense(payload);
        setToastMsg({
          type: "success",
          text: "Expense created successfully.",
        });
      }
      setIsFormOpen(false);
      fetchExpensesList();
    } catch (err: any) {
      console.error("Error saving expense:", err);
      setToastMsg({
        type: "error",
        text: err?.response?.data?.detail || "Failed to save expense.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    try {
      await deleteExpense(selectedExpense.id);
      setToastMsg({
        type: "success",
        text: "Expense deleted successfully.",
      });
      setIsDeleteOpen(false);
      fetchExpensesList();
    } catch (err: any) {
      console.error("Error deleting expense:", err);
      setToastMsg({
        type: "error",
        text: err?.response?.data?.detail || "Failed to delete expense.",
      });
    }
  };

  // Actions Handlers
  const handleAddExpenseClick = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleViewDetails = async (expense: Expense) => {
    setIsLoading(true);
    try {
      const data = await getExpenseById(expense.id);
      setSelectedExpense(data);
      setIsDetailsOpen(true);
    } catch (err: any) {
      console.error("Error fetching detail:", err);
      setToastMsg({
        type: "error",
        text: "Failed to load expense details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmOpen = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };

  const handlePreviewAttachment = (url: string) => {
    setActiveAttachmentUrl(url);
    setIsAttachmentOpen(true);
  };

  // Filter Event Handlers
  const handleFilterChange = (updated: Partial<IExpenseFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updated };
      Object.keys(newFilters).forEach((key) => {
        const val = newFilters[key as keyof IExpenseFilters];
        if (val === undefined || val === null || val === "") {
          delete newFilters[key as keyof IExpenseFilters];
        }
      });
      return newFilters;
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5 p-6 w-full max-w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${toastMsg.type === "success"
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-rose-600 text-white border-rose-700"
            }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toastMsg.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between w-full">
        <div className="space-y-0.5">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Expenses</h1>
          <p className="text-xs font-semibold text-slate-400">Track and manage business expenses</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={fetchExpensesList}
            disabled={isLoading}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button
            onClick={handleAddExpenseClick}
            className="font-bold flex items-center gap-1.5 h-9 text-xs px-4 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
          >
            <Plus size={15} /> Add Expense
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        accounts={accounts}
        onClearFilters={handleClearFilters}
        isLoadingCategories={isLoadingCategories}
        isLoadingAccounts={isLoadingAccounts}
      />

      {/* Table view */}
      <ExpenseTable
        expenses={expenses}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteConfirmOpen}
        onPreviewAttachment={handlePreviewAttachment}
      />

      {/* Pagination wrapper */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between w-full border-t border-slate-100 pt-4 mt-2">
          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}</strong> of{" "}
            <strong className="text-slate-700">{totalCount}</strong> expenses
          </span>

          <Pagination
            total={totalCount}
            limit={pageSize}
            activePage={page}
            onPageChange={setPage}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Per Page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-600 cursor-pointer text-slate-600 font-semibold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Side Slide Drawers and overlay dialogs */}

      {/* 1. Add / Edit Expense Form Drawer */}
      <ExpenseFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        accounts={accounts}
        expense={selectedExpense}
      />

      {/* 2. Details Drawer */}
      <ExpenseDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        expense={selectedExpense}
        onPreviewAttachment={handlePreviewAttachment}
      />

      {/* 3. Attachment Preview Modal */}
      <ExpenseAttachmentPreview
        isOpen={isAttachmentOpen}
        onClose={() => setIsAttachmentOpen(false)}
        url={activeAttachmentUrl}
      />

      {/* 4. Delete Confirmation modal */}
      <DeleteExpenseDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        expense={selectedExpense as any}
      />
    </div>
  );
}
