"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    TrendingUp,
    Receipt,
    Plus,
    Search,
    Calendar,
    Filter,
    RotateCcw,
    Edit2,
    Trash2,
    Eye,
    X,
    FileText,
    Loader2,
    Paperclip,
} from "lucide-react";
import { accountsService } from "../services/accounts.service";
import {
    Expense,
    ExpenseCategory,
    ExpenseAccount,
    ExpenseKpi,
    ExpenseListParams,
    CreateExpensePayload,
    UpdateExpensePayload,
} from "../types/accounts.types";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const formatINR = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "₹0";
    const formatted = Math.abs(val).toLocaleString("en-IN");
    return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

const formatDateReadable = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

const getStatusBadgeClass = (status: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "paid") {
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
    }
    return "bg-amber-50 text-amber-700 border-amber-250";
};

export default function ExpensesPage() {
    // Lists
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
    const [kpi, setKpi] = useState<ExpenseKpi | null>(null);

    // Pagination & Loading
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
    const [isLoadingKpi, setIsLoadingKpi] = useState<boolean>(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    // Filters State
    const [filterFromDate, setFilterFromDate] = useState<string>("");
    const [filterToDate, setFilterToDate] = useState<string>("");
    const [filterSpecificDate, setFilterSpecificDate] = useState<string>("");
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [filterYear, setFilterYear] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterAccountId, setFilterAccountId] = useState<string>("");
    const [filterPaymentType, setFilterPaymentType] = useState<string>("");
    const [filterUptoToday, setFilterUptoToday] = useState<boolean>(false);

    // Modals & Panels State
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

    // Form Field States
    const [formCategoryText, setFormCategoryText] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [formCategoryDescription, setFormCategoryDescription] = useState<string>("");
    const [formDate, setFormDate] = useState<string>("");
    const [formAmount, setFormAmount] = useState<string>("");
    const [formAccountId, setFormAccountId] = useState<string>("");
    const [formPaymentType, setFormPaymentType] = useState<string>("Cash");
    const [formStatus, setFormStatus] = useState<string>("Paid");
    const [formDescription, setFormDescription] = useState<string>("");
    const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>("");
    const [isSavingForm, setIsSavingForm] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Autocomplete suggestions search behavior
    const [showCategorySuggestions, setShowCategorySuggestions] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Base Data Loading (Categories & Accounts)
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [cats, accs] = await Promise.all([
                    accountsService.getExpenseCategories(),
                    accountsService.getExpenseAccounts(),
                ]);
                setCategories(cats);
                // Only show active accounts where status === true and delete_status === false
                setAccounts(accs.filter((a) => a.status && !a.delete_status));
            } catch (err) {
                console.error("Error fetching metadata:", err);
            }
        };
        fetchMetadata();
    }, []);

    // Close Autocomplete suggestions list if clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCategorySuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Build filters params
    const buildFilterParams = useCallback((pageVal?: number): ExpenseListParams => {
        const params: ExpenseListParams = {
            page: pageVal ?? currentPage,
            page_size: pageSize,
        };
        if (filterFromDate) params.from_date = filterFromDate;
        if (filterToDate) params.to_date = filterToDate;
        if (filterSpecificDate) params.expense_date = filterSpecificDate;
        if (filterMonth) params.month = filterMonth;
        if (filterYear) params.year = filterYear;
        if (filterStatus) params.status = filterStatus;
        if (filterAccountId) params.account_id = Number(filterAccountId);
        if (filterPaymentType) params.payment_type = filterPaymentType;
        if (filterUptoToday) params.upto_today = true;
        return params;
    }, [
        currentPage,
        pageSize,
        filterFromDate,
        filterToDate,
        filterSpecificDate,
        filterMonth,
        filterYear,
        filterStatus,
        filterAccountId,
        filterPaymentType,
        filterUptoToday,
    ]);

    // Load KPI cards
    const loadKpi = useCallback(async () => {
        try {
            setIsLoadingKpi(true);
            const params = buildFilterParams();
            // Remove page and page_size for KPI call
            delete params.page;
            delete params.page_size;
            const res = await accountsService.getExpenseKpi(params);
            setKpi(res);
        } catch (err) {
            console.error("Error loading KPI cards:", err);
        } finally {
            setIsLoadingKpi(false);
        }
    }, [buildFilterParams]);

    // Load Expense List Table
    const loadExpensesList = useCallback(async (targetPage?: number) => {
        try {
            setIsLoadingList(true);
            setErrorText(null);
            const params = buildFilterParams(targetPage);
            const res = await accountsService.listExpenses(params);
            setExpenses(res.items || []);
            setTotalCount(res.pagination?.total_count ?? 0);
            setTotalPages(res.pagination?.total_pages ?? 1);
            if (res.pagination) {
                setCurrentPage(res.pagination.page ?? 1);
            }
        } catch (err) {
            console.error("Error loading expenses list:", err);
            setErrorText("Unable to load expenses. Please try again.");
        } finally {
            setIsLoadingList(false);
        }
    }, [buildFilterParams]);

    // Load both list and KPIs initially and when filters modify
    useEffect(() => {
        loadExpensesList(1);
        loadKpi();
    }, [
        filterFromDate,
        filterToDate,
        filterSpecificDate,
        filterMonth,
        filterYear,
        filterStatus,
        filterAccountId,
        filterPaymentType,
        filterUptoToday,
    ]);

    // Reload lists only when switching pagination index
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadExpensesList(newPage);
        }
    };

    // Reset Filters
    const handleClearFilters = () => {
        setFilterFromDate("");
        setFilterToDate("");
        setFilterSpecificDate("");
        setFilterMonth("");
        setFilterYear("");
        setFilterStatus("");
        setFilterAccountId("");
        setFilterPaymentType("");
        setFilterUptoToday(false);
        setCurrentPage(1);
    };

    // Trigger Account Change Field Behavior:
    // Account = "Cash" => Payment Type = "Cash" (Read Only)
    const handleFormAccountChange = (accId: string) => {
        setFormAccountId(accId);
        const selectedAcc = accounts.find((a) => String(a.id) === accId);
        if (selectedAcc && selectedAcc.account_name.toLowerCase() === "cash") {
            setFormPaymentType("Cash");
        } else {
            setFormPaymentType("Bank Transfer"); // default for other accounts
        }
    };

    // Open Form Dialog for Add or Edit mode
    const openForm = (mode: "add" | "edit", exp?: Expense) => {
        setFormMode(mode);
        if (mode === "edit" && exp) {
            setEditingExpenseId(exp.id);
            setFormCategoryText(exp.category_name);
            setSelectedCategoryId(exp.expense_category_id);
            const existingCat = categories.find((c) => c.category_name === exp.category_name);
            setFormCategoryDescription(existingCat?.description || "nil");
            setFormDate(exp.expense_date);
            setFormAmount(String(exp.amount));
            setFormAccountId(String(exp.account_id));
            setFormPaymentType(exp.payment_type);
            setFormStatus(exp.status);
            setFormDescription(exp.description || "");
            setFormAttachmentUrl(exp.attachment_url || "");
        } else {
            const today = new Date().toISOString().split("T")[0];
            setEditingExpenseId(null);
            setFormCategoryText("");
            setSelectedCategoryId(undefined);
            setFormCategoryDescription("");
            setFormDate(today);
            setFormAmount("");
            setFormAccountId("");
            setFormPaymentType("Cash");
            setFormStatus("Paid");
            setFormDescription("");
            setFormAttachmentUrl("");
        }
        setIsFormOpen(true);
    };

    // Save Expense (Post Add / Put Edit)
    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formCategoryText.trim()) {
            alert("Please select or enter a Category.");
            return;
        }
        const amt = Number(formAmount);
        if (isNaN(amt) || amt <= 0) {
            alert("Please enter a valid positive Amount.");
            return;
        }
        if (!formAccountId) {
            alert("Please select an Account.");
            return;
        }

        setIsSavingForm(true);

        try {
            const payload: CreateExpensePayload = {
                category_name: formCategoryText.trim(),
                category_description: formCategoryDescription.trim() || "nil",
                expense_date: formDate,
                amount: amt,
                account_id: Number(formAccountId),
                payment_type: formPaymentType,
                description: formDescription.trim() || "nil",
                attachment_url: formAttachmentUrl.trim() || "nil",
                status: formStatus,
            };

            if (selectedCategoryId) {
                payload.expense_category_id = selectedCategoryId;
            }

            if (formMode === "edit" && editingExpenseId) {
                await accountsService.updateExpense(editingExpenseId, payload);
                alert("Expense updated successfully!");
            } else {
                await accountsService.createExpense(payload);
                alert("Expense added successfully!");
            }

            setIsFormOpen(false);

            // Refresh base category list suggestions
            const updatedCategories = await accountsService.getExpenseCategories();
            setCategories(updatedCategories);

            // Refresh list & KPIs
            loadExpensesList(1);
            loadKpi();
        } catch (err: any) {
            console.error("Error saving expense:", err);
            alert(err?.response?.data?.message || "Failed to save expense.");
        } finally {
            setIsSavingForm(false);
        }
    };

    // Delete Action Trigger
    const triggerDelete = (exp: Expense) => {
        setExpenseToDelete(exp);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!expenseToDelete) return;
        setIsDeleting(true);
        try {
            await accountsService.deleteExpense(expenseToDelete.id);
            alert("Expense deleted successfully!");
            setIsDeleteOpen(false);
            setExpenseToDelete(null);
            loadExpensesList(1);
            loadKpi();
        } catch (err: any) {
            console.error("Error deleting expense:", err);
            alert(err?.response?.data?.message || "Failed to delete expense.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Details Action Trigger
    const triggerDetails = (exp: Expense) => {
        setSelectedExpense(exp);
        setIsDetailsOpen(true);
    };

    // Filter Categories suggestions from search text
    const filteredCategories = categories.filter((c) =>
        c.category_name.toLowerCase().includes(formCategoryText.toLowerCase())
    );

    const exactCategoryMatch = categories.find(
        (c) => c.category_name.toLowerCase() === formCategoryText.trim().toLowerCase()
    );

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 w-full max-w-full overflow-hidden box-border">
            {/* 1. Header Section */}
            <div className="flex items-center justify-between border-b border-slate-205 pb-3">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Receipt className="text-slate-800" size={24} />
                        Expenses
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Manage and track all business expenses
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openForm("add")}
                    className="flex items-center gap-1"
                >
                    <Plus size={16} /> Add Expense
                </Button>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Expense Amount */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Expenses</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                            {isLoadingKpi ? "..." : formatINR(kpi?.total_expense_amount ?? kpi?.total_amount ?? 0)}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Receipt size={18} className="text-slate-700" />
                    </div>
                </div>

                {/* Total Expense Count */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expense Count</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                            {isLoadingKpi ? "..." : kpi?.expense_count ?? kpi?.expenses_count ?? 0}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <TrendingUp size={18} className="text-slate-700" />
                    </div>
                </div>

                {/* Filter Period / Description */}
                <div className="bg-slate-50/50 p-4.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Report Period</span>
                    <span className="text-xs font-semibold text-slate-800 mt-1">
                        {filterFromDate || filterToDate ? (
                            <span>
                                {filterFromDate ? formatDateReadable(filterFromDate) : "Beginning"} to{" "}
                                {filterToDate ? formatDateReadable(filterToDate) : "Today"}
                            </span>
                        ) : filterSpecificDate ? (
                            <span>Date: {formatDateReadable(filterSpecificDate)}</span>
                        ) : (
                            <span>Showing All Time Expenses</span>
                        )}
                    </span>
                </div>
            </div>

            {/* 3. Filters Component Panel */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Filter size={14} className="text-slate-700" />
                    <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Filter Settings</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-600">
                    {/* Specific Date */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Specific Date</span>
                        <input
                            type="date"
                            value={filterSpecificDate}
                            onChange={(e) => {
                                setFilterSpecificDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                    </div>

                    {/* Account */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Account</span>
                        <select
                            value={filterAccountId}
                            onChange={(e) => {
                                setFilterAccountId(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                            <option value="">All Accounts</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.account_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Status</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>

                    {/* Payment Type */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Payment Type</span>
                        <select
                            value={filterPaymentType}
                            onChange={(e) => {
                                setFilterPaymentType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>

                    {/* Date Range: From */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">From Date</span>
                        <input
                            type="date"
                            value={filterFromDate}
                            onChange={(e) => {
                                setFilterFromDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                    </div>

                    {/* Date Range: To */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">To Date</span>
                        <input
                            type="date"
                            value={filterToDate}
                            onChange={(e) => {
                                setFilterToDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                    </div>

                    {/* Upto Today Checkbox */}
                    <div className="flex items-center gap-2 mt-4 sm:mt-5">
                        <input
                            id="uptoTodayChk"
                            type="checkbox"
                            checked={filterUptoToday}
                            onChange={(e) => {
                                setFilterUptoToday(e.target.checked);
                                setCurrentPage(1);
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <label htmlFor="uptoTodayChk" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                            Upto Today
                        </label>
                    </div>

                    {/* Reset Filters CTA */}
                    <div className="flex items-end justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="flex items-center justify-center gap-1 w-full text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"
                        >
                            <RotateCcw size={13} /> Reset Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* 4. Table / List Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-100/80 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                <th className="py-3 px-4 border-r border-slate-100">Date</th>
                                <th className="py-3 px-4 border-r border-slate-100">Category</th>
                                <th className="py-3 px-4 border-r border-slate-100">Account</th>
                                <th className="py-3 px-4 border-r border-slate-100">Payment Type</th>
                                <th className="py-3 px-4 border-r border-slate-100">Amount</th>
                                <th className="py-3 px-4 border-r border-slate-100">Status</th>
                                <th className="py-3 px-4 border-r border-slate-100 font-medium">Created By</th>
                                <th className="py-3 px-4 text-center border-r border-slate-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoadingList ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-slate-500 font-semibold border-r border-slate-100">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-700" size={16} />
                                            Loading expenses...
                                        </div>
                                    </td>
                                </tr>
                            ) : errorText ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-rose-600 font-semibold border-r border-slate-100">
                                        {errorText}
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-500 flex flex-col items-center gap-2 justify-center border-r border-slate-100">
                                        <span className="font-bold">No expenses found</span>
                                        <span className="text-slate-400 text-xs">Try changing your filters or add a new expense.</span>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 border-r border-slate-100 font-medium font-semibold text-slate-650">
                                            {formatDateReadable(exp.expense_date)}
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100 font-bold text-slate-800">
                                            {exp.category_name}
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100 font-medium text-slate-850">
                                            {exp.account_name}
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100">
                                            <span className="inline-flex items-center gap-1 font-bold text-slate-750">
                                                {exp.payment_type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100 font-black text-slate-900">
                                            {formatINR(exp.amount)}
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(exp.status)}`}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100 font-semibold text-slate-650">
                                            {exp.created_by_name || "System"}
                                        </td>
                                        <td className="py-3.5 px-4 border-r border-slate-100">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => triggerDetails(exp)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-100 border border-slate-205 rounded-lg transition-colors cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => openForm("edit", exp)}
                                                    className="p-1.5 text-blue-500 hover:text-blue-800 hover:bg-blue-50 border border-slate-205 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => triggerDelete(exp)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 border border-slate-205 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="block md:hidden p-3 space-y-3">
                    {isLoadingList ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-semibold flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin text-slate-700" size={14} /> Loading...
                        </div>
                    ) : errorText ? (
                        <div className="text-center py-6 text-rose-600 text-xs font-semibold">
                            {errorText}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2">
                            <div>No expenses found</div>
                            <div className="text-[11px] text-slate-400 font-medium">Try changing your filters or add a new expense.</div>
                        </div>
                    ) : (
                        expenses.map((exp) => (
                            <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">{exp.category_name}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">{formatDateReadable(exp.expense_date)}</p>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{formatINR(exp.amount)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-650 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                                    <div>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Account</span>
                                        <span>{exp.account_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Payment Type</span>
                                        <span>{exp.payment_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Status</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border inline-block ${getStatusBadgeClass(exp.status)}`}>
                                            {exp.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Description</span>
                                        <span className="truncate block max-w-[120px]">{exp.description || "—"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => triggerDetails(exp)}
                                        className="px-2.5 py-1 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => openForm("edit", exp)}
                                        className="px-2.5 py-1 text-xs font-bold bg-blue-550/10 hover:bg-blue-600/10 text-blue-600 rounded-md border border-blue-200 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => triggerDelete(exp)}
                                        className="px-2.5 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-200 cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Section */}
                {!isLoadingList && expenses.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 gap-2">
                        <div className="text-xs text-slate-500 font-semibold">
                            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} expenses)
                        </div>
                        <Pagination
                            total={totalCount}
                            limit={pageSize}
                            activePage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* 5. ADD / EDIT EXPENSE FORM (Modal) */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end items-stretch z-50 transition-opacity">
                    <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative border-l border-slate-200 animate-slide-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4.5 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {formMode === "add" ? "Add Expense" : "Edit Expense"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {formMode === "add" ? "Record a new business expense" : "Update this business expense details"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Form Container */}
                        <form onSubmit={handleSaveExpense} className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Category Search AutoComplete */}
                            <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Category <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Typing to suggest or select from suggestion"
                                    value={formCategoryText}
                                    onChange={(e) => {
                                        setFormCategoryText(e.target.value);
                                        setSelectedCategoryId(undefined);
                                        setShowCategorySuggestions(true);
                                    }}
                                    onFocus={() => setShowCategorySuggestions(true)}
                                    required
                                    className="w-full text-slate-800"
                                />

                                {/* Suggestions List Dropdown */}
                                {showCategorySuggestions && (
                                    <div className="absolute top-16 left-0 right-0 max-h-56 bg-white border border-slate-250 rounded-lg shadow-lg z-50 overflow-y-auto divide-y divide-slate-100">
                                        {filteredCategories.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormCategoryText(c.category_name);
                                                    setSelectedCategoryId(c.id);
                                                    setFormCategoryDescription(c.description || "nil");
                                                    setShowCategorySuggestions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 text-slate-700 block whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-colors"
                                            >
                                                {c.category_name}
                                            </button>
                                        ))}
                                        {!exactCategoryMatch && formCategoryText.trim().length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategoryId(undefined);
                                                    setFormCategoryDescription("nil");
                                                    setShowCategorySuggestions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50 block cursor-pointer transition-colors"
                                            >
                                                + Add "{formCategoryText}" as new category
                                            </button>
                                        )}
                                        {filteredCategories.length === 0 && !formCategoryText.trim() && (
                                            <div className="px-3 py-2 text-xs text-slate-400 font-medium italic">
                                                Type to filter categories...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Expense Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Expense Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    required
                                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                                />
                            </div>

                            {/* Amount */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Amount (₹) <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={formAmount}
                                    onChange={(e) => setFormAmount(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            {/* Account Dropdown */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Account <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formAccountId}
                                    onChange={(e) => handleFormAccountChange(e.target.value)}
                                    required
                                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                                >
                                    <option value="" disabled>Select parent account</option>
                                    {accounts.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Type */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Payment Type
                                </label>
                                <select
                                    value={formPaymentType}
                                    onChange={(e) => setFormPaymentType(e.target.value)}
                                    disabled={(() => {
                                        const selectedAcc = accounts.find((a) => String(a.id) === formAccountId);
                                        return !!(selectedAcc && selectedAcc.account_name.toLowerCase() === "cash");
                                    })()}
                                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                </select>
                                {(() => {
                                    const selectedAcc = accounts.find((a) => String(a.id) === formAccountId);
                                    if (selectedAcc && selectedAcc.account_name.toLowerCase() === "cash") {
                                        return (
                                            <span className="text-[10px] text-slate-400 font-semibold italic mt-0.5">
                                                Selected Account is cash. Payment Type is set and restricted to Cash.
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Status <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                    required
                                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Description
                                </label>
                                <textarea
                                    placeholder="Optional brief description"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={2}
                                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none font-medium"
                                />
                            </div>

                            {/* Attachment Url */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                    Attachment URL
                                </label>
                                <Input
                                    type="text"
                                    placeholder="https://example.com/receipt.jpg"
                                    value={formAttachmentUrl}
                                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </form>

                        {/* Footer Form CTAs */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                disabled={isSavingForm}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveExpense}
                                disabled={isSavingForm}
                                className="flex items-center gap-1"
                            >
                                {isSavingForm ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} /> Saving...
                                    </>
                                ) : (
                                    "Save Expense"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. EXPENSE DETAILS DRAWER */}
            {isDetailsOpen && selectedExpense && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end items-stretch z-50">
                    <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl relative border-l border-slate-200 animate-slide-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4.5 border-b border-slate-200">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-650" />
                                Expense Details
                            </h3>
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Panel Details */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-semibold text-slate-700">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Category</span>
                                <p className="text-sm font-black text-slate-950">{selectedExpense.category_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Expense Date</span>
                                    <p className="text-xs font-bold text-slate-900">{formatDateReadable(selectedExpense.expense_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Amount</span>
                                    <p className="text-lg font-black text-indigo-700">{formatINR(selectedExpense.amount)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Account</span>
                                    <p className="text-xs font-bold text-slate-900">{selectedExpense.account_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Payment Type</span>
                                    <p className="text-xs font-bold text-slate-900">{selectedExpense.payment_type}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Status</span>
                                    <div>
                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-block ${getStatusBadgeClass(selectedExpense.status)}`}>
                                            {selectedExpense.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-slate-100 pt-3">
                                <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Description</span>
                                <p className="text-slate-650 leading-relaxed font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    {selectedExpense.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Created By</span>
                                    <p className="text-slate-800 font-bold">{selectedExpense.created_by_name || "System"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Created On</span>
                                    <p className="text-slate-500 font-semibold">{formatDateReadable(selectedExpense.created_on)}</p>
                                </div>
                            </div>

                            {selectedExpense.attachment_url && selectedExpense.attachment_url !== "nil" && (
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">Attachment</span>
                                    <a
                                        href={selectedExpense.attachment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 p-2.5 text-xs text-indigo-700 bg-indigo-50/50 border border-indigo-150 rounded-lg hover:bg-indigo-100 transition-colors w-full cursor-pointer"
                                    >
                                        <Paperclip size={14} />
                                        <span className="truncate flex-1 font-bold">Open Attachment Receipt</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer Details Drawer CTA */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDetailsOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. DELETE EXPENSE CONFIRMATION DIALOG */}
            {isDeleteOpen && expenseToDelete && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 w-full max-w-sm shadow-2xl relative animate-scale-up space-y-4">
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">Delete this expense?</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                This item will be deleted permanently. This action is not reversible.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-705">
                            <div className="flex justify-between items-center text-slate-800">
                                <span className="font-bold text-slate-905">{expenseToDelete.category_name}</span>
                                <span className="font-bold text-indigo-705">{formatINR(expenseToDelete.amount)}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Date: {formatDateReadable(expenseToDelete.expense_date)}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setExpenseToDelete(null);
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-1"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} /> Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
