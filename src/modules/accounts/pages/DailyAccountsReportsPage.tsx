// src/modules/accounts/pages/DailyAccountsReportsPage.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    TrendingUp,
    Wallet,
    Clock3,
    Receipt,
    ArrowUpDown,
    ShoppingBag,
    Landmark,
    ChevronDown,
    ChevronRight,
    Calendar,
    Search,
    ChevronLeft,
    RefreshCw,
    AlertCircle,
    FileText,
} from "lucide-react";
import { accountsService } from "../services/accounts.service";
import {
    DailyAccountsReport,
    DailyAccountsReportResponse,
    DailyAccountsReportParams,
} from "../types/accounts.types";

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

type FilterType = "all" | "today" | "specific_date" | "specific_day" | "month" | "range";

export default function DailyAccountsReportsPage() {
    const [reports, setReports] = useState<DailyAccountsReport[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize] = useState<number>(5);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    // Track expanded rows (date is the unique key)
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (date: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [date]: !prev[date],
        }));
    };

    const loadReports = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params: DailyAccountsReportParams = {
                page: currentPage,
                page_size: pageSize,
            };

            if (filterType === "today") {
                // Today is 2026-08-22 based on system context
                params.date = "2026-08-22";
            } else if (filterType === "specific_date" && selectedDate) {
                params.date = selectedDate;
            } else if (filterType === "specific_day" && selectedDay && selectedMonth && selectedYear) {
                params.day = parseInt(selectedDay, 10);
                params.month = parseInt(selectedMonth, 10);
                params.year = parseInt(selectedYear, 10);
            } else if (filterType === "month" && selectedMonth && selectedYear) {
                params.month = parseInt(selectedMonth, 10);
                params.year = parseInt(selectedYear, 10);
            } else if (filterType === "range" && fromDate && toDate) {
                params.from_date = fromDate;
                params.to_date = toDate;
            }

            const response = await accountsService.listDailySummary(params);

            // Use items consistent with user instructions
            const dataItems = response.items || response.reports || [];
            setReports(dataItems);
            setTotalCount(response.total_count || 0);

            if (response.pagination) {
                setCurrentPage(response.pagination.page || 1);
                setTotalPages(response.pagination.total_pages || 1);
            } else {
                setTotalPages(Math.ceil((response.total_count || 0) / pageSize) || 1);
            }
        } catch (err) {
            setError("Unable to load daily accounts reports data");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [
        currentPage,
        pageSize,
        filterType,
        selectedDate,
        selectedDay,
        selectedMonth,
        selectedYear,
        fromDate,
        toDate,
    ]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleFilterTypeChange = (type: FilterType) => {
        setFilterType(type);
        setCurrentPage(1);
        setExpandedRows({});
        // Pre-populate some inputs if switching to relevant filter types
        if (type === "specific_day" || type === "month") {
            const today = new Date("2026-08-22");
            if (!selectedDay) setSelectedDay(String(today.getDate()).padStart(2, "0"));
            if (!selectedMonth) setSelectedMonth(String(today.getMonth() + 1).padStart(2, "0"));
            if (!selectedYear) setSelectedYear(String(today.getFullYear()));
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Generate Year options
    const years = Array.from({ length: 7 }, (_, i) => String(2023 + i));

    // Generate Month options
    const months = [
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

    // Generate Day options
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

    return (
        <div className="p-4 md:p-5 space-y-5 max-w-7xl mx-auto">
            {/* Toast Feedback */}
            {error && !isLoading && (
                <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button onClick={loadReports} className="font-bold underline hover:text-rose-900">
                        Retry
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg md:text-xl font-bold text-slate-900">Daily Accounts Reports</h1>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-md animate-pulse">
                            Live Ledger
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        View detailed sales, collections, physical cash flow, and bank balances day by day.
                    </p>
                </div>

                {/* Action button */}
                <div>
                    <button
                        onClick={loadReports}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-905 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Filter Options card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
                        Filter Type:
                    </span>
                    {[
                        { id: "all", label: "All Records" },
                        { id: "today", label: "Today" },
                        { id: "specific_date", label: "Specific Date" },
                        { id: "specific_day", label: "Specific Day" },
                        { id: "month", label: "By Month" },
                        { id: "range", label: "Date Range" },
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleFilterTypeChange(type.id as FilterType)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border ${filterType === type.id
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800 border-slate-200"
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Inputs Based on Filter Type */}
                {filterType !== "all" && filterType !== "today" && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        {filterType === "specific_date" && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Date</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
                                />
                            </div>
                        )}

                        {filterType === "specific_day" && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Day</span>
                                    <select
                                        value={selectedDay}
                                        onChange={(e) => {
                                            setSelectedDay(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-20"
                                    >
                                        {days.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Month</span>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            setSelectedMonth(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-28"
                                    >
                                        {months.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Year</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-24"
                                    >
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {filterType === "month" && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Month</span>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            setSelectedMonth(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-28"
                                    >
                                        {months.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Year</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-24"
                                    >
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {filterType === "range" && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">From Date</span>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => {
                                            setFromDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-40"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">To Date</span>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => {
                                            setToDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-40"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="border border-slate-200 rounded-2xl bg-white p-12 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Loading daily summary reports...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="border border-slate-200 rounded-2xl bg-white p-16 flex flex-col items-center justify-center text-center space-y-3.5">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-950">No Reports Found</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            There are no daily accounts summaries matching the selected filter criteria. Try adjusting your parameters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Master Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3.5 w-12 border-r border-b border-slate-200 bg-slate-50 text-center"></th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 font-bold text-slate-700">Date</th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 text-center font-bold text-slate-700">Orders</th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 text-right font-bold text-slate-700">Sales</th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 text-right font-bold text-slate-700">Collection</th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 text-right font-bold text-slate-700">Pending</th>
                                        <th className="px-4 py-3.5 border-r border-b border-slate-200 bg-slate-50 text-right font-bold text-slate-700">Expenses</th>
                                        <th className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 text-right font-bold text-slate-700">Net Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reports.map((report) => {
                                        const sum = report.summary;
                                        const isExpanded = !!expandedRows[sum.date];
                                        const netIsNeg = sum.net_amount < 0;

                                        return (
                                            <React.Fragment key={sum.date}>
                                                {/* Master Row */}
                                                <tr
                                                    onClick={() => toggleRow(sum.date)}
                                                    className={`hover:bg-slate-50/80 transition-all cursor-pointer ${isExpanded ? "bg-slate-100/50" : ""
                                                        }`}
                                                >
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-center">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-all">
                                                            {isExpanded ? <ChevronDown size={15} className="text-slate-600" /> : <ChevronRight size={15} />}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 font-bold text-slate-800">
                                                        {formatDateReadable(sum.date)}
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-center">
                                                        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 font-extrabold rounded-full text-[10px] min-w-[24px]">
                                                            {sum.total_orders}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-right font-bold text-slate-700">
                                                        {formatINR(sum.today_sales)}
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-right font-extrabold text-emerald-600 bg-emerald-50/10">
                                                        {formatINR(sum.today_collection)}
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-right font-bold text-amber-600 bg-amber-50/10">
                                                        {formatINR(sum.today_pending)}
                                                    </td>
                                                    <td className="px-4 py-3.5 border-r border-slate-200 text-right font-bold text-rose-600 bg-rose-50/10">
                                                        {formatINR(sum.today_expenses)}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3.5 text-right font-extrabold text-sm ${netIsNeg ? "text-rose-700 bg-rose-50/20" : "text-indigo-700 bg-indigo-50/15"
                                                            }`}
                                                    >
                                                        {formatINR(sum.net_amount)}
                                                    </td>
                                                </tr>

                                                {/* Expanded Detail Panel */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={8} className="px-6 py-4 bg-slate-50 border-r border-slate-200">
                                                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 w-full">
                                                                {/* Header / Sub-title */}
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <Landmark className="w-4.5 h-4.5 text-slate-500" />
                                                                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">
                                                                            Account Ledger Breakdown
                                                                        </h4>
                                                                    </div>

                                                                    {/* Secondary Total/Cumulative Info inside Expanded Section */}
                                                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-inner">
                                                                        <span className="text-slate-400">Cumulative for Period:</span>
                                                                        <span className="text-indigo-650">Sales: {formatINR(sum.total_sales)}</span>
                                                                        <span className="text-slate-350">|</span>
                                                                        <span className="text-emerald-650">Coll: {formatINR(sum.total_collection)}</span>
                                                                        <span className="text-slate-350">|</span>
                                                                        <span className="text-amber-650">Pending: {formatINR(sum.total_pending)}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Detail breakdown table */}
                                                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                                                                    <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                                                                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                                                            <tr>
                                                                                <th className="px-4 py-2.5 border-r border-b border-slate-200">Account Name</th>
                                                                                <th className="px-4 py-2.5 border-r border-b border-slate-200 text-right">Collection Received</th>
                                                                                <th className="px-4 py-2.5 border-r border-b border-slate-200 text-right">Expenses Paid</th>
                                                                                <th className="px-4 py-2.5 border-b border-slate-200 text-right">Current Ledger Balance</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-200 bg-white">
                                                                            {report.accounts_breakdown && report.accounts_breakdown.length > 0 ? (
                                                                                report.accounts_breakdown.map((account) => {
                                                                                    const balIsNeg = account.current_balance < 0;
                                                                                    return (
                                                                                        <tr key={account.account_id} className="hover:bg-slate-50/50 transition-colors">
                                                                                            <td className="px-4 py-2.5 border-r border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                                                                                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                                                                {account.account_name}
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 border-r border-slate-200 text-right font-extrabold text-emerald-600 bg-emerald-50/5">
                                                                                                {formatINR(account.today_collection)}
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 border-r border-slate-200 text-right font-semibold text-slate-600">
                                                                                                {formatINR(account.today_expense)}
                                                                                            </td>
                                                                                            <td
                                                                                                className={`px-4 py-2.5 text-right font-bold ${balIsNeg ? "text-rose-600 bg-rose-50/5" : "text-slate-900"
                                                                                                    }`}
                                                                                            >
                                                                                                {formatINR(account.current_balance)}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-400 text-xs">
                                                                                        No account breakdown data for this date.
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                                <div>
                                    Showing page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
                                    <span className="font-bold text-slate-800">{totalPages}</span> —{" "}
                                    <span className="font-bold text-slate-800">{totalCount}</span> total summaries
                                </div>
                                <div className="inline-flex items-center gap-1.5">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || isLoading}
                                        className="p-1 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 select-none transition shadow-xs"
                                    >
                                        <ChevronLeft size={14} className="inline mr-1" /> Prev
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="p-1 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 select-none transition shadow-xs"
                                    >
                                        Next <ChevronRight size={14} className="inline ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

