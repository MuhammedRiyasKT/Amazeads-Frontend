// src/modules/accounts/pages/AccountsPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Landmark,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
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

const formatTxnDate = (dateStr?: string) => {
  if (!dateStr) return { date: "—", time: "" };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: "" };
    const date = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: dateStr, time: "" };
  }
};

interface ParsedTxnDetails {
  customerName?: string;
  orderNumber?: string;
  orderId?: string;
  txnId?: string;
  badgeTag?: string;
  balanceDue?: string;
  categoryName?: string;
  accountName?: string;
  paymentType?: string;
  createdByName?: string;
  expenseId?: string;
  expenseDate?: string;
  cleanNote?: string;
  rawDescription: string;
}

const parseTxnDetails = (desc: string): ParsedTxnDetails => {
  const result: ParsedTxnDetails = {
    rawDescription: desc || "",
  };

  if (!desc || typeof desc !== "string") return result;

  try {
    const extract = (key: string): string | undefined => {
      const regex = new RegExp(`${key}:\\s*([^,]+)`, "i");
      const match = desc.match(regex);
      return match ? match[1].trim() : undefined;
    };

    result.customerName = extract("Customer");
    result.orderId = extract("Order ID");
    result.categoryName = extract("Category");
    result.accountName = extract("Account");
    result.paymentType = extract("Payment Type") || extract("Payment");
    result.createdByName = extract("Created By") || extract("By");
    result.balanceDue = extract("Balance Amount") || extract("Balance due");

    // Clean note for Expenses (extract main text before ", Category:" or ", Account:", etc.)
    const cleanNotePart = desc.split(/,\s*(?:Category|Account|Created By|Payment Type|Expense Date|Expense ID|Expense\s*\(ID):/i)[0].trim();
    result.cleanNote = cleanNotePart;

    // Order # / Txn ID
    const orderNumMatch = desc.match(/Order\s+(#[^\s,(]+|\([^)]+\))/i);
    if (orderNumMatch) {
      result.orderNumber = orderNumMatch[1].trim();
    }

    const txnMatch = desc.match(/Txn\s*ID:\s*(\d+)/i);
    if (txnMatch) {
      result.txnId = txnMatch[1];
    }

    const newUpdateMatch = desc.match(/\b(New|Update)\b/i);
    if (newUpdateMatch) {
      result.badgeTag = newUpdateMatch[1];
    }

    // Expense parsing
    const expIdMatch = desc.match(/Expense\s*\(ID:\s*(\d+)\)/i) || desc.match(/Expense\s*ID:\s*(\d+)/i);
    if (expIdMatch) {
      result.expenseId = expIdMatch[1];
    }

    const expDateMatch = desc.match(/Expense\s*date:\s*([\d-]+)/i);
    if (expDateMatch) {
      result.expenseDate = expDateMatch[1];
    }

    // Fallbacks if customerName is empty
    if (!result.customerName) {
      const parts = desc.split(" - ");
      if (parts.length > 1) {
        result.customerName = parts[1].split("(")[0].trim();
      } else {
        result.customerName = desc.split("(")[0].trim();
      }
    }
  } catch {
    result.customerName = desc;
  }

  return result;
};

export default function AccountsPage({ role }: AccountsPageProps) {
  const pathname = usePathname();

  // Role resolution
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

  // Filter States
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [inOutFilter, setInOutFilter] = useState<string>(""); // "" | "IN" | "OUT"

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
  const pageSize = 10;

  // Dropdown options
  const [salesCategories, setSalesCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [staffList, setStaffList] = useState<{ id: number; staff_name: string }[]>([]);

  // Admin Modal States
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

  // Load Transactions API
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
      if (inOutFilter) filters.in_out = inOutFilter;
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
    inOutFilter,
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

  // Account selector handler
  const handleSelectAccount = (id: number | null, name: string = "") => {
    setSelectedAccountId(id);
    setSelectedAccountName(name);
    setCurrentPage(1);
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSelectedAccountId(null);
    setSelectedAccountName("");
    setInOutFilter("");
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
    selectedAccountId ||
      inOutFilter ||
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

  // Summaries
  const accountsBreakdown: AccountTransactionBreakdown[] = useMemo(
    () => transactionData?.accounts_breakdown || [],
    [transactionData]
  );

  const transactionsList: SalesTransaction[] = useMemo(
    () => transactionData?.items || [],
    [transactionData]
  );

  const accountOptions = useMemo(() => {
    const map = new Map<number, string>();
    adminAccounts.forEach((acc) => map.set(acc.id, acc.account_name));
    accountsBreakdown.forEach((acc) => map.set(acc.account_id, acc.account_name));
    return Array.from(map.entries()).map(([id, account_name]) => ({ id, account_name }));
  }, [adminAccounts, accountsBreakdown]);

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
    <div className="p-4 md:p-6 space-y-6 w-full font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xl border border-emerald-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🌟 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Money in from orders, money out on expenses · most recent first
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadTransactionsData(true)}
            disabled={isLoading || isRefreshing}
            className="h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {canManageAccounts && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus size={15} />
              <span>Add Account</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && !isLoading && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => loadTransactionsData()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 🌟 2. TOP 3 POSITION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NET POSITION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            NET POSITION
          </span>
          <div className={`text-2xl font-black mb-1 ${(transactionData?.net_amount ?? 0) < 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {isLoading ? "—" : formatINR(transactionData?.net_amount)}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {isLoading ? "—" : `${totalCount} transactions overall`}
          </span>
        </div>

        {/* TOTAL IN */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            TOTAL IN
          </span>
          <div className="text-2xl font-black text-emerald-600 mb-1">
            {isLoading ? "—" : formatINR(transactionData?.total_in_amount)}
          </div>
          <span className="text-xs font-medium text-slate-400">
            from sales &amp; payments
          </span>
        </div>

        {/* TOTAL OUT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            TOTAL OUT
          </span>
          <div className="text-2xl font-black text-rose-600 mb-1">
            {isLoading ? "—" : formatINR(transactionData?.total_out_amount)}
          </div>
          <span className="text-xs font-medium text-slate-400">
            on expenses
          </span>
        </div>
      </div>

      {/* 🌟 3. ACCOUNT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))
        ) : accountsBreakdown.length === 0 ? (
          <div className="col-span-3 p-6 text-center text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
            No company account breakdown data available.
          </div>
        ) : (
          accountsBreakdown.map((acc) => {
            const adminAcc = adminAccounts.find(
              (a) => a.account_name.trim().toLowerCase() === acc.account_name.trim().toLowerCase()
            );
            const isSelected = selectedAccountId === acc.account_id;
            const netIsNeg = acc.net_amount < 0;

            return (
              <div
                key={acc.account_id}
                onClick={() => {
                  handleSelectAccount(
                    isSelected ? null : acc.account_id,
                    isSelected ? "" : acc.account_name
                  );
                }}
                className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-2xs relative ${
                  isSelected
                    ? "border-slate-900 ring-2 ring-slate-900/10"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {/* Account Name & Admin Edit/Delete */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {acc.account_name}
                  </h4>
                  {canManageAccounts && adminAcc && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(adminAcc);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(adminAcc);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Net Balance */}
                <div className={`text-xl font-black mb-3 ${netIsNeg ? "text-rose-600" : "text-emerald-600"}`}>
                  {formatINR(acc.net_amount)}
                </div>

                {/* In / Out Breakdown row */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-emerald-600">
                    In: <strong className="text-emerald-700">{formatINR(acc.total_in_amount)}</strong> ({acc.in_transaction_count})
                  </span>
                  <span className="font-semibold text-rose-600">
                    Out: <strong className="text-rose-700">{formatINR(acc.total_out_amount)}</strong> ({acc.out_transaction_count})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FILTERS PANEL (ALWAYS VISIBLE ON PAGE LOAD) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Filter Options
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
            >
              <X size={13} /> Clear All
            </button>
          )}
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Account Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Account</label>
              <select
                value={selectedAccountId !== null ? String(selectedAccountId) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const accId = Number(val);
                    const match = accountOptions.find((a) => a.id === accId);
                    handleSelectAccount(accId, match?.account_name || "");
                  } else {
                    handleSelectAccount(null, "");
                  }
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Accounts</option>
                {accountOptions.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Product Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Product Categories</option>
                {salesCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Expense Category</label>
              <select
                value={expenseCategoryId}
                onChange={(e) => {
                  setExpenseCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Expense Categories</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Staff</label>
              <select
                value={staffId}
                onChange={(e) => {
                  setStaffId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Staff Members</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.staff_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Months</option>
                {monthsOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold cursor-pointer"
              >
                <option value="">All Years</option>
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-medium"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-medium"
              />
            </div>
          </div>
        </div>

      {/* 🌟 4. SEGMENTED FILTER BUTTONS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* All / In / Out Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInOutFilter("");
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              inOutFilter === ""
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setInOutFilter("IN");
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              inOutFilter === "IN"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            In
          </button>
          <button
            type="button"
            onClick={() => {
              setInOutFilter("OUT");
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              inOutFilter === "OUT"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Out
          </button>

          {selectedAccountId && (
            <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
              <span>Account: {selectedAccountName}</span>
              <button
                onClick={() => handleSelectAccount(null, "")}
                className="hover:text-indigo-900 cursor-pointer ml-1"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search details, customer, order..."
            className="h-9 w-full rounded-xl border border-slate-200 pl-8 pr-7 text-xs font-medium focus:outline-none focus:border-slate-400 bg-white"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 🌟 5. MAIN TRANSACTION LEDGER TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded w-1/4" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-xl" />
            ))}
          </div>
        ) : transactionsList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
              <Landmark size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No transactions found
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              No transaction ledger records match your selected parameters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-150">
                  <th className="py-3.5 px-4 font-bold">DATE &amp; TIME</th>
                  <th className="py-3.5 px-4 font-bold">TYPE</th>
                  <th className="py-3.5 px-4 font-bold">AMOUNT</th>
                  <th className="py-3.5 px-4 font-bold">DETAILS</th>
                  <th className="py-3.5 px-4 font-bold">CATEGORY</th>
                  <th className="py-3.5 px-4 font-bold">ACCOUNT</th>
                  <th className="py-3.5 px-4 font-bold">PAYMENT</th>
                  <th className="py-3.5 px-4 font-bold">BY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {transactionsList.map((tx) => {
                  const isIN = tx.in_out === "IN";
                  const dt = formatTxnDate(tx.date);
                  const details = parseTxnDetails(tx.description);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* DATE & TIME */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{dt.date}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{dt.time}</div>
                      </td>

                      {/* TYPE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isIN ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-bold border border-emerald-200/80">
                            ↓ IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[11px] font-bold border border-rose-200/80">
                            ↑ OUT
                          </span>
                        )}
                      </td>

                      {/* AMOUNT */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-black text-sm">
                        <span className={isIN ? "text-emerald-600" : "text-rose-600"}>
                          {isIN ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                        </span>
                      </td>

                      {/* DETAILS */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        {isIN ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 text-sm">
                              {details.customerName || "Customer Payment"}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <span>
                                {details.orderNumber ? `ID-${details.orderNumber.replace("#", "")}` : ""}
                                {details.orderId ? ` (Order ID: ${details.orderId})` : ""}
                                {details.txnId ? ` (Txn ID: ${details.txnId})` : ""}
                              </span>
                              {details.badgeTag && (
                                <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">
                                  {details.badgeTag}
                                </span>
                              )}
                            </div>
                            {details.balanceDue && (
                              <div className="text-xs font-semibold text-slate-500">
                                Balance due: <strong className="text-amber-700">{formatINR(Number(details.balanceDue))}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 text-sm">
                              {details.cleanNote || details.customerName || "Expense"}
                            </div>
                            {details.expenseDate && (
                              <div className="text-xs font-semibold text-slate-400 mt-0.5">
                                Expense Date: {details.expenseDate}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {details.categoryName || "—"}
                      </td>

                      {/* ACCOUNT */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/50 inline-block">
                          {details.accountName || "—"}
                        </span>
                      </td>

                      {/* PAYMENT */}
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {details.paymentType || "Cash"}
                      </td>

                      {/* BY */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {details.createdByName || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 🌟 6. PINNED PAGINATION FOOTER */}
        {!isLoading && transactionsList.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <div>
              Page {currentPage} of {totalPages} &middot; {totalCount} transactions total
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold shadow-2xs"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

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
