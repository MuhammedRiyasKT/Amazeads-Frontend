// src/modules/expenses/pages/ExpensesPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

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
} from "../services/expense.service";

import ExpenseSummaryCards from "../components/ExpenseSummaryCards";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseTable from "../components/ExpenseTable";
import ExpensePagination from "../components/ExpensePagination";
import ExpenseFormDrawer from "../components/ExpenseFormDrawer";
import ExpenseDetailsDrawer from "../components/ExpenseDetailsDrawer";
import ExpenseAttachmentPreview from "../components/ExpenseAttachmentPreview";
import DeleteExpenseDialog from "../components/DeleteExpenseDialog";

export default function ExpensesPage() {
  // Main Data States
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

  // Overlay Dialog States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState<boolean>(false);

  // Target Item Selection States
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeAttachmentUrl, setActiveAttachmentUrl] = useState<string | null>(null);

  // Toast message state
  const [toastMsg, setToastMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-dismiss toast message
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // 1. Fetch Categories & Accounts on Mount
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

  // 2. Fetch Expenses list
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
      console.error("Error fetching expenses:", err);
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

  // 3. Form submissions (Create/Update)
  const handleFormSubmit = async (payload: CreateExpensePayload) => {
    try {
      if (selectedExpense) {
        // Edit flow
        await updateExpense(selectedExpense.id, payload);
        setToastMsg({
          type: "success",
          text: "Expense updated successfully.",
        });
      } else {
        // Create flow
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

  // 4. Delete Confirm
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

  // 5. Actions Handlers
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
      console.error("Error fetching expense detail:", err);
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

  // 6. Filter Handlers
  const handleFilterChange = (updated: Partial<IExpenseFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updated };
      // Clean undefined keys
      Object.keys(newFilters).forEach((key) => {
        const val = newFilters[key as keyof IExpenseFilters];
        if (val === undefined || val === null || val === "") {
          delete newFilters[key as keyof IExpenseFilters];
        }
      });
      return newFilters;
    });
    setPage(1); // Reset page to 1
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5 p-6 w-full max-w-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === "success"
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
          <p className="text-xs font-semibold text-slate-400">Track and manage project-related expenses</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh List */}
          <button
            onClick={fetchExpensesList}
            disabled={isLoading}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer"
            title="Refresh List"
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

      {/* Summary KPI Cards */}
      <ExpenseSummaryCards expenses={expenses} totalRecords={totalCount} />

      {/* Filter Toolbar */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        accounts={accounts}
        onClearFilters={handleClearFilters}
        isLoadingCategories={isLoadingCategories}
        isLoadingAccounts={isLoadingAccounts}
      />

      {/* Table List View */}
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
        <ExpensePagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Overlay Side Drawers and Modals */}
      
      {/* 1. Add / Edit Expense Drawer */}
      <ExpenseFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        accounts={accounts}
        expense={selectedExpense}
      />

      {/* 2. View Details Drawer */}
      <ExpenseDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        expense={selectedExpense}
        onEditExpense={handleEditExpense}
        onPreviewAttachment={handlePreviewAttachment}
      />

      {/* 3. Attachment Preview Modal */}
      <ExpenseAttachmentPreview
        isOpen={isAttachmentOpen}
        onClose={() => setIsAttachmentOpen(false)}
        url={activeAttachmentUrl}
      />

      {/* 4. Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        expense={selectedExpense}
      />
    </div>
  );
}
