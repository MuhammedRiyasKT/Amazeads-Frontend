"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Info,
  XCircle,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Palette,
  Eye,
  Edit2,
  MessageCircle,
  Search
} from "lucide-react";
import {
  getSalesKpiCards,
  getSalesOrderStatusKpi,
  getSalesPaymentStatusKpi
} from "../services/salesKpi.service";
import { getOrdersList } from "../services/order.service";
import { getPendingDesignApprovalsCount } from "../services/designApproval.service";
import ViewOrderModal from "../components/ViewOrderModal";
import UpdatePaymentModal from "../components/UpdatePaymentModal";
import {
  SalesKpiData,
  SalesOrderStatusData,
  SalesPaymentStatusData,
  SalesOverviewFilters
} from "../types";
import { useSalesStore } from "@/store/salesStore";
import PieChart from "@/components/charts/PieChart";
import VerticalBarChart from "@/components/charts/VerticalBarChart";

export default function SalesPage() {
  const router = useRouter();
  const { selectedCategory } = useSalesStore();

  // Dynamic current date helpers (local timezone-safe)
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const currentMonth = pad(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  const allMonths = [
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

  // ── Filters: defaults to Today (date filter) ──
  const [filterType, setFilterType] = useState<"date" | "month">("date");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const activeFilterLabel = (() => {
    if (filterType === "date") {
      if (selectedDate === todayStr) {
        return `Today (${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`;
      }
      try {
        const d = new Date(selectedDate);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } catch {
        return selectedDate;
      }
    } else {
      const found = allMonths.find((m) => m.value === selectedMonth);
      return `${found?.label || selectedMonth} ${currentYear}`;
    }
  })();

  // ── Main charts/KPI cards ──
  const [kpiData, setKpiData] = useState<SalesKpiData | null>(null);
  const [orderStatusData, setOrderStatusData] = useState<SalesOrderStatusData | null>(null);
  const [paymentStatusData, setPaymentStatusData] = useState<SalesPaymentStatusData | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(false);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);
  const [errorKpi, setErrorKpi] = useState<string | null>(null);
  const [errorOrderStatus, setErrorOrderStatus] = useState<string | null>(null);
  const [errorPaymentStatus, setErrorPaymentStatus] = useState<string | null>(null);

  // ── Priority Action Strip Counters ──
  const [dispatchTodayCount, setDispatchTodayCount] = useState<number>(0);
  const [designApprovalCount, setDesignApprovalCount] = useState<number>(0);


  // ── Modal States ──
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editPaymentOrderId, setEditPaymentOrderId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // ── Action Watchlist: Overdue Deliveries & Top High-Value Dues ──
  const [watchlistTab, setWatchlistTab] = useState<"urgent" | "topDues">("urgent");
  const [urgentOrders, setUrgentOrders] = useState<any[]>([]);
  const [topDueOrders, setTopDueOrders] = useState<any[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState<boolean>(false);

  const uptoTodayParams: SalesOverviewFilters = { upto_today: true };

  const fetchKpis = async () => {
    setLoadingKpi(true);
    setErrorKpi(null);
    try {
      const params: SalesOverviewFilters =
        filterType === "month" && selectedMonth
          ? { month: selectedMonth, year: currentYear }
          : { date: selectedDate || todayStr };
      const res = await getSalesKpiCards(params);
      if (res?.success) setKpiData(res.data);
      else setErrorKpi(res.message || "Failed to load KPI data");
    } catch (err: any) {
      setErrorKpi(err.response?.data?.message || err.message || "Unable to reach KPI Endpoint");
    } finally {
      setLoadingKpi(false);
    }
  };

  const fetchOrderStatus = async () => {
    setLoadingOrderStatus(true);
    setErrorOrderStatus(null);
    try {
      const res = await getSalesOrderStatusKpi(uptoTodayParams);
      if (res?.success) setOrderStatusData(res.data);
      else setErrorOrderStatus(res.message || "Failed to load order status");
    } catch (err: any) {
      setErrorOrderStatus(err.response?.data?.message || err.message || "Unable to reach Order Status Endpoint");
    } finally {
      setLoadingOrderStatus(false);
    }
  };

  const fetchPaymentStatus = async () => {
    setLoadingPaymentStatus(true);
    setErrorPaymentStatus(null);
    try {
      const res = await getSalesPaymentStatusKpi(uptoTodayParams);
      if (res?.success) setPaymentStatusData(res.data);
      else setErrorPaymentStatus(res.message || "Failed to load payment status");
    } catch (err: any) {
      setErrorPaymentStatus(err.response?.data?.message || err.message || "Unable to reach Payment Status Endpoint");
    } finally {
      setLoadingPaymentStatus(false);
    }
  };

  const fetchWatchlist = async () => {
    setLoadingWatchlist(true);
    try {
      const todayTime = new Date(`${todayStr}T00:00:00`).getTime();

      // 1. Fetch Overdue & Urgent (Active orders: Ongoing & Confirmed)
      const [resOngoing, resConfirmed, resPartial, resPending] = await Promise.allSettled([
        getOrdersList({ page: 1, page_size: 25, is_quotation: false, order_status: "Ongoing", category_id: selectedCategory?.id }),
        getOrdersList({ page: 1, page_size: 25, is_quotation: false, order_status: "Confirmed", category_id: selectedCategory?.id }),
        getOrdersList({ page: 1, page_size: 20, is_quotation: false, payment_status: "Partial", category_id: selectedCategory?.id }),
        getOrdersList({ page: 1, page_size: 20, is_quotation: false, payment_status: "Pending", category_id: selectedCategory?.id }),
      ]);

      const activeOrders = [
        ...(resOngoing.status === "fulfilled" ? resOngoing.value?.items || [] : []),
        ...(resConfirmed.status === "fulfilled" ? resConfirmed.value?.items || [] : [])
      ];

      const uniqueActive = Array.from(new Map(activeOrders.map((item: any) => [item.id, item])).values());

      const urgentList = uniqueActive
        .filter((order: any) => order.completion_date || order.commit_date)
        .map((order: any) => {
          const dateToUse = order.completion_date || order.commit_date;
          const targetTime = new Date(`${dateToUse}T00:00:00`).getTime();
          const diffDays = Math.round((targetTime - todayTime) / (1000 * 60 * 60 * 24));
          return { ...order, diffDays, displayDate: dateToUse };
        })
        .sort((a: any, b: any) => a.diffDays - b.diffDays);

      setUrgentOrders(urgentList.slice(0, 6));

      // 2. Fetch Top Dues (Highest pending balance)
      const dueOrders = [
        ...(resPartial.status === "fulfilled" ? resPartial.value?.items || [] : []),
        ...(resPending.status === "fulfilled" ? resPending.value?.items || [] : [])
      ];

      const uniqueDues = Array.from(new Map(dueOrders.map((item: any) => [item.id, item])).values());
      const sortedDues = uniqueDues
        .filter((item: any) => (item.balance_amount || 0) > 0)
        .sort((a: any, b: any) => (b.balance_amount || 0) - (a.balance_amount || 0));

      setTopDueOrders(sortedDues.slice(0, 6));
    } catch (err) {
      console.error("Error loading watchlist data:", err);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const fetchDispatchToday = async () => {
    try {
      const res = await getOrdersList({
        completion_date: todayStr,
        is_quotation: false,
        category_id: selectedCategory?.id,
        page: 1,
        page_size: 1
      });
      setDispatchTodayCount(res?.pagination?.total_count ?? (res?.items || []).length ?? 0);
    } catch {
      setDispatchTodayCount(0);
    }
  };

  const fetchDesignApprovalCount = async () => {
    try {
      const res = await getPendingDesignApprovalsCount(selectedCategory?.id);
      const count = typeof res === "number" ? res : res?.count ?? res?.data?.count ?? res?.pending_count ?? 0;
      setDesignApprovalCount(count);
    } catch {
      setDesignApprovalCount(0);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [filterType, selectedDate, selectedMonth, selectedCategory]);

  useEffect(() => {
    fetchOrderStatus();
    fetchPaymentStatus();
  }, [selectedCategory]);

  useEffect(() => {
    fetchWatchlist();
  }, [selectedCategory]);

  useEffect(() => {
    fetchDispatchToday();
    fetchDesignApprovalCount();
  }, [selectedCategory]);

  const handleRefresh = () => {
    fetchKpis();
    fetchOrderStatus();
    fetchPaymentStatus();
    fetchWatchlist();
    fetchDispatchToday();
    fetchDesignApprovalCount();
  };

  // WhatsApp Follow-up click handler
  const handleWhatsAppFollowUp = (order: any) => {
    const rawNumber = order.customer_whatsapp_number || order.customer_mobile_number || "";
    const cleanNumber = rawNumber.replace(/\D/g, "");
    if (!cleanNumber) {
      alert("No WhatsApp or mobile number available for this customer.");
      return;
    }
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const dueAmt = order.balance_amount || 0;
    const orderNo = order.order_number ? `#${order.order_number}` : `#${order.id}`;
    const message = encodeURIComponent(
      `Hello ${order.customer_name}, greetings from Amaze Ads! Regarding your Order ${orderNo}${
        dueAmt > 0 ? `, there is an outstanding balance of ₹${dueAmt.toLocaleString("en-IN")}` : ""
      }. Please let us know if you need any assistance.`
    );
    window.open(`https://wa.me/${finalNumber}?text=${message}`, "_blank");
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
  const totalOrders = kpiData?.orders || 0;
  const totalSales = kpiData?.sales_amount || 0;
  const cashCollected = kpiData?.cash_collection || 0;
  const pendingCollection = kpiData?.orders_pending || 0;
  const cancelledOrders = kpiData?.orders_cancelled ?? kpiData?.total_orders_cancelled ?? 0;
  const cancelledAmount = kpiData?.cancelled_orders_amount ?? kpiData?.total_cancelled_orders_amount ?? 0;

  // Cumulative / Total metrics
  const totalpendingCollection = kpiData?.total_cash_pending || kpiData?.total_pending_balance || 0;
  const totalSalesAll = kpiData?.total_sales_amount || kpiData?.total_sales_value || kpiData?.sales_amount || 0;
  const totalCashAll = kpiData?.total_cash_collection || kpiData?.cash_collection || 0;

  function getPercentage(value: number, total: number) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  const collectedPct = totalSales > 0 ? getPercentage(cashCollected, totalSales) : 0;
  const pendingPct = totalSales > 0 ? getPercentage(pendingCollection, totalSales) : 0;

  // Graph values for Sales Collection section
  const maxSalesVal = Math.max(totalSalesAll, totalCashAll, totalpendingCollection, 1);
  const salesBarWidth = totalSalesAll > 0 ? Math.min(100, Math.max(8, Math.round((totalSalesAll / maxSalesVal) * 100))) : 0;
  const cashBarWidth = totalSalesAll > 0 ? Math.min(100, Math.max(8, Math.round((totalCashAll / maxSalesVal) * 100))) : 0;
  const pendingBarWidth = totalSalesAll > 0 ? Math.min(100, Math.max(8, Math.round((totalpendingCollection / maxSalesVal) * 100))) : 0;

  // Map Order Status values safely (Excluding Closed and Cancelled)
  const orderToCloseVal = orderStatusData
    ? (orderStatusData.orders_to_close !== undefined ? orderStatusData.orders_to_close : orderStatusData.order_to_close || 0)
    : 0;

  const quotationsVal = orderStatusData?.quotations || 0;
  const newOrdersVal = orderStatusData?.new_orders || 0;
  const ongoingOrdersVal = orderStatusData?.ongoing_orders || 0;

  const activeOrdersTotal = quotationsVal + newOrdersVal + ongoingOrdersVal + orderToCloseVal;

  const orderStatusVerticalChartData = [
    { name: "Quotations", value: quotationsVal, color: "#6366f1" },
    { name: "New Orders", value: newOrdersVal, color: "#3b82f6" },
    { name: "Ongoing", value: ongoingOrdersVal, color: "#06b6d4" },
    { name: "To Close", value: orderToCloseVal, color: "#f59e0b" }
  ];

  const handleOrderStatusBarClick = (item: { name: string; value?: number }) => {
    const statusMap: Record<string, string> = {
      Quotations: "quotations",
      "New Orders": "new_orders",
      Ongoing: "ongoing",
      "To Close": "to_close"
    };
    const key = statusMap[item.name];
    if (key) {
      router.push(`/sales/order-status?status=${key}`);
    }
  };

  // Map Payment status counts safely
  const paidOrders = paymentStatusData?.paid_orders || paymentStatusData?.paid || 0;
  const partialOrders = paymentStatusData?.partial_orders || paymentStatusData?.partial || 0;
  const notPaidOrders = paymentStatusData?.not_paid_orders || paymentStatusData?.not_paid || 0;

  const paymentStatusChartData = [
    { name: "Paid", value: paidOrders, color: "#10b981" },
    { name: "Partial", value: partialOrders, color: "#3b82f6" },
    { name: "Not Paid", value: notPaidOrders, color: "#ef4444" }
  ];

  const getPaymentBadgeClass = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
    }
    if (s === "partial") {
      return "bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
    }
    return "bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
  };

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4.5 w-full max-w-full overflow-x-hidden box-border bg-slate-50/50 min-h-screen">
      
      {/* ─── 1. Header & Quick Actions Bar ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Sales Overview</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {filterType === "date"
              ? selectedDate === todayStr
                ? "Today's performance — order status, collections & daily priorities"
                : `Daily performance for ${activeFilterLabel}`
              : `Monthly performance for ${activeFilterLabel}`}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-indigo-700 bg-indigo-50/70 w-fit px-2.5 py-0.5 rounded-md border border-indigo-100">
            <Calendar size={12} className="shrink-0" />
            <span>Showing: {activeFilterLabel}</span>
          </div>
        </div>

        {/* Actions, Filters & Refresh Button */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
          {/* + New Sales Order CTA */}
          <button
            onClick={() => router.push("/sales/orders/create")}
            className="h-8.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Create New Sales Order"
          >
            <Plus size={14} />
            <span>New Order</span>
          </button>

          {/* + Create Quotation CTA */}
          <button
            onClick={() => router.push("/sales/create-quotation")}
            className="h-8.5 px-3 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-3xs cursor-pointer"
            title="Create New Quotation"
          >
            <FileText size={13} />
            <span>New Quote</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Day / Previous Days Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8.5 shadow-3xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Day:</span>
            <input
              type="date"
              value={filterType === "date" ? selectedDate : ""}
              max={todayStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setFilterType("date");
                  setSelectedMonth("");
                }
              }}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              title="Filter by Today or Previous Days"
            />
          </div>

          {/* Month Filter (Current Year) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8.5 shadow-3xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Month:</span>
            <select
              value={filterType === "month" ? selectedMonth : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value);
                  setFilterType("month");
                }
              }}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-1"
              title="Filter by Month of Current Year"
            >
              <option value="" disabled={filterType === "month"}>Select Month ({currentYear})</option>
              {allMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} {currentYear}
                </option>
              ))}
            </select>
          </div>

          {/* Quick 'Today' button when non-today is active */}
          {(filterType !== "date" || selectedDate !== todayStr) && (
            <button
              onClick={() => {
                setFilterType("date");
                setSelectedDate(todayStr);
                setSelectedMonth("");
              }}
              className="h-8.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
              title="Reset to Today"
            >
              Today
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8.5 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ─── 2. Priority Action Required Strip (4 Alert Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Quotations to Follow-up */}
        <div
          onClick={() => router.push("/sales/order-status?status=quotations")}
          className="bg-white border border-amber-200 hover:border-amber-400 rounded-xl p-3 shadow-3xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-amber-700">{quotationsVal}</span>
              <span className="text-xs font-bold text-slate-800">Quotations</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">
              Awaiting customer confirmation
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-100">
            <FileText size={16} />
          </div>
        </div>

        {/* Card 2: Dispatch Today */}
        <div
          onClick={() => router.push("/sales/order-dispatch")}
          className="bg-white border border-rose-200 hover:border-rose-400 rounded-xl p-3 shadow-3xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-rose-600">{dispatchTodayCount}</span>
              <span className="text-xs font-bold text-slate-800">Dispatch Today</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">
              Orders to dispatch / deliver today
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-rose-100">
            <Clock size={16} />
          </div>
        </div>

        {/* Card 3: Orders Ready to Close */}
        <div
          onClick={() => router.push("/sales/orders-to-close")}
          className="bg-white border border-emerald-200 hover:border-emerald-400 rounded-xl p-3 shadow-3xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-emerald-700">{orderToCloseVal}</span>
              <span className="text-xs font-bold text-slate-800">Ready to Close</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">
              Delivered, ready for final sign-off
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
            <CheckCircle size={16} />
          </div>
        </div>

        {/* Card 4: Design Proofs Waiting */}
        <div
          onClick={() => router.push("/sales/design-approval")}
          className="bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl p-3 shadow-3xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-indigo-700">{designApprovalCount}</span>
              <span className="text-xs font-bold text-slate-800">Design Proofs</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">
              Customer approval required
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-indigo-100">
            <Palette size={16} />
          </div>
        </div>
      </div>

      {/* ─── 3. Main Dashboard Layout view ─── */}
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
            onClick={() => fetchKpis()}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-650 transition-all hover:bg-indigo-105 inline-flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={12} />
            Retry Main KPI Fetch
          </button>
        </div>
      ) : (
        <div className="space-y-4.5">
          {/* Primary KPI Cards Grid (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {loadingKpi ? (
              Array.from({ length: 5 }).map((_, index) => (
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
                      Confirmed Orders
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/50">
                    <ShoppingCart size={16} />
                  </div>
                </div>

                {/* Sales value Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      Sales Value
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
                      Cash Collection
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

                {/* Cancelled Orders Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                      CANCELLED
                    </span>
                    <h2 className="text-lg font-black text-slate-800 leading-tight truncate">
                      {cancelledOrders} ({formatINR(cancelledAmount)})
                    </h2>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block">
                      Cancelled orders & value
                    </span>
                  </div>
                  <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0 border border-purple-100/50">
                    <XCircle size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ─── 4. Visualizations Row 1 (Order Pipeline & Sales Collection) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
            {/* Order Status Funnel Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[250px]">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Order Status Pipeline
                  </h3>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                    Live transactions across order conversion & production stages
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 select-none">
                    Up Today
                  </span>
                  {orderStatusData && (
                    <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                      {activeOrdersTotal} Total
                    </span>
                  )}
                </div>
              </div>

              {loadingOrderStatus ? (
                <div className="flex-1 flex items-end justify-between gap-3 px-4 py-4 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-full">
                      <div className="h-20 bg-slate-105 rounded-t-md w-4" />
                      <div className="h-1.5 bg-slate-105 rounded-md w-8" />
                    </div>
                  ))}
                </div>
              ) : errorOrderStatus ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                  <div className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{errorOrderStatus}</p>
                  <button
                    onClick={() => fetchOrderStatus()}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 text-[9px] font-bold text-slate-700 rounded transition-all cursor-pointer"
                  >
                    Retry Load
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex-1 flex flex-col justify-between mt-2">
                  <div className="flex-1 flex items-center justify-center w-full">
                    <VerticalBarChart
                      data={orderStatusVerticalChartData}
                      emptyMessage="No transaction status found for active range"
                      onBarClick={handleOrderStatusBarClick}
                    />
                  </div>

                  {/* Stage Funnel Bar */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center">
                    {[
                      { label: "Quotations", count: quotationsVal, color: "text-indigo-600", link: "/sales/order-status?status=quotations" },
                      { label: "New Orders", count: newOrdersVal, color: "text-blue-600", link: "/sales/order-status?status=new_orders" },
                      { label: "Ongoing", count: ongoingOrdersVal, color: "text-cyan-600", link: "/sales/order-status?status=ongoing" },
                      { label: "To Close", count: orderToCloseVal, color: "text-amber-600", link: "/sales/order-status?status=to_close" },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => router.push(s.link)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer hover:shadow-3xs text-left"
                      >
                        <div className="text-[9.5px] font-bold text-slate-400 uppercase truncate">{s.label}</div>
                        <div className={`text-xs font-black ${s.color}`}>{s.count}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sales Collection Graph & Donut Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[250px] overflow-hidden">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Sales Collection
                  </h3>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5 truncate">
                    Overall Sales, Cash Collection & Pending Balance
                  </p>
                </div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 shrink-0">
                  {totalSalesAll > 0 ? `${((totalCashAll / totalSalesAll) * 100).toFixed(1)}% Realized` : "0% Realized"}
                </span>
              </div>

              {loadingKpi ? (
                <div className="flex flex-col items-center justify-center flex-1 py-4 animate-pulse space-y-3">
                  <div className="h-3.5 bg-slate-100 rounded w-full" />
                  <div className="h-3.5 bg-slate-100 rounded w-full" />
                  <div className="h-3.5 bg-slate-100 rounded w-full" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-1 py-2 min-w-0">
                  {/* Donut Chart */}
                  <div className="w-full sm:w-5/12 flex justify-center items-center shrink-0">
                    <PieChart
                      data={[
                        { name: "Cash Collection", value: totalCashAll, color: "#10b981" },
                        { name: "Cash Pending", value: totalpendingCollection, color: "#f59e0b" }
                      ]}
                      totalLabel="Total Sales"
                      centerValue={formatINR(totalSalesAll)}
                      emptyMessage="No sales recorded"
                      size={140}
                      minHeight="min-h-0"
                    />
                  </div>

                  {/* Graph Progress Bars */}
                  <div className="w-full sm:w-7/12 space-y-2.5 min-w-0 pl-0 sm:pl-1">
                    {/* 1. Total Sales Amount */}
                    <div className="min-w-0">
                      <div className="flex justify-between items-center text-[10.5px] mb-1 font-bold gap-1">
                        <span className="text-slate-600 flex items-center gap-1.5 truncate min-w-0">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="truncate">Total Sales</span>
                        </span>
                        <span className="text-slate-800 font-black shrink-0">{formatINR(totalSalesAll)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${salesBarWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* 2. Total Cash Collection */}
                    <div className="min-w-0">
                      <div className="flex justify-between items-center text-[10.5px] mb-1 font-bold gap-1">
                        <span className="text-slate-600 flex items-center gap-1.5 truncate min-w-0">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">Collected</span>
                        </span>
                        <span className="text-emerald-600 font-black shrink-0">
                          {formatINR(totalCashAll)}
                          <span className="text-[9px] text-slate-400 font-bold ml-1">
                            ({totalSalesAll > 0 ? ((totalCashAll / totalSalesAll) * 100).toFixed(1) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${cashBarWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* 3. Total Cash Pending */}
                    <div className="min-w-0">
                      <div className="flex justify-between items-center text-[10.5px] mb-1 font-bold gap-1">
                        <span className="text-slate-600 flex items-center gap-1.5 truncate min-w-0">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">Pending</span>
                        </span>
                        <span className="text-amber-600 font-black shrink-0">
                          {formatINR(totalpendingCollection)}
                          <span className="text-[9px] text-slate-400 font-bold ml-1">
                            ({totalSalesAll > 0 ? ((totalpendingCollection / totalSalesAll) * 100).toFixed(1) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pendingBarWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── 5. Visualizations Row 2 (Payment Status & Sales Summary) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
            {/* Payment Status Donut Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[230px]">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Payment Status
                  </h3>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5">
                    Breakdown by volume of order collections
                  </p>
                </div>
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 select-none shrink-0">
                  Up Today
                </span>
              </div>

              {loadingPaymentStatus ? (
                <div className="flex flex-col items-center justify-center flex-1 py-4 animate-pulse">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <div className="h-12 w-12 bg-white rounded-full" />
                  </div>
                </div>
              ) : errorPaymentStatus ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                  <div className="h-8 w-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{errorPaymentStatus}</p>
                  <button
                    onClick={() => fetchPaymentStatus()}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 text-[9px] font-bold text-slate-700 rounded transition-all cursor-pointer"
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

            {/* Action Watchlist: Overdue Deliveries & High-Value Dues */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between min-h-[250px]">
              {/* Card Header & Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Action Watchlist</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Live</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-450 mt-0.5 truncate">
                    {watchlistTab === "urgent"
                      ? "Immediate delivery risks & pending commitments"
                      : "Top outstanding customer balances to collect"}
                  </p>
                </div>

                {/* Dual Tab Buttons */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/70 shrink-0">
                  <button
                    onClick={() => setWatchlistTab("urgent")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      watchlistTab === "urgent"
                        ? "bg-white text-rose-700 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>⚠️ Overdue & Urgent</span>
                    {urgentOrders.filter((o) => o.diffDays <= 0).length > 0 && (
                      <span className="h-4 min-w-[16px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {urgentOrders.filter((o) => o.diffDays <= 0).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setWatchlistTab("topDues")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      watchlistTab === "topDues"
                        ? "bg-white text-amber-700 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>💰 Top Dues</span>
                    {topDueOrders.length > 0 && (
                      <span className="h-4 min-w-[16px] px-1 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {topDueOrders.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {loadingWatchlist ? (
                <div className="flex-1 flex flex-col justify-center gap-2.5 py-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <div className="h-3.5 bg-slate-100 rounded w-2/5" />
                      <div className="h-3.5 bg-slate-100 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : watchlistTab === "urgent" ? (
                /* Tab 1: Overdue & Urgent Deliveries */
                <div className="flex-1 flex flex-col justify-between py-1">
                  {urgentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">All deliveries on schedule!</p>
                      <p className="text-[10px] text-slate-400 font-medium">No overdue or immediate delivery commitments pending.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-1">
                      {urgentOrders.map((order) => {
                        const isOverdue = order.diffDays < 0;
                        const isToday = order.diffDays === 0;
                        const hasPhone = Boolean(order.customer_whatsapp_number || order.customer_mobile_number);

                        return (
                          <div key={order.id} className="pt-1.5 pb-1 flex items-center justify-between gap-2 hover:bg-slate-50/60 px-1 rounded transition-colors">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {order.order_number ? `#${order.order_number}` : "-"}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[130px] sm:max-w-[170px]">
                                  {order.customer_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                                <span>Dispatch: {order.displayDate || order.completion_date || order.commit_date}</span>
                                <span>•</span>
                                <span className="text-slate-500 font-bold">{order.order_status}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Urgency Badge */}
                              {isOverdue ? (
                                <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  {Math.abs(order.diffDays)}d overdue
                                </span>
                              ) : isToday ? (
                                <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Dispatch Today
                                </span>
                              ) : (
                                <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  Dispatch in {order.diffDays}d
                                </span>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                {hasPhone && (
                                  <button
                                    onClick={() => handleWhatsAppFollowUp(order)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 cursor-pointer transition-colors"
                                    title="Follow-up on WhatsApp"
                                  >
                                    <MessageCircle size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer link to Orders with Overdue & Today filter */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-medium">Prioritize orders to dispatch</span>
                    <button
                      onClick={() => router.push("/sales/orders?order_status=urgent")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Dispatch Orders</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Tab 2: Top High-Value Payment Dues */
                <div className="flex-1 flex flex-col justify-between py-1">
                  {topDueOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No overdue balances found!</p>
                      <p className="text-[10px] text-slate-400 font-medium">All active customer accounts are fully paid.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-1">
                      {topDueOrders.map((order) => {
                        const hasPhone = Boolean(order.customer_whatsapp_number || order.customer_mobile_number);
                        const dueAmt = order.balance_amount || 0;

                        return (
                          <div key={order.id} className="pt-1.5 pb-1 flex items-center justify-between gap-2 hover:bg-slate-50/60 px-1 rounded transition-colors">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {order.order_number ? `#${order.order_number}` : "-"}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[130px] sm:max-w-[170px]">
                                  {order.customer_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                                <span>Total: ₹{(order.final_amount || 0).toLocaleString("en-IN")}</span>
                                <span>•</span>
                                <span className="text-slate-500 font-bold">{order.payment_status}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Balance Due */}
                              <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded">
                                ₹{dueAmt.toLocaleString("en-IN")}
                              </span>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                {hasPhone && (
                                  <button
                                    onClick={() => handleWhatsAppFollowUp(order)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 cursor-pointer transition-colors"
                                    title="Send WhatsApp Payment Reminder"
                                  >
                                    <MessageCircle size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setEditPaymentOrderId(order.id);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded border border-transparent hover:border-indigo-200 cursor-pointer transition-colors"
                                  title="Collect / Update Payment"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer link to Payments page */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-medium">Accelerate cash realization</span>
                    <button
                      onClick={() => router.push("/sales/payments?filter=dues")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Payment Dues</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      )}

      {/* ─── Details View Modal ─── */}
      <ViewOrderModal
        isOpen={isViewModalOpen}
        orderId={selectedOrderId}
        role="sales"
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {/* ─── Payment Management Modal ─── */}
      <UpdatePaymentModal
        isOpen={isPaymentModalOpen}
        orderId={editPaymentOrderId}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditPaymentOrderId(null);
        }}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
}