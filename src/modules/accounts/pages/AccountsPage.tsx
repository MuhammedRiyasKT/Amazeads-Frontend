"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Wallet, Info, HelpCircle, Loader2 } from "lucide-react";
import { ExpenseAccount } from "../types/accounts.types";
import { getExpenseAccounts } from "../services/accounts.service";

import AccountsFilters from "../components/AccountsFilters";
import AccountsTable from "../components/AccountsTable";
import AccountMobileCard from "../components/AccountMobileCard";
import AccountDetailsDrawer from "../components/AccountDetailsDrawer";

export default function AccountsPage() {
    // Master accounts list loaded from API
    const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Search & Filter state
    const [searchVal, setSearchVal] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all"); // "all" | "active" | "inactive"

    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 5;

    // Selected account for details drawer
    const [selectedAccount, setSelectedAccount] = useState<ExpenseAccount | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Load Accounts list from GET /api/v1/accounts/expense/accounts
    const fetchAccounts = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getExpenseAccounts();
            setAccounts(data || []);
        } catch (err: any) {
            console.error("Failed to load accounts:", err);
            setErrorMsg("Unable to load accounts. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Debounced search logic matching project search implementation
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchVal.trim());
            setPage(1); // Reset page on filter alteration
        }, 450);

        return () => clearTimeout(handler);
    }, [searchVal]);

    // Adjust page to 1 if status filter changes
    const handleStatusFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearchVal("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setPage(1);
    };

    // Perform Client-side search and filtering
    const filteredAccounts = useMemo(() => {
        return accounts.filter((acc) => {
            // 1. Search filter matches (case-insensitive)
            if (debouncedSearch) {
                const query = debouncedSearch.toLowerCase();
                if (!acc.account_name.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // 2. Status filter matches
            if (statusFilter === "active" && !acc.status) {
                return false;
            }
            if (statusFilter === "inactive" && acc.status) {
                return false;
            }

            return true;
        });
    }, [accounts, debouncedSearch, statusFilter]);

    // Pagination details
    const totalCount = filteredAccounts.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // Page items slice
    const paginatedAccounts = useMemo(() => {
        const startIdx = (page - 1) * pageSize;
        return filteredAccounts.slice(startIdx, startIdx + pageSize);
    }, [filteredAccounts, page]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    const handleViewDetails = (acc: ExpenseAccount) => {
        setSelectedAccount(acc);
        setIsDrawerOpen(true);
    };

    const showEmptyState = !loading && !errorMsg && totalCount === 0;
    const hasActiveFilters = searchVal.trim() !== "" || statusFilter !== "all";

    const startRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const endRecord = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex flex-col gap-6 p-6 w-full font-sans text-slate-800">
            {/* Header Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Wallet className="text-slate-700" size={24} />
                        <span>Accounts</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Manage and view company accounts.
                    </p>
                </div>
                {/* DO NOT show create/add account buttons */}
            </div>

            {/* Filter toolbar */}
            <AccountsFilters
                searchVal={searchVal}
                onSearchChange={setSearchVal}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                onReset={handleResetFilters}
            />

            {/* Main Listing View area */}
            <div className="w-full">
                {loading ? (
                    /* Loading State skeleton */
                    <div className="space-y-3 bg-white p-6 rounded-xl border border-slate-200">
                        <div className="h-6 w-1/4 bg-slate-100 animate-pulse rounded-md" />
                        <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-md" />
                        <div className="space-y-2 pt-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-11 bg-slate-100/70 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    </div>
                ) : errorMsg ? (
                    /* Error State UI */
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                            <Info size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-800">{errorMsg}</h3>
                            <p className="text-xs text-slate-500 font-semibold">
                                An error occurred while calling the accounts api. Please try again.
                            </p>
                        </div>
                        <button
                            onClick={fetchAccounts}
                            className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-2xs"
                        >
                            Retry
                        </button>
                    </div>
                ) : showEmptyState ? (
                    /* Empty State UI */
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 bg-slate-55 text-slate-400 rounded-full flex items-center justify-center">
                            <HelpCircle size={24} />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                            <h3 className="text-sm font-black text-slate-800">No accounts found</h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {hasActiveFilters
                                    ? "There are no accounts matching your current filters."
                                    : "No company accounts lists are found from the backend database."}
                            </p>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={handleResetFilters}
                                className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    /* Responsive lists */
                    <div className="space-y-4">
                        {/* Desktop Table */}
                        <div className="hidden md:block w-full">
                            <AccountsTable accounts={paginatedAccounts} onView={handleViewDetails} />
                        </div>

                        {/* Mobile Cards List */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {paginatedAccounts.map((acc) => (
                                <AccountMobileCard key={acc.id} acc={acc} onView={handleViewDetails} />
                            ))}
                        </div>

                        {/* Pagination footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-xs text-slate-500 font-semibold border-t border-slate-100">
                            <span>
                                Showing {startRecord}–{endRecord} of {totalCount} accounts
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1}
                                    className="px-2.5 h-8 border border-slate-205 hover:bg-slate-50 text-slate-650 rounded-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1 transition-colors"
                                >
                                    <span>Previous</span>
                                </button>

                                <span className="px-3 h-8 flex items-center justify-center font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-md">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="px-2.5 h-8 border border-slate-205 hover:bg-slate-50 text-slate-650 rounded-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1 transition-colors"
                                >
                                    <span>Next</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Details drawer view */}
            {isDrawerOpen && (
                <AccountDetailsDrawer
                    account={selectedAccount}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedAccount(null);
                    }}
                />
            )}
        </div>
    );
}
