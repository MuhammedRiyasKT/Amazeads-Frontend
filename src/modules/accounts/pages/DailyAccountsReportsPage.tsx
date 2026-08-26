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
    WeeklyAccountsReportParams,
    MonthlyAccountsReportParams,
    YearlyAccountsReportParams,
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
type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

export default function DailyAccountsReportsPage() {
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("daily");
    const [reports, setReports] = useState<DailyAccountsReport[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize] = useState<number>(5);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Daily Filter states
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    // Weekly/Monthly/Yearly Filter states
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [uptoToday, setUptoToday] = useState<boolean>(false);

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

            if (reportPeriod === "daily") {
                const params: DailyAccountsReportParams = {
                    page: currentPage,
                    page_size: pageSize,
                };

                if (filterType === "today") {
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
                const dataItems = response.items || response.reports || [];
                setReports(dataItems);
                setTotalCount(response.total_count || 0);

                if (response.pagination) {
                    setCurrentPage(response.pagination.page || 1);
                    setTotalPages(response.pagination.total_pages || 1);
                } else {
                    setTotalPages(Math.ceil((response.total_count || 0) / pageSize) || 1);
                }
            } else if (reportPeriod === "weekly") {
                const params: WeeklyAccountsReportParams = {
                    page: currentPage,
                    page_size: pageSize,
                };
                if (selectedYear) params.year = parseInt(selectedYear, 10);
                if (selectedMonth) params.month = parseInt(selectedMonth, 10);
                if (selectedWeek) params.week = parseInt(selectedWeek, 10);
                if (fromDate) params.from_date = fromDate;
                if (toDate) params.to_date = toDate;
                if (uptoToday) {
                    params.upto_today = true;
                    params.upto = true;
                }

                const response = await accountsService.listWeeklySummary(params);
                const dataItems = response.items || response.reports || [];
                setReports(dataItems);
                setTotalCount(response.total_count || 0);

                if (response.pagination) {
                    setCurrentPage(response.pagination.page || 1);
                    setTotalPages(response.pagination.total_pages || 1);
                } else {
                    setTotalPages(Math.ceil((response.total_count || 0) / pageSize) || 1);
                }
            } else if (reportPeriod === "monthly") {
                const params: MonthlyAccountsReportParams = {
                    page: currentPage,
                    page_size: pageSize,
                };
                if (selectedYear) params.year = parseInt(selectedYear, 10);
                if (selectedMonth) params.month = parseInt(selectedMonth, 10);
                if (fromDate) params.from_date = fromDate;
                if (toDate) params.to_date = toDate;
                if (uptoToday) {
                    params.upto_today = true;
                    params.upto = true;
                }

                const response = await accountsService.listMonthlySummary(params);
                const dataItems = response.items || response.reports || [];
                setReports(dataItems);
                setTotalCount(response.total_count || 0);

                if (response.pagination) {
                    setCurrentPage(response.pagination.page || 1);
                    setTotalPages(response.pagination.total_pages || 1);
                } else {
                    setTotalPages(Math.ceil((response.total_count || 0) / pageSize) || 1);
                }
            } else if (reportPeriod === "yearly") {
                const params: YearlyAccountsReportParams = {
                    page: currentPage,
                    page_size: pageSize,
                };
                if (selectedYear) params.year = parseInt(selectedYear, 10);
                if (fromDate) params.from_date = fromDate;
                if (toDate) params.to_date = toDate;
                if (uptoToday) {
                    params.upto_today = true;
                    params.upto = true;
                }

                const response = await accountsService.listYearlySummary(params);
                const dataItems = response.items || response.reports || [];
                setReports(dataItems);
                setTotalCount(response.total_count || 0);

                if (response.pagination) {
                    setCurrentPage(response.pagination.page || 1);
                    setTotalPages(response.pagination.total_pages || 1);
                } else {
                    setTotalPages(Math.ceil((response.total_count || 0) / pageSize) || 1);
                }
            }
        } catch (err) {
            setError(`Unable to load ${reportPeriod} accounts reports data`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [
        reportPeriod,
        currentPage,
        pageSize,
        filterType,
        selectedDate,
        selectedDay,
        selectedMonth,
        selectedYear,
        selectedWeek,
        fromDate,
        toDate,
        uptoToday,
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

    // Generate Week options (1 to 53)
    const weeks = Array.from({ length: 53 }, (_, i) => String(i + 1));

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

            {/* Switcher Tab */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
                        Report Period:
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                        {[
                            { id: "daily", label: "Daily" },
                            { id: "weekly", label: "Weekly" },
                            { id: "monthly", label: "Monthly" },
                            { id: "yearly", label: "Yearly" },
                        ].map((period) => (
                            <button
                                key={period.id}
                                onClick={() => {
                                    setReportPeriod(period.id as ReportPeriod);
                                    setCurrentPage(1);
                                    setExpandedRows({});
                                }}
                                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all border ${
                                    reportPeriod === period.id
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                        : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                                }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={loadReports}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50 self-start sm:self-auto"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 capitalize">
                        {reportPeriod} Accounts Reports
                    </h1>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-md animate-pulse">
                        Live Ledger
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                    View detailed sales, collections, cash flow, and account balances for the selected period.
                </p>
            </div>

            {/* Daily Filter Options card */}
            {reportPeriod === "daily" && (
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
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border ${
                                    filterType === type.id
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
                                        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Year</span>
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
            )}

            {/* Non-Daily Filter Options card */}
            {reportPeriod !== "daily" && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        {/* Year */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Year</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-28"
                            >
                                <option value="">All Years</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month (for weekly and monthly only) */}
                        {(reportPeriod === "weekly" || reportPeriod === "monthly") && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Month</span>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-32"
                                >
                                    <option value="">All Months</option>
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Week (weekly only) */}
                        {reportPeriod === "weekly" && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Week</span>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => {
                                        setSelectedWeek(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-28"
                                >
                                    <option value="">All Weeks</option>
                                    {weeks.map((w) => (
                                        <option key={w} value={w}>
                                            Week {w}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* From Date */}
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

                        {/* To Date */}
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

                        {/* Upto Today */}
                        <div className="flex items-center gap-1.5 mt-4">
                            <input
                                type="checkbox"
                                id="upto-today-check"
                                checked={uptoToday}
                                onChange={(e) => {
                                    setUptoToday(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                            />
                            <label htmlFor="upto-today-check" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                Upto Today
                            </label>
                        </div>

                        {/* Reset Button */}
                        {(selectedYear || selectedMonth || selectedWeek || fromDate || toDate || uptoToday) && (
                            <button
                                onClick={() => {
                                    setSelectedYear("");
                                    setSelectedMonth("");
                                    setSelectedWeek("");
                                    setFromDate("");
                                    setToDate("");
                                    setUptoToday(false);
                                    setCurrentPage(1);
                                }}
                                className="flex items-center justify-center gap-1 px-3 h-8 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 mt-4 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {isLoading ? (
                <div className="border border-slate-200 rounded-2xl bg-white p-12 flex flex-col items-center justify-center space-y-3 shadow-2xs">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Loading {reportPeriod} summary reports...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="border border-slate-200 rounded-2xl bg-white p-16 flex flex-col items-center justify-center text-center space-y-3.5 shadow-2xs">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-950">No Reports Found</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            There are no {reportPeriod} accounts summaries matching the selected filter criteria. Try adjusting your parameters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Render Reports as clean report cards */}
                    {reports.map((report) => {
                        const sum = report.summary;
                        const dateKey = sum.date;
                        const isExpanded = !!expandedRows[dateKey];
                        const netIsNeg = sum.net_amount < 0;

                        return (
                            <div key={dateKey} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-indigo-650 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 leading-tight">
                                                {reportPeriod === "daily" ? formatDateReadable(sum.date) : sum.date}
                                            </h3>
                                            {reportPeriod !== "daily" && (sum.from_date || sum.to_date) && (
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">
                                                    Period: {formatDateReadable(sum.from_date || "")} to {formatDateReadable(sum.to_date || "")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-bold text-slate-700">
                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-550" />
                                        <span>Total Orders: <strong>{sum.total_orders}</strong></span>
                                    </div>
                                </div>

                                {/* KPI cards Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {/* Sales */}
                                    <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-3 flex flex-col gap-0.5 shadow-2xs">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sales</span>
                                        <span className="text-xs md:text-sm font-black text-slate-800">{formatINR(sum.today_sales)}</span>
                                    </div>

                                    {/* Collection */}
                                    <div className="bg-emerald-50/45 border border-emerald-100 rounded-xl p-3 flex flex-col gap-0.5 shadow-2xs">
                                        <span className="text-[9px] font-bold text-emerald-650 uppercase tracking-wider">Collection</span>
                                        <span className="text-xs md:text-sm font-black text-emerald-600">{formatINR(sum.today_collection)}</span>
                                    </div>

                                    {/* Pending */}
                                    <div className="bg-amber-50/45 border border-amber-100 rounded-xl p-3 flex flex-col gap-0.5 shadow-2xs">
                                        <span className="text-[9px] font-bold text-amber-650 uppercase tracking-wider">Pending</span>
                                        <span className="text-xs md:text-sm font-black text-amber-600">{formatINR(sum.today_pending)}</span>
                                    </div>

                                    {/* Expenses */}
                                    <div className="bg-rose-50/45 border border-rose-100 rounded-xl p-3 flex flex-col gap-0.5 shadow-2xs">
                                        <span className="text-[9px] font-bold text-rose-650 uppercase tracking-wider">Expenses</span>
                                        <span className="text-xs md:text-sm font-black text-rose-600">{formatINR(sum.today_expenses)}</span>
                                    </div>

                                    {/* Net Amount */}
                                    <div className={`col-span-2 md:col-span-1 border rounded-xl p-3 flex flex-col gap-0.5 shadow-2xs ${
                                        netIsNeg 
                                            ? "bg-rose-50/60 border-rose-200 text-rose-700" 
                                            : "bg-indigo-50/40 border-indigo-200 text-indigo-750"
                                    }`}>
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Net Amount</span>
                                        <span className="text-xs md:text-sm font-black">{formatINR(sum.net_amount)}</span>
                                    </div>
                                </div>

                                {/* Account Breakdown Section */}
                                <div className="border border-slate-205 border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                    {/* Section Header */}
                                    <div 
                                        onClick={() => toggleRow(dateKey)}
                                        className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 transition select-none"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Landmark className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest">
                                                Account Breakdown
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {reportPeriod !== "daily" && (
                                                <span className="hidden sm:inline-block text-[9px] font-bold text-slate-450 uppercase">
                                                    Cumulative: Sales {formatINR(sum.total_sales)} | Coll {formatINR(sum.total_collection)} | Pending {formatINR(sum.total_pending)}
                                                </span>
                                            )}
                                            <span className="text-slate-400">
                                                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Breakdown Table */}
                                    {isExpanded && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                                                <thead className="bg-slate-50 text-slate-650 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-4 py-2.5 border-r border-slate-200">Account</th>
                                                        <th className="px-4 py-2.5 border-r border-slate-200 text-right">Collection</th>
                                                        <th className="px-4 py-2.5 border-r border-slate-200 text-right">Expense</th>
                                                        <th className="px-4 py-2.5 text-right">Current Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white">
                                                    {report.accounts_breakdown && report.accounts_breakdown.length > 0 ? (
                                                        report.accounts_breakdown.map((account) => {
                                                            const hashId = `${dateKey}-${account.account_id}`;
                                                            const balIsNeg = account.current_balance < 0;

                                                            return (
                                                                <tr key={hashId} className="hover:bg-slate-50/40 transition-colors">
                                                                    <td className="px-4 py-2.5 border-r border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                        {account.account_name}
                                                                    </td>
                                                                    <td className="px-4 py-2.5 border-r border-slate-200 text-right font-extrabold text-emerald-600">
                                                                        {formatINR(account.today_collection)}
                                                                    </td>
                                                                    <td className="px-4 py-2.5 border-r border-slate-200 text-right font-semibold text-slate-550">
                                                                        {formatINR(account.today_expense)}
                                                                    </td>
                                                                    <td className={`px-4 py-2.5 text-right font-bold ${
                                                                        balIsNeg ? "text-rose-600 bg-rose-50/5" : "text-slate-800"
                                                                    }`}>
                                                                        {formatINR(account.current_balance)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-4 text-center text-slate-400 text-xs">
                                                                No account breakdown data.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
                            <div>
                                Showing page <span className="font-bold text-slate-850">{currentPage}</span> of{" "}
                                <span className="font-bold text-slate-850">{totalPages}</span> —{" "}
                                <span className="font-bold text-slate-855">{totalCount}</span> total summaries
                            </div>
                            <div className="inline-flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className="p-1 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 select-none transition shadow-2xs cursor-pointer font-bold"
                                >
                                    <ChevronLeft size={14} className="inline mr-1" /> Prev
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="p-1 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 select-none transition shadow-2xs cursor-pointer font-bold"
                                >
                                    Next <ChevronRight size={14} className="inline ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

