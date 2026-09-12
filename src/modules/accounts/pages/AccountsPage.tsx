// src/modules/accounts/pages/AccountsPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Landmark,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Layers,
  Filter,
  Tag,
  Receipt,
  Eye,
} from "lucide-react";
import { accountsService } from "../services/accounts.service";
import { reportsService } from "@/modules/reports";
import {
  SalesTransaction,
  AccountTransactionBreakdown,
  SalesTransactionData,
  SalesTransactionFilters,
} from "../types/accounts.types";
import { AdminAccount } from "@/modules/admin/types/adminAccount.types";
import { getAdminAccounts, deleteAdminAccount } from "@/modules/admin/services/adminAccount.service";
import AdminAccountModal from "@/modules/admin/components/AdminAccountModal";
import DeleteAccountDialog from "@/modules/admin/components/DeleteAccountDialog";

export type UserRoleType = "admin" | "accounts" | "manager";

interface AccountsPageProps {
  role?: UserRoleType;
}

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

const formatDateReadable = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

interface ParsedDescription {
  type?: string;
  orderNumber?: string;
  orderId?: string;
  category?: string;
  customer?: string;
  account?: string;
  paymentType?: string;
  createdBy?: string;
  commitDate?: string;
  totalOrderAmount?: string;
  balanceAmount?: string;
}

const parseTransactionDescription = (desc: string): ParsedDescription => {
  if (!desc || typeof desc !== "string") return {};

  const parsed: ParsedDescription = {};

  try {
    const dashSplit = desc.split(" - ");
    if (dashSplit.length > 1) {
      parsed.type = dashSplit[0].trim();
    }

    const extractValue = (key: string): string | undefined => {
      const regex = new RegExp(`${key}:\\s*([^,]+)`, "i");
      const match = desc.match(regex);
      return match ? match[1].trim() : undefined;
    };

    const orderNumMatch = desc.match(/Order\s+(#[^\s,(]+|\([^)]+\))/i);
    if (orderNumMatch) {
      parsed.orderNumber = orderNumMatch[1].trim();
    }

    parsed.orderId = extractValue("Order ID");
    parsed.category = extractValue("Category");
    parsed.customer = extractValue("Customer");
    parsed.account = extractValue("Account");
    parsed.paymentType = extractValue("Payment Type");
    parsed.createdBy = extractValue("Created By");
    parsed.commitDate = extractValue("Commit Date");
    parsed.totalOrderAmount = extractValue("Total Order Amount");
    parsed.balanceAmount = extractValue("Balance Amount");
  } catch {
    // Safe fallback
  }

  return parsed;
};

export default function AccountsPage({ role }: AccountsPageProps) {
  const pathname = usePathname();

  // Role resolution (Admin vs Accounts vs Manager)
  const effectiveRole: UserRoleType = useMemo(() => {
    if (role) return role;
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/manager")) return "manager";
    return "accounts";
  }, [role, pathname]);

  const canManageAccounts = effectiveRole === "admin";

  // -------------------------------------------------------------------------
  // 1. DATA STATES
  // -------------------------------------------------------------------------
  const [transactionData, setTransactionData] = useState<SalesTransactionData | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Account for Transaction View (null = All Accounts View)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");

  // -------------------------------------------------------------------------
  // 2. FILTER & SEARCH STATES
  // -------------------------------------------------------------------------
  const [searchVal, setSearchVal] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [uptoToday, setUptoToday] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [expenseCategoryId, setExpenseCategoryId] = useState<string>("");
  const [staffId, setStaffId] = useState<string>("");

  // Server-side Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Dropdown options
  const [salesCategories, setSalesCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [staffList, setStaffList] = useState<{ id: number; staff_name: string }[]>([]);

  // -------------------------------------------------------------------------
  // 3. ADMIN MODAL STATES (Admin only)
  // -------------------------------------------------------------------------
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AdminAccount | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [accountToDelete, setAccountToDelete] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Load Dropdown Options & Master Admin Accounts
  useEffect(() => {
    let isMounted = true;
    reportsService.getSalesCategories().then((cats) => {
      if (isMounted) setSalesCategories(cats || []);
    }).catch(() => {});

    reportsService.getExpenseCategories().then((cats) => {
      if (isMounted) setExpenseCategories(cats || []);
    }).catch(() => {});

    reportsService.getSalesStaffList().then((staffs) => {
      if (isMounted) setStaffList(staffs || []);
    }).catch(() => {});

    if (canManageAccounts) {
      getAdminAccounts().then((accs) => {
        if (isMounted) setAdminAccounts(accs || []);
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [canManageAccounts]);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load Sales & Expense Transactions API
  const loadTransactionsData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);

      const filters: SalesTransactionFilters = {
        page: currentPage,
        page_size: pageSize,
      };

      if (selectedAccountId) filters.account_id = selectedAccountId;
      if (debouncedSearch) filters.search = debouncedSearch;
      if (selectedMonth) filters.month = selectedMonth;
      if (selectedYear) filters.year = selectedYear;
      if (selectedDay) filters.day = selectedDay;
      if (selectedDate) filters.date = selectedDate;
      if (fromDate) filters.from_date = fromDate;
      if (toDate) filters.to_date = toDate;
      if (uptoToday) filters.upto_today = true;
      if (categoryId) filters.category_id = categoryId;
      if (expenseCategoryId) filters.expense_category_id = expenseCategoryId;
      if (staffId) filters.staff_id = staffId;

      const response = await accountsService.getSalesTransactions(filters);
      if (response && response.data) {
        setTransactionData(response.data);
      } else {
        setTransactionData(null);
      }
    } catch (err: unknown) {
      console.error("Failed to load account transactions:", err);
      setErrorMsg("Unable to load account transactions. Please check network connection.");
      setTransactionData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    currentPage,
    pageSize,
    selectedAccountId,
    debouncedSearch,
    selectedMonth,
    selectedYear,
    selectedDay,
    selectedDate,
    fromDate,
    toDate,
    uptoToday,
    categoryId,
    expenseCategoryId,
    staffId,
  ]);

  useEffect(() => {
    loadTransactionsData();
  }, [loadTransactionsData]);

  // Select Account Handler
  const handleSelectAccount = (id: number, name: string) => {
    setSelectedAccountId(id);
    setSelectedAccountName(name);
    setCurrentPage(1);
    setSearchVal("");
  };

  // Back to All Accounts
  const handleBackToAllAccounts = () => {
    setSelectedAccountId(null);
    setSelectedAccountName("");
    setCurrentPage(1);
    setSearchVal("");
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchVal("");
    setDebouncedSearch("");
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedDay("");
    setSelectedDate("");
    setFromDate("");
    setToDate("");
    setUptoToday(false);
    setCategoryId("");
    setExpenseCategoryId("");
    setStaffId("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchVal ||
      selectedMonth ||
      selectedYear ||
      selectedDay ||
      selectedDate ||
      fromDate ||
      toDate ||
      uptoToday ||
      categoryId ||
      expenseCategoryId ||
      staffId
  );

  // Admin CRUD Handlers
  const handleOpenAddModal = () => {
    setSelectedAccountForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (acc: AdminAccount) => {
    setSelectedAccountForEdit(acc);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (acc: AdminAccount) => {
    setAccountToDelete(acc);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminAccount(accountToDelete.id);
      setToastMsg(`Account "${accountToDelete.account_name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
      loadTransactionsData(true);
      if (canManageAccounts) {
        const accs = await getAdminAccounts();
        setAdminAccounts(accs || []);
      }
    } catch (err: unknown) {
      console.error("Delete account error:", err);
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSuccess = async (message: string) => {
    setToastMsg(message);
    loadTransactionsData(true);
    if (canManageAccounts) {
      const accs = await getAdminAccounts();
      setAdminAccounts(accs || []);
    }
  };

  // Derived summaries from API response directly
  const accountsBreakdown: AccountTransactionBreakdown[] = useMemo(
    () => transactionData?.accounts_breakdown || [],
    [transactionData]
  );

  const transactionsList: SalesTransaction[] = useMemo(
    () => transactionData?.items || [],
    [transactionData]
  );

  const pagination = transactionData?.pagination;
  const totalPages = pagination?.total_pages || 1;
  const totalCount = pagination?.total_count || 0;

  // Options helpers
  const currentYearNum = new Date().getFullYear();
  const yearsOptions = Array.from({ length: 6 }, (_, i) => String(currentYearNum - i));
  const monthsOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full font-sans text-slate-800 min-h-screen">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xl border border-emerald-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-indigo-600" />
              <span>Accounts</span>
            </h1>
            <span
              className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${
                canManageAccounts
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {canManageAccounts ? "Management" : effectiveRole === "manager" ? "Manager View" : "Accounts View"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {canManageAccounts
              ? "Manage company accounts, status, and transaction history."
              : "View company accounts, collections, expenses, and transaction logs."}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadTransactionsData(true)}
            disabled={isLoading || isRefreshing}
            className="h-10 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Account Button (ADMIN ONLY) */}
          {canManageAccounts && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Add Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ERROR BANNER */}
      {errorMsg && !isLoading && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => loadTransactionsData()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. SELECTED ACCOUNT NAVIGATION BANNER (WHEN AN ACCOUNT IS SELECTED) */}
      {selectedAccountId && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Landmark size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                Selected Account Transactions
              </span>
              <h2 className="text-base font-black text-indigo-950 flex items-center gap-2">
                <span>{selectedAccountName}</span>
                <span className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                  ID: #{selectedAccountId}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={handleBackToAllAccounts}
            className="px-4 py-2 bg-white hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <ChevronLeft size={16} />
            <span>Back to All Accounts</span>
          </button>
        </div>
      )}

      {/* 4. FINANCIAL KPI SUMMARY CARDS (API RESPONSE VALUES DIRECTLY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Money IN */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Money IN
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div>
            <span className="text-lg md:text-xl font-black text-emerald-600 block">
              {isLoading ? "—" : formatINR(transactionData?.total_in_amount)}
            </span>
            <span className="text-[10px] font-bold text-emerald-700/70 mt-0.5 block">
              {selectedAccountId ? `${selectedAccountName} Collections` : "Total Collections"}
            </span>
          </div>
        </div>

        {/* Money OUT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Money OUT
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <span className="text-lg md:text-xl font-black text-rose-600 block">
              {isLoading ? "—" : formatINR(transactionData?.total_out_amount)}
            </span>
            <span className="text-[10px] font-bold text-rose-700/70 mt-0.5 block">
              {selectedAccountId ? `${selectedAccountName} Expenses` : "Total Expenses"}
            </span>
          </div>
        </div>

        {/* Net Amount */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2 ${
            (transactionData?.net_amount ?? 0) < 0
              ? "bg-rose-600 text-white border-rose-700"
              : "bg-slate-900 text-white border-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Net Amount
            </span>
            <div className="p-2 bg-white/10 rounded-xl text-white">
              <ArrowUpDown size={16} />
            </div>
          </div>
          <div>
            <span className="text-lg md:text-xl font-black block">
              {isLoading ? "—" : formatINR(transactionData?.net_amount)}
            </span>
            <span className="text-[10px] font-medium opacity-80 mt-0.5 block">
              IN − OUT Balance
            </span>
          </div>
        </div>

        {/* Transactions Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Transactions
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <span className="text-lg md:text-xl font-black text-slate-900 block">
              {isLoading ? "—" : transactionData?.total_transaction_count ?? 0}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
              Total Logged Transactions
            </span>
          </div>
        </div>
      </div>

      {/* 5. VIEW 1: ALL ACCOUNTS BREAKDOWN LIST (SHOWS WHEN NO ACCOUNT IS SELECTED) */}
      {!selectedAccountId && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Company Accounts Overview
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Click an account to inspect its detailed transaction history
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : accountsBreakdown.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
              No company account breakdown data available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountsBreakdown.map((acc) => {
                const adminAcc = adminAccounts.find(
                  (a) => a.account_name.trim().toLowerCase() === acc.account_name.trim().toLowerCase()
                );
                const netIsNeg = acc.net_amount < 0;

                return (
                  <div
                    key={acc.account_id}
                    onClick={() => handleSelectAccount(acc.account_id, acc.account_name)}
                    className="bg-slate-50/50 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-2xs group space-y-3 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-150 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-xl transition-colors">
                          <Landmark size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {acc.account_name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            ID: #{acc.account_id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {adminAcc && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              adminAcc.status
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {adminAcc.status ? "Active" : "Inactive"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transaction breakdown stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-150 space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                          IN ({acc.in_transaction_count})
                        </span>
                        <strong className="text-xs font-black text-emerald-700">
                          {formatINR(acc.total_in_amount)}
                        </strong>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-150 space-y-0.5">
                        <span className="text-[10px] font-bold text-rose-600 uppercase block">
                          OUT ({acc.out_transaction_count})
                        </span>
                        <strong className="text-xs font-black text-rose-700">
                          {formatINR(acc.total_out_amount)}
                        </strong>
                      </div>
                    </div>

                    {/* Net balance & action footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-150 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Net Balance
                        </span>
                        <strong
                          className={`text-sm font-black ${
                            netIsNeg ? "text-rose-600" : "text-slate-900"
                          }`}
                        >
                          {formatINR(acc.net_amount)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* ADMIN ONLY EDIT & DELETE BUTTONS */}
                        {canManageAccounts && adminAcc && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(adminAcc);
                              }}
                              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Edit Account"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(adminAcc);
                              }}
                              className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccount(acc.account_id, acc.account_name);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white border border-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>View More</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW 2: SELECTED ACCOUNT / FILTERED TRANSACTIONS VIEW (ONLY SHOWS WHEN AN ACCOUNT IS SELECTED) */}
      {selectedAccountId !== null && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        {/* Header & Filter Row */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {selectedAccountId ? `${selectedAccountName} Transactions` : "All Account Transactions Log"}
              </h3>
            </div>

            {/* Backend Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search order #, customer, desc..."
                className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-8 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Compact Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Month Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Months</option>
                {monthsOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Years</option>
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Category Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Product Categories</option>
                {salesCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Category Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Category</label>
              <select
                value={expenseCategoryId}
                onChange={(e) => {
                  setExpenseCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Expense Categories</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff</label>
              <select
                value={staffId}
                onChange={(e) => {
                  setStaffId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">All Staff Members</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.staff_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: From */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Date Range: To */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-4 col-span-1 sm:col-span-2">
              <button
                onClick={() => {
                  setUptoToday(!uptoToday);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  uptoToday
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                Up to Today
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                >
                  <X size={13} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-lg w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100/70 rounded-xl" />
            ))}
          </div>
        ) : transactionsList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
              <Receipt size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {selectedAccountId
                ? `No transactions found for ${selectedAccountName}`
                : "No transactions found"}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              No sales or expense transactions recorded under the current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3 text-center">IN / OUT</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Description &amp; Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {transactionsList.map((tx) => {
                  const isIN = tx.in_out === "IN";
                  const parsed = parseTransactionDescription(tx.description);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{formatDateReadable(tx.date)}</span>
                        </div>
                      </td>

                      {/* IN / OUT Badge */}
                      <td className="px-4 py-3.5 text-center">
                        {isIN ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black rounded-lg text-xs">
                            <ArrowDownLeft size={13} />
                            <span>IN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-black rounded-lg text-xs">
                            <ArrowUpRight size={13} />
                            <span>OUT</span>
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right font-black text-sm">
                        <span className={isIN ? "text-emerald-600" : "text-rose-600"}>
                          {isIN ? "+" : "-"}{formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Structured Description */}
                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="space-y-1.5 max-w-2xl whitespace-normal">
                          {/* Structured Pill Tags if parsed */}
                          {(parsed.type || parsed.orderNumber || parsed.customer || parsed.category) && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              {parsed.type && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-md border border-slate-200">
                                  {parsed.type}
                                </span>
                              )}
                              {parsed.orderNumber && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-md border border-indigo-200">
                                  {parsed.orderNumber}
                                </span>
                              )}
                              {parsed.customer && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border flex items-center gap-1">
                                  <User size={11} className="text-slate-400" />
                                  <span>{parsed.customer}</span>
                                </span>
                              )}
                              {parsed.category && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border flex items-center gap-1">
                                  <Tag size={11} className="text-slate-400" />
                                  <span>{parsed.category}</span>
                                </span>
                              )}
                              {parsed.createdBy && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md">
                                  By: {parsed.createdBy}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Raw Description Text (Guarantees no info is ever hidden or lost) */}
                          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/70 p-2 rounded-xl border border-slate-150">
                            {tx.description}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. SERVER-SIDE PAGINATION */}
        {!isLoading && transactionsList.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-slate-800">{Math.min(currentPage * pageSize, totalCount)}</strong> of{" "}
              <strong className="text-slate-800">{totalCount}</strong> transactions
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ADMIN MODALS (ADMIN ROLE ONLY) */}
      {canManageAccounts && (
        <>
          <AdminAccountModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setSelectedAccountForEdit(null);
            }}
            onSuccess={handleModalSuccess}
            account={selectedAccountForEdit}
            existingAccounts={adminAccounts}
          />

          <DeleteAccountDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setAccountToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            accountName={accountToDelete?.account_name || ""}
            isDeleting={isDeleting}
            error={deleteError}
          />
        </>
      )}
    </div>
  );
}
