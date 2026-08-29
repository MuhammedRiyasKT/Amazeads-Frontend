// src/modules/customers/pages/CustomersPage.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Search,
    Eye,
    Users,
    RotateCw,
    X,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { getCustomers } from "../customers.service";
import {
    Customer,
    CustomerRole,
    CustomerListParams,
    CustomerPagination,
    DateFilterMode,
} from "../customers.types";
import CustomerDetailsDrawer from "../components/CustomerDetailsDrawer";

interface Props {
    role: CustomerRole;
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status?.toLowerCase() === "active";
    return (
        <span
            className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase ${isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-slate-50 text-slate-500 border-slate-100"
                }`}
        >
            {status || "—"}
        </span>
    );
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default function CustomersPage({ role }: Props) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pagination, setPagination] = useState<CustomerPagination>({
        page: 1,
        page_size: 5,
        total_count: 0,
        total_pages: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [dateMode, setDateMode] = useState<DateFilterMode>("all");
    const [specificDate, setSpecificDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buildParams = useCallback(
        (page: number): CustomerListParams => {
            const params: CustomerListParams = { page, page_size: 5 };
            if (search.trim()) params.search = search.trim();
            if (dateMode === "specific" && specificDate) {
                params.date = specificDate;
            } else if (dateMode === "range") {
                if (fromDate) params.from_date = fromDate;
                if (toDate) params.to_date = toDate;
            }
            return params;
        },
        [search, dateMode, specificDate, fromDate, toDate]
    );

    const fetchCustomers = useCallback(
        async (page: number) => {
            setLoading(true);
            setError(null);
            try {
                const res = await getCustomers(role, buildParams(page));
                setCustomers(res.items ?? []);
                setPagination(res.pagination ?? { page, page_size: 5, total_count: 0, total_pages: 1 });
            } catch {
                setError("Failed to load customers. Please try again.");
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        },
        [role, buildParams]
    );

    // Initial + filter-triggered fetch with debounce on search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCustomers(1);
        }, search ? 400 : 0);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, dateMode, specificDate, fromDate, toDate, role]);

    const handlePageChange = (page: number) => {
        fetchCustomers(page);
    };

    const handleReset = () => {
        setSearch("");
        setDateMode("all");
        setSpecificDate("");
        setFromDate("");
        setToDate("");
    };

    const hasActiveFilter =
        search.trim() ||
        dateMode !== "all" ||
        specificDate ||
        fromDate ||
        toDate;

    const handleViewDetails = (id: number) => {
        setSelectedId(id);
        setDrawerOpen(true);
    };

    const totalPages = pagination.total_pages ?? 1;
    const currentPage = pagination.page ?? 1;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600" /> Customer Management
                    </h1>
                    <p className="text-xs font-semibold text-slate-500">
                        Manage and view customer information
                        {pagination.total_count > 0 && (
                            <span className="ml-2 inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {pagination.total_count} customers
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => fetchCustomers(currentPage)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Refresh"
                >
                    <RotateCw size={13} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Search Customer
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, mobile or WhatsApp..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-full border border-slate-200 rounded-lg pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 bg-white placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Date filter mode selector */}
                    <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Date Filter
                        </label>
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            {(["all", "specific", "range"] as DateFilterMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setDateMode(mode)}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors capitalize cursor-pointer ${dateMode === mode
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {mode === "all" ? "All" : mode === "specific" ? "Specific Date" : "Date Range"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reset */}
                    {hasActiveFilter && (
                        <button
                            onClick={handleReset}
                            className="h-9 flex items-center gap-1.5 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 bg-white transition-colors cursor-pointer"
                        >
                            <X size={13} /> Reset
                        </button>
                    )}
                </div>

                {/* Date pickers */}
                {dateMode === "specific" && (
                    <div className="flex items-center gap-3 pt-1">
                        <div>
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                className="h-9 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 bg-white"
                            />
                        </div>
                    </div>
                )}

                {dateMode === "range" && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div>
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-9 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-9 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 bg-white"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                {/* Loading skeleton */}
                {loading && (
                    <div className="divide-y divide-slate-100 animate-pulse">
                        <div className="h-10 bg-slate-50 border-b border-slate-100" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-14 bg-white px-4 flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-slate-100 rounded w-40" />
                                    <div className="h-2.5 bg-slate-100 rounded w-28" />
                                </div>
                                <div className="h-3 bg-slate-100 rounded w-20 hidden sm:block" />
                                <div className="h-3 bg-slate-100 rounded w-20 hidden md:block" />
                                <div className="h-6 bg-slate-100 rounded-full w-14" />
                                <div className="h-7 bg-slate-100 rounded-lg w-20" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                        <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                            <X size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">{error}</p>
                        <button
                            onClick={() => fetchCustomers(currentPage)}
                            className="mt-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && customers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                        <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">No customers found</p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                                {hasActiveFilter ? "Try changing your filters." : "No customers in the system yet."}
                            </p>
                        </div>
                        {hasActiveFilter && (
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Table — desktop */}
                {!loading && !error && customers.length > 0 && (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px] w-8">#</th>
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Customer</th>
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Mobile</th>
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">WhatsApp</th>
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="px-4 py-3 text-left font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Created</th>
                                        <th className="px-4 py-3 text-center font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {customers.map((cust) => (
                                        <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 font-bold text-[11px]">#{cust.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center uppercase shrink-0">
                                                        {(cust.customer_name || "C").charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-800">{cust.customer_name || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-700">{cust.mobile_number || "—"}</td>
                                            <td className="px-4 py-3 font-bold text-slate-700">{cust.whatsapp_number || "—"}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={cust.status} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} className="text-slate-400" />
                                                    {formatDate(cust.created_on)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(cust.id)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                                                >
                                                    <Eye size={12} /> View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-slate-100">
                            {customers.map((cust) => (
                                <div key={cust.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center uppercase shrink-0">
                                                {(cust.customer_name || "C").charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{cust.customer_name || "—"}</p>
                                                <p className="text-[10px] font-semibold text-slate-400">#{cust.id}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={cust.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Mobile</span>
                                            <span className="font-bold text-slate-700">{cust.mobile_number || "—"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">WhatsApp</span>
                                            <span className="font-bold text-slate-700">{cust.whatsapp_number || "—"}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Created</span>
                                            <span className="font-semibold text-slate-600">{formatDate(cust.created_on)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(cust.id)}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                                    >
                                        <Eye size={13} /> View Details
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                                <span className="text-[11px] font-bold text-slate-400">
                                    Page {currentPage} of {totalPages} &bull; {pagination.total_count} total
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${pageNum === currentPage
                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default transition-colors cursor-pointer"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Details Drawer */}
            <CustomerDetailsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                customerId={selectedId}
                role={role}
            />
        </div>
    );
}
