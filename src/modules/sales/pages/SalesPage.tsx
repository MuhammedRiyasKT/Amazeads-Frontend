"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertCircle,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";
import {
  getSalesKpiCards,
  getSalesOrderStatusKpi,
  getSalesPaymentStatusKpi
} from "../services/salesKpi.service";
import {
  SalesKpiData,
  SalesOrderStatusData,
  SalesPaymentStatusData,
  SalesOverviewFilters
} from "../types";
import PieChart from "@/components/charts/PieChart";
import VerticalBarChart from "@/components/charts/VerticalBarChart";

type FilterType = "today" | "this-month" | "specific-date" | "custom-range" | "till-today";

interface FilterState {
  type: FilterType;
  date: string;
  month: string;
  year: string;
  from_date: string;
  to_date: string;
}

export default function SalesPage() {
  // Current system date: 2026-08-21
  const defaultToday = "2026-08-21";
  const defaultMonth = "08";
  const defaultYear = "2026";
  const defaultFromDate = "2026-08-01";
  const defaultToDate = "2026-08-21";

  const [filter, setFilter] = useState<FilterState>({
    type: "today",
    date: defaultToday,
    month: defaultMonth,
    year: defaultYear,
    from_date: defaultFromDate,
    to_date: defaultToDate
  });

  // Data states
  const [kpiData, setKpiData] = useState<SalesKpiData | null>(null);
  const [orderStatusData, setOrderStatusData] = useState<SalesOrderStatusData | null>(null);
  const [paymentStatusData, setPaymentStatusData] = useState<SalesPaymentStatusData | null>(null);

  // Loading states
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(false);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);

  // Error states
  const [errorKpi, setErrorKpi] = useState<string | null>(null);
  const [errorOrderStatus, setErrorOrderStatus] = useState<string | null>(null);
  const [errorPaymentStatus, setErrorPaymentStatus] = useState<string | null>(null);

  // Translate filter state to API parameters
  const getQueryParams = (f: FilterState): SalesOverviewFilters => {
    const params: SalesOverviewFilters = {};
    switch (f.type) {
      case "today":
        params.date = f.date;
        break;
      case "this-month":
        params.month = f.month;
        params.year = f.year;
        break;
      case "specific-date":
        params.date = f.date;
        break;
      case "custom-range":
        params.from_date = f.from_date;
        params.to_date = f.to_date;
        break;
      case "till-today":
        params.upto_today = true;
        break;
    }
    return params;
  };

  // Format label for active date range description below the filter controls
  const getActiveDateRangeLabel = () => {
    const formatLabel = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };

    switch (filter.type) {
      case "today":
        return formatLabel(filter.date);
      case "specific-date":
        return formatLabel(filter.date);
      case "this-month":
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const mIndex = parseInt(filter.month, 10) - 1;
        return `${monthNames[mIndex] || filter.month} ${filter.year}`;
      case "custom-range":
        return `${formatLabel(filter.from_date)} - ${formatLabel(filter.to_date)}`;
      case "till-today":
        return `Upto Today (${formatLabel(defaultToday)})`;
      default:
        return "";
    }
  };

  // Fetch API handlers
  const fetchKpis = async (f: FilterState) => {
    setLoadingKpi(true);
    setErrorKpi(null);
    try {
      const params = getQueryParams(f);
      const res = await getSalesKpiCards(params);
      if (res && res.success) {
        setKpiData(res.data);
      } else {
        setErrorKpi(res.message || "Failed to load KPI card data");
      }
    } catch (err: any) {
      console.error("Error fetching KPI cards:", err);
      setErrorKpi(err.response?.data?.message || err.message || "Unable to reach KPI Endpoint");
    } finally {
      setLoadingKpi(false);
    }
  };

  const fetchOrderStatus = async (f: FilterState) => {
    setLoadingOrderStatus(true);
    setErrorOrderStatus(null);
    try {
      const params = getQueryParams(f);
      const res = await getSalesOrderStatusKpi(params);
      if (res && res.success) {
        setOrderStatusData(res.data);
      } else {
        setErrorOrderStatus(res.message || "Failed to load order status counts");
      }
    } catch (err: any) {
      console.error("Error fetching order status:", err);
      setErrorOrderStatus(err.response?.data?.message || err.message || "Unable to reach Order Status Endpoint");
    } finally {
      setLoadingOrderStatus(false);
    }
  };

  const fetchPaymentStatus = async (f: FilterState) => {
    setLoadingPaymentStatus(true);
    setErrorPaymentStatus(null);
    try {
      const params = getQueryParams(f);
      const res = await getSalesPaymentStatusKpi(params);
      if (res && res.success) {
        setPaymentStatusData(res.data);
      } else {
        setErrorPaymentStatus(res.message || "Failed to load payment distribution counts");
      }
    } catch (err: any) {
      console.error("Error fetching payment status:", err);
      setErrorPaymentStatus(err.response?.data?.message || err.message || "Unable to reach Payment Status Endpoint");
    } finally {
      setLoadingPaymentStatus(false);
    }
  };

  const fetchAll = (f: FilterState) => {
    fetchKpis(f);
    fetchOrderStatus(f);
    fetchPaymentStatus(f);
  };

  // Run initial fetch and fetch on state changes
  useEffect(() => {
    fetchAll(filter);
  }, [filter.type, filter.date, filter.month, filter.year, filter.from_date, filter.to_date]);

  // Manual dashboard refresh
  const handleRefresh = () => {
    fetchAll(filter);
  };

  // Indian Rupee (INR) Formatter
  const formatINR = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const isRefreshing = loadingKpi || loadingOrderStatus || loadingPaymentStatus;

  // Compute metrics
  const totalOrders = kpiData?.total_orders || 0;
  const totalSales = kpiData?.total_sales_amount || 0;
  const cashCollected = kpiData?.total_cash_collection || 0;
  const pendingCollection = kpiData?.total_cash_pending || 0;
  const averageOrderVal = totalOrders > 0 ? totalSales / totalOrders : 0;

  const collectedPct = totalSales > 0 ? getPercentage(cashCollected, totalSales) : 0;
  const pendingPct = totalSales > 0 ? getPercentage(pendingCollection, totalSales) : 0;

  function getPercentage(value: number, total: number) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  // Segment values for charts
  const salesCollectionChartData = [
    { name: "Collected", value: cashCollected, color: "#10b981" },
    { name: "Pending", value: pendingCollection, color: "#f59e0b" }
  ];

  // Map Order Status values safely
  const orderToCloseVal = orderStatusData
    ? (orderStatusData.orders_to_close !== undefined ? orderStatusData.orders_to_close : orderStatusData.order_to_close || 0)
    : 0;

  const quotationsVal = orderStatusData?.quotations || 0;
  const newOrdersVal = orderStatusData?.new_orders || 0;
  const ongoingOrdersVal = orderStatusData?.ongoing_orders || 0;
  const closedOrdersVal = orderStatusData
    ? (orderStatusData.closed_orders !== undefined ? orderStatusData.closed_orders : orderStatusData.closed || 0)
    : 0;
  const cancelledOrdersVal = orderStatusData
    ? (orderStatusData.cancelled_orders !== undefined ? orderStatusData.cancelled_orders : orderStatusData.cancelled || 0)
    : 0;

  const orderStatusVerticalChartData = [
    { name: "Quotations", value: quotationsVal, color: "#6366f1" },
    { name: "New Orders", value: newOrdersVal, color: "#3b82f6" },
    { name: "Ongoing", value: ongoingOrdersVal, color: "#06b6d4" },
    { name: "To Close", value: orderToCloseVal, color: "#f59e0b" },
    { name: "Closed", value: closedOrdersVal, color: "#10b981" },
    { name: "Cancelled", value: cancelledOrdersVal, color: "#ef4444" }
  ];

  // Map Payment status counts safely
  const paidOrders = paymentStatusData?.paid_orders || paymentStatusData?.paid || 0;
  const partialOrders = paymentStatusData?.partial_orders || paymentStatusData?.partial || 0;
  const balancePendingOrders = paymentStatusData?.balance_pending_orders || 0;
  const notPaidOrders = paymentStatusData?.not_paid_orders || paymentStatusData?.not_paid || 0;

  const paymentStatusChartData = [
    { name: "Paid", value: paidOrders, color: "#10b981" },
    { name: "Partial", value: partialOrders, color: "#3b82f6" },
    { name: "Balance Pending", value: balancePendingOrders, color: "#f59e0b" },
    { name: "Not Paid", value: notPaidOrders, color: "#ef4444" }
  ];

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4.5 w-full max-w-full overflow-x-hidden box-border bg-slate-50/50 min-h-screen">
      {/* 1. Page Header Block */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Sales Overview</h1>
          <p className="text-xs font-semibold text-slate-450 mt-0.5">
            Monitor sales performance, order status and payment collection
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-indigo-650 bg-indigo-50/60 w-fit px-2.5 py-0.5 rounded-md border border-indigo-100/50">
            <Calendar size={12} className="shrink-0" />
            <span>Active Range: {getActiveDateRangeLabel()}</span>
          </div>
        </div>

        {/* Date Filter & Action row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
              Filter By Range
            </span>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as FilterType }))}
              className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 select-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="this-month">This Month</option>
              <option value="specific-date">Specific Date</option>
              <option value="custom-range">Custom Date Range</option>
              <option value="till-today">Till Today</option>
            </select>
          </div>

          {/* Conditional inputs based on selector */}
          {filter.type === "specific-date" && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                Select Date
              </span>
              <input
                type="date"
                value={filter.date}
                max={defaultToday}
                onChange={(e) => setFilter(prev => ({ ...prev, date: e.target.value }))}
                className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 cursor-pointer"
              />
            </div>
          )}

          {filter.type === "this-month" && (
            <>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Month
                </span>
                <select
                  value={filter.month}
                  onChange={(e) => setFilter(prev => ({ ...prev, month: e.target.value }))}
                  className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 cursor-pointer"
                >
                  <option value="01">Jan</option>
                  <option value="02">Feb</option>
                  <option value="03">Mar</option>
                  <option value="04">Apr</option>
                  <option value="05">May</option>
                  <option value="06">Jun</option>
                  <option value="07">Jul</option>
                  <option value="08">Aug</option>
                  <option value="09">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Year
                </span>
                <select
                  value={filter.year}
                  onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
                  className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </>
          )}

          {filter.type === "custom-range" && (
            <>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Start Date
                </span>
                <input
                  type="date"
                  value={filter.from_date}
                  max={filter.to_date || defaultToday}
                  onChange={(e) => setFilter(prev => ({ ...prev, from_date: e.target.value }))}
                  className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                  End Date
                </span>
                <input
                  type="date"
                  value={filter.to_date}
                  min={filter.from_date}
                  max={defaultToday}
                  onChange={(e) => setFilter(prev => ({ ...prev, to_date: e.target.value }))}
                  className="h-8.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 focus:outline-none focus:border-indigo-550 cursor-pointer"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1 self-end">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Layout view */}
      {errorKpi ? (
        /* Overall dashboard error fallback */
        <div className="bg-white border border-rose-100 rounded-2xl p-10 py-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm max-w-xl mx-auto w-full">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-800">Unable to load Dashboard Overview</h3>
            <p className="text-xs font-semibold text-slate-450 leading-relaxed">
              {errorKpi}. Please ensure the ERP server is running and check your connection.
            </p>
          </div>
          <button
            onClick={() => fetchKpis(filter)}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-650 transition-all hover:bg-indigo-105 inline-flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={12} />
            Retry Main KPI Fetch
          </button>
        </div>
      ) : (
        <div className="space-y-4.5">
          {/* 3. Primary KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {loadingKpi ? (
              // KPI Skeletions
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center animate-pulse"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-2.5 bg-slate-100 rounded-md w-2/3" />
                    <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded-md w-3/4" />
                  </div>
                  <div className="h-8 w-8 bg-slate-50 rounded-lg shrink-0" />
                </div>
              ))
            ) : (
              <>
                {/* Orders Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      Total Orders
                    </span>
                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                      {totalOrders}
                    </h2>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block">
                      Confirmed & Completed
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/50">
                    <ShoppingCart size={16} />
                  </div>
                </div>

                {/* Sales Sales value Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      Total Sales
                    </span>
                    <h2 className="text-lg font-black text-slate-800 leading-tight truncate">
                      {formatINR(totalSales)}
                    </h2>
                    <span className="text-[9.5px] font-bold text-indigo-650 mt-0.5 block bg-indigo-50/50 border border-indigo-100/40 rounded px-1.5 py-0.5 w-[fit-content]">
                      Aggregated Value
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-blue-50 text-blue-655 rounded-lg flex items-center justify-center shrink-0 border border-blue-100/55">
                    <DollarSign size={16} />
                  </div>
                </div>

                {/* Cash Collected Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      Cash Collected
                    </span>
                    <h2 className="text-lg font-black text-emerald-600 leading-tight truncate">
                      {formatINR(cashCollected)}
                    </h2>
                    <span className="text-[9.5px] font-bold text-emerald-600 mt-0.5 block bg-emerald-50/50 border border-emerald-100/40 rounded px-1.5 py-0.5 w-[fit-content]">
                      {collectedPct.toFixed(1)}% Recovery
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 border border-emerald-105/50">
                    <Wallet size={16} />
                  </div>
                </div>

                {/* Pending Amount Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      Pending Amount
                    </span>
                    <h2 className="text-lg font-black text-amber-600 leading-tight truncate">
                      {formatINR(pendingCollection)}
                    </h2>
                    <span className="text-[9.5px] font-bold text-amber-655 mt-0.5 block bg-amber-50/50 border border-amber-100/40 rounded px-1.5 py-0.5 w-[fit-content]">
                      {pendingPct.toFixed(1)}% Outstanding
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-amber-50/60 text-amber-600 rounded-lg flex items-center justify-center shrink-0 border border-amber-101/50">
                    <AlertCircle size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4. Chart Visualization Row 1 (Sales Collection & Order Status) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
            {/* Sales Collection Donut Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[230px]">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Sales Collection
                </h3>
                <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                  Proportion of cash collected vs outstanding balance
                </p>
              </div>

              {loadingKpi ? (
                <div className="flex flex-col items-center justify-center flex-1 py-4 animate-pulse">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <div className="h-12 w-12 bg-white rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-1 py-1">
                  <div className="w-1/2 flex justify-center shrink-0">
                    <PieChart
                      data={salesCollectionChartData}
                      totalLabel="Total Sales"
                      centerValue={formatINR(totalSales)}
                      emptyMessage="No sales amount recorded"
                      size={155}
                      minHeight="min-h-0"
                    />
                  </div>

                  <div className="w-full sm:w-1/2 space-y-2.5">
                    <div className="border-b border-dashed border-slate-100 pb-1.5 max-w-[160px]">
                      <span className="text-[9px] font-bold text-slate-450">Aggregate Sales</span>
                      <h4 className="text-xs font-black text-slate-800 mt-0.5">
                        {formatINR(totalSales)}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between max-w-[170px]">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-650">Collected</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-black text-slate-800 block">
                            {formatINR(cashCollected)}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600">
                            {collectedPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between max-w-[170px]">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-650">Pending</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-black text-slate-800 block">
                            {formatINR(pendingCollection)}
                          </span>
                          <span className="text-[9px] font-bold text-amber-600">
                            {pendingPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Status Vertical Bar Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[230px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Order Status
                  </h3>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                    Count of transactions across order workflow pipelines
                  </p>
                </div>
                {orderStatusData && (
                  <span className="text-[9px] font-black text-indigo-655 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                    {orderStatusData.total_orders} Total
                  </span>
                )}
              </div>

              {loadingOrderStatus ? (
                <div className="flex-1 flex items-end justify-between gap-3 px-4 py-4 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-full">
                      <div className="h-20 bg-slate-105 rounded-t-md w-4" />
                      <div className="h-1.5 bg-slate-105 rounded-md w-8" />
                    </div>
                  ))}
                </div>
              ) : errorOrderStatus ? (
                /* Inline localized error */
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                  <div className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{errorOrderStatus}</p>
                  <button
                    onClick={() => fetchOrderStatus(filter)}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 text-[9px] font-bold text-slate-700 rounded transition-all cursor-pointer"
                  >
                    Retry Load
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center w-full mt-2">
                  <VerticalBarChart
                    data={orderStatusVerticalChartData}
                    emptyMessage="No transaction status found for active range"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 5. Chart Visualization Row 2 (Payment Status & Sales Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
            {/* Payment Status Donut Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[230px]">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Payment Status
                </h3>
                <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                  Breakdown by volume of order collections
                </p>
              </div>

              {loadingPaymentStatus ? (
                <div className="flex flex-col items-center justify-center flex-1 py-4 animate-pulse">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <div className="h-12 w-12 bg-white rounded-full" />
                  </div>
                </div>
              ) : errorPaymentStatus ? (
                /* Inline localized error */
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                  <div className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{errorPaymentStatus}</p>
                  <button
                    onClick={() => fetchPaymentStatus(filter)}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 text-[9px] font-bold text-slate-705 rounded transition-all cursor-pointer"
                  >
                    Retry Load
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-1 py-1">
                  <div className="w-1/2 flex justify-center shrink-0">
                    <PieChart
                      data={paymentStatusChartData}
                      totalLabel="Total Orders"
                      centerValue={String(paymentStatusData?.total_orders || 0)}
                      emptyMessage="No payment entries logged"
                      size={155}
                      minHeight="min-h-0"
                    />
                  </div>

                  <div className="w-full sm:w-1/2 space-y-2">
                    {[
                      { name: "Paid", count: paidOrders, color: "bg-emerald-500" },
                      { name: "Partial", count: partialOrders, color: "bg-blue-500" },
                      { name: "Balance Pending", count: balancePendingOrders, color: "bg-amber-500" },
                      { name: "Not Paid", count: notPaidOrders, color: "bg-rose-500" }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-slate-100/50 pb-1.5 last:border-0 last:pb-0 max-w-[170px]">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                          <span className="text-[11px] font-bold text-slate-650">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-800">{item.count} Orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sales Summary Compact metrics panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[230px]">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Sales Summary
                </h3>
                <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                  Core metric breakdown table for executive review
                </p>
              </div>

              {loadingKpi ? (
                <div className="flex-1 flex flex-col justify-center gap-2 py-4 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center py-1.5 mt-2">
                  <div className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-150 font-bold text-slate-650">
                        <tr className="hover:bg-slate-50/50 select-none">
                          <td className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                            <ShoppingCart size={13} className="text-slate-400" />
                            Total Orders Count
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-slate-800 text-[11px]">
                            {totalOrders}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 select-none">
                          <td className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                            <DollarSign size={13} className="text-slate-400" />
                            Sum of Invoiced Sales
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-slate-850 text-[11px]">
                            {formatINR(totalSales)}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 select-none">
                          <td className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                            <Wallet size={13} className="text-slate-400" />
                            Cash Collection Received
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-emerald-600 text-[11px]">
                            {formatINR(cashCollected)}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 select-none">
                          <td className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                            <AlertCircle size={13} className="text-slate-400" />
                            Pending Accounts Receivable
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-amber-600 text-[11px]">
                            {formatINR(pendingCollection)}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 select-none">
                          <td className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                            <TrendingUp size={13} className="text-slate-400" />
                            Average Transaction Value
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-indigo-650 text-[11px]">
                            {formatINR(averageOrderVal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Sales Trend Section */}
          {/* <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Sales Trend Line
            </h3>
            <div className="mt-2.5 p-3.5 text-center flex items-center justify-center gap-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              <div className="h-7 w-7 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                <Info size={14} />
              </div>
              <p className="text-[10.5px] font-semibold text-slate-500 text-left leading-snug">
                <span className="font-bold text-slate-700 block mb-0.5">Time-series data will appear here when Trend API is available.</span>
                Daily sales trend analytics will automatically populate once the Trend API service is activated.
              </p>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}