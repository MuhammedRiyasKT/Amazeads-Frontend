"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Eye,
  X,
  CalendarDays,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertCircle,
  IndianRupee,
  AlertTriangle,
  FileBarChart2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  getDailyReports,
  getWeeklyReports,
  getMonthlyReports,
  getYearlyReports,
} from "../services/reports.service";
import type {
  SalesReportItem,
  SalesReportPagination,
  SalesReportType,
  SalesReportParams,
  PeriodOption,
} from "../types/reports.types";
import styles from "../components/SalesReports.module.css";
import { useSalesStore } from "@/store/salesStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(value?: number | null) {
  if (value === undefined || value === null || isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadgeClass(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "generated") return styles.badgeGenerated;
  if (s === "pending") return styles.badgePending;
  return styles.badgeDefault;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS: { id: SalesReportType; label: string }[] = [
  { id: "daily",   label: "Daily"   },
  { id: "weekly",  label: "Weekly"  },
  { id: "monthly", label: "Monthly" },
  { id: "yearly",  label: "Yearly"  },
];

// ─── Period Options ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { id: PeriodOption; label: string }[] = [
  { id: "",            label: "All (Default)"  },
  { id: "today",       label: "Today"           },
  { id: "this_week",   label: "This Week"       },
  { id: "this_month",  label: "This Month"      },
  { id: "this_year",   label: "This Year"       },
  { id: "upto_today",  label: "Upto Today"      },
  { id: "custom_date", label: "Specific Date"   },
  { id: "custom_range","label": "Date Range"    },
];

// Build today's date parts
function getDateParts() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    year: String(now.getFullYear()),
    month: pad(now.getMonth() + 1),
    day: pad(now.getDate()),
    today: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    weekStart: (() => {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    })(),
    monthStart: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
  };
}

// Convert period + custom inputs → SalesReportParams (without page/page_size)
function buildFilterParams(
  period: PeriodOption,
  customDate: string,
  customFrom: string,
  customTo: string,
  categoryId?: number
): Omit<SalesReportParams, "page" | "page_size"> {
  const dp = getDateParts();
  const params: Omit<SalesReportParams, "page" | "page_size"> = {};

  switch (period) {
    case "today":
      params.date = dp.today;
      break;
    case "this_week":
      params.from_date = dp.weekStart;
      params.to_date = dp.today;
      break;
    case "this_month":
      params.month = dp.month;
      params.year = dp.year;
      break;
    case "this_year":
      params.year = dp.year;
      break;
    case "upto_today":
      params.upto_today = true;
      break;
    case "custom_date":
      if (customDate) params.date = customDate;
      break;
    case "custom_range":
      if (customFrom) params.from_date = customFrom;
      if (customTo)   params.to_date   = customTo;
      break;
    default:
      break; // empty — use API default
  }

  if (categoryId) params.category_id = categoryId;

  return params;
}

// ─── Skeleton Rows ─────────────────────────────────────────────────────────────

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className={styles.skeletonRow}>
          {[100, 140, 80, 90, 90, 90, 90, 70, 70].map((w, j) => (
            <td key={j}>
              <div className={`${styles.skeleton}`} style={{ width: `${w}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── KPI Summary Cards ─────────────────────────────────────────────────────────

interface KpiSummaryProps {
  items: SalesReportItem[];
  loading: boolean;
}

function KpiSummary({ items, loading }: KpiSummaryProps) {
  const totalOrders      = items.reduce((s, r) => s + (r.orders || 0), 0);
  const totalSales       = items.reduce((s, r) => s + (r.sales_amount || r.sales_amount || 0), 0);
  const cashCollection   = items.reduce((s, r) => s + (r.cash_collection || r.cash_collection || 0), 0);
  const ordersCollection = items.reduce((s, r) => s + (r.orders_collection || 0), 0);
  const pending          = items.reduce((s, r) => s + (r.total_pending_balance || r.orders_pending || 0), 0);

  const kpis = [
    { label: "Total Orders",        value: String(totalOrders),           icon: <ShoppingCart size={16} />, colorClass: styles.iconIndigo },
    { label: "Sales Amount",        value: formatINR(totalSales),          icon: <IndianRupee size={16} />,  colorClass: styles.iconBlue   },
    { label: "Cash Collection",     value: formatINR(cashCollection),      icon: <Wallet size={16} />,       colorClass: styles.iconGreen  },
    { label: "Orders Collection",   value: formatINR(ordersCollection),    icon: <TrendingUp size={16} />,   colorClass: styles.iconAmber  },
    { label: "Pending Amount",      value: formatINR(pending),             icon: <AlertCircle size={16} />,  colorClass: styles.iconRose   },
  ];

  if (loading) {
    return (
      <div className={styles.summaryGrid}>
        {kpis.map((_, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={`${styles.kpiIcon} ${styles.iconIndigo}`} style={{ opacity: 0.3 }} />
            <div className={styles.kpiText}>
              <div className={`${styles.skeleton} ${styles.skeletonSmall}`} style={{ marginBottom: 6 }} />
              <div className={`${styles.skeleton} ${styles.skeletonFull}`} style={{ height: 18 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.summaryGrid}>
      {kpis.map((k) => (
        <div key={k.label} className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${k.colorClass}`}>{k.icon}</div>
          <div className={styles.kpiText}>
            <span className={styles.kpiMetricLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Detail Drawer ──────────────────────────────────────────────────────────────

interface DrawerProps {
  item: SalesReportItem | null;
  onClose: () => void;
}

function SalesReportDetailsDrawer({ item, onClose }: DrawerProps) {
  const [techOpen, setTechOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.drawerPanel} role="dialog" aria-modal="true" aria-label="Report Details">
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{item.name}</h2>
            <p className={styles.drawerSubtitle}>
              {formatDate(item.from_date)} — {formatDate(item.to_date)}
            </p>
          </div>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Period Info */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>Report Period</div>
            <div className={styles.drawerRow}>
              <span className={styles.drawerRowKey}>Period Name</span>
              <span className={styles.drawerRowVal}>{item.name}</span>
            </div>
            <div className={styles.drawerRow}>
              <span className={styles.drawerRowKey}>From Date</span>
              <span className={styles.drawerRowVal}>{formatDate(item.from_date)}</span>
            </div>
            <div className={styles.drawerRow}>
              <span className={styles.drawerRowKey}>To Date</span>
              <span className={styles.drawerRowVal}>{formatDate(item.to_date)}</span>
            </div>
            <div className={styles.drawerRow}>
              <span className={styles.drawerRowKey}>Status</span>
              <span>
                <span className={`${styles.badge} ${getStatusBadgeClass(item.status)}`}>
                  {item.status || "—"}
                </span>
              </span>
            </div>
          </div>

          {/* Sales Summary */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>Sales Summary</div>
            {[
              { key: "Orders",                val: String(item.orders || 0),              color: "" },
              { key: "Sales Amount",          val: formatINR(item.sales_amount),           color: "" },
              { key: "Cash Collection",       val: formatINR(item.cash_collection),        color: "#16a34a" },
              { key: "Orders Collection",     val: formatINR(item.orders_collection),      color: "#16a34a" },
              { key: "Orders Pending",        val: formatINR(item.orders_pending),         color: "#d97706" },
              { key: "Total Orders",          val: String(item.total_orders || 0),         color: "" },
              { key: "Total Sales Amount",    val: formatINR(item.total_sales_amount),     color: "" },
              { key: "Total Cash Collection", val: formatINR(item.total_cash_collection),  color: "#16a34a" },
              { key: "Total Cash Pending",    val: formatINR(item.total_cash_pending),     color: "#d97706" },
              { key: "Total Pending Balance", val: formatINR(item.total_pending_balance),  color: "#e11d48" },
              { key: "Total Sales Count",     val: String(item.total_sales_count || 0),   color: "" },
              { key: "Total Sales Value",     val: formatINR(item.total_sales_value),      color: "" },
            ].map(({ key, val, color }) => (
              <div key={key} className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>{key}</span>
                <span className={styles.drawerRowVal} style={color ? { color } : undefined}>{val}</span>
              </div>
            ))}
          </div>

          {/* Technical Info (collapsible) */}
          <div className={styles.drawerSection}>
            <button
              className={`${styles.drawerSectionTitle} w-full flex items-center justify-between cursor-pointer bg-transparent border-none text-left`}
              style={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
              onClick={() => setTechOpen(!techOpen)}
            >
              <span>Technical Details</span>
              <ChevronDown size={14} style={{ transform: techOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {techOpen && (
              <div style={{ marginTop: 4 }}>
                {[
                  { key: "Report ID",               val: String(item.id) },
                  { key: "Created By (User ID)",    val: String(item.created_by || "—") },
                  { key: "Order IDs Count",         val: String(item.orders_ids?.length ?? 0) },
                  { key: "Updated Order IDs Count", val: String(item.updated_orders_ids?.length ?? 0) },
                ].map(({ key, val }) => (
                  <div key={key} className={styles.drawerRow}>
                    <span className={styles.drawerRowKey}>{key}</span>
                    <span className={styles.drawerRowVal}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SalesReportsPage() {
  // Active tab
  const [activeTab, setActiveTab] = useState<SalesReportType>("daily");

  // Category from global Zustand store
  const { selectedCategory } = useSalesStore();

  // Filter state
  const [period, setPeriod]           = useState<PeriodOption>("");
  const [customDate, setCustomDate]   = useState("");
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");

  // Reports data
  const [items, setItems]             = useState<SalesReportItem[]>([]);
  const [pagination, setPagination]   = useState<SalesReportPagination>({ page: 1, page_size: 5, total_count: 0, total_pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Detail drawer
  const [drawerItem, setDrawerItem]   = useState<SalesReportItem | null>(null);

  // Fetch report data
  const fetchReports = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    const filterParams = buildFilterParams(
      period,
      customDate,
      customFrom,
      customTo,
      selectedCategory?.id
    );
    const params: SalesReportParams = { ...filterParams, page, page_size: 5 };

    try {
      let res;
      switch (activeTab) {
        case "daily":   res = await getDailyReports(params);   break;
        case "weekly":  res = await getWeeklyReports(params);  break;
        case "monthly": res = await getMonthlyReports(params); break;
        case "yearly":  res = await getYearlyReports(params);  break;
      }

      if (res?.success) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, page_size: 5, total_count: 0, total_pages: 1 });
      } else {
        setError(res?.message || "Failed to load reports.");
        setItems([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to reach the reports API.";
      setError(msg);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, period, customDate, customFrom, customTo, selectedCategory]);

  // Initial + dependency-driven fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, period, customDate, customFrom, customTo, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports(page);
  };

  const handleTabChange = (tab: SalesReportType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setPeriod("");
    setCustomDate("");
    setCustomFrom("");
    setCustomTo("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchReports(currentPage);
  };

  const hasActiveFilters = Boolean(period || customDate || customFrom || customTo);
  const showCustomDate   = period === "custom_date";
  const showCustomRange  = period === "custom_range";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Sales Reports</h1>
          <p className={styles.headerSubtitle}>
            Track and analyze sales performance across daily, weekly, monthly and yearly periods.
          </p>
        </div>
        <button
          id="sales-reports-refresh-btn"
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh current report"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Report Type Tabs ── */}
      <div className={styles.tabsWrapper} role="tablist" aria-label="Report type">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`sales-reports-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <CalendarDays size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          {/* Period selector */}
          <div>
            <label className={styles.filterLabel} htmlFor="period-select">Period</label>
            <select
              id="period-select"
              className={styles.filterSelect}
              value={period}
              onChange={(e) => { setPeriod(e.target.value as PeriodOption); setCurrentPage(1); }}
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Dynamic date inputs based on period */}
          {showCustomDate && (
            <div>
              <label className={styles.filterLabel} htmlFor="custom-date-input">Date</label>
              <input
                id="custom-date-input"
                type="date"
                className={styles.filterInput}
                value={customDate}
                onChange={(e) => { setCustomDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
          )}

          {showCustomRange && (
            <>
              <div>
                <label className={styles.filterLabel} htmlFor="from-date-input">From Date</label>
                <input
                  id="from-date-input"
                  type="date"
                  className={styles.filterInput}
                  value={customFrom}
                  onChange={(e) => { setCustomFrom(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div>
                <label className={styles.filterLabel} htmlFor="to-date-input">To Date</label>
                <input
                  id="to-date-input"
                  type="date"
                  className={styles.filterInput}
                  value={customTo}
                  onChange={(e) => { setCustomTo(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </>
          )}

          {/* Category shown as read-only from Zustand store */}
          {selectedCategory && (
            <div>
              <label className={styles.filterLabel}>Category</label>
              <div className={styles.filterInput} style={{ display: "flex", alignItems: "center", opacity: 0.75, cursor: "default" }}>
                {selectedCategory.category_name}
              </div>
            </div>
          )}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              id="sales-reports-clear-filters-btn"
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              <RotateCcw size={12} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── KPI Summary ── */}
      <div className={styles.summarySection}>
        <div className={styles.summaryLabel}>
          <FileBarChart2 size={13} />
          Current Results
        </div>
        <KpiSummary items={items} loading={isLoading} />
      </div>

      {/* ── Table + Mobile Cards ── */}
      <div className={styles.tableCard}>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block">
          <div className={styles.tableScrollContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Date Range</th>
                  <th className={styles.centerAlign}>Orders</th>
                  <th className={styles.rightAlign}>Sales Amount</th>
                  <th className={styles.rightAlign}>Cash Collection</th>
                  <th className={styles.rightAlign}>Orders Collection</th>
                  <th className={styles.rightAlign}>Pending</th>
                  <th className={styles.centerAlign}>Status</th>
                  <th className={styles.centerAlign}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows count={5} />
                ) : error ? (
                  <tr>
                    <td colSpan={9}>
                      <div className={styles.stateWrapper}>
                        <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
                          <AlertTriangle size={22} />
                        </div>
                        <div className={styles.stateTitle}>Failed to load reports</div>
                        <div className={styles.stateDesc}>{error}</div>
                        <button className={styles.retryBtn} onClick={() => fetchReports(currentPage)}>
                          <RefreshCw size={12} /> Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className={styles.stateWrapper}>
                        <div className={`${styles.stateIcon} ${styles.stateIconEmpty}`}>
                          <FileBarChart2 size={22} />
                        </div>
                        <div className={styles.stateTitle}>No reports found</div>
                        <div className={styles.stateDesc}>
                          No sales reports found for the selected filters. Try a different period or clear the filters.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.82rem" }}>
                          {item.name}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.73rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {item.from_date === item.to_date
                          ? formatDate(item.from_date)
                          : `${formatDate(item.from_date)} – ${formatDate(item.to_date)}`}
                      </td>
                      <td className={styles.centerAlign} style={{ fontWeight: 700 }}>
                        {item.orders || item.orders || 0}
                      </td>
                      <td className={styles.rightAlign}>
                        {formatINR(item.sales_amount || item.sales_amount)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#16a34a" }}>
                        {formatINR(item.cash_collection || item.cash_collection)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#2563eb" }}>
                        {formatINR(item.orders_collection)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#d97706" }}>
                        {formatINR(item.total_pending_balance || item.orders_pending)}
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={`${styles.badge} ${getStatusBadgeClass(item.status)}`}>
                          {item.status || "—"}
                        </span>
                      </td>
                      <td className={styles.centerAlign}>
                        <button
                          id={`sales-report-view-btn-${item.id}`}
                          className={styles.viewBtn}
                          onClick={() => setDrawerItem(item)}
                          title="View report details"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className={styles.mobileCards}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.mobileCard} style={{ gap: 8 }}>
                  <div className={`${styles.skeleton}`} style={{ height: 16, width: "60%" }} />
                  <div className={`${styles.skeleton}`} style={{ height: 12, width: "40%" }} />
                  <div className={styles.mobileCardStats}>
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className={styles.mobileStatItem}>
                        <div className={`${styles.skeleton}`} style={{ height: 10, width: 40 }} />
                        <div className={`${styles.skeleton}`} style={{ height: 14, width: 60, marginTop: 4 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.stateWrapper}>
              <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
                <AlertTriangle size={22} />
              </div>
              <div className={styles.stateTitle}>Failed to load reports</div>
              <div className={styles.stateDesc}>{error}</div>
              <button className={styles.retryBtn} onClick={() => fetchReports(currentPage)}>
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.stateWrapper}>
              <div className={`${styles.stateIcon} ${styles.stateIconEmpty}`}>
                <FileBarChart2 size={22} />
              </div>
              <div className={styles.stateTitle}>No reports found</div>
              <div className={styles.stateDesc}>
                No sales reports found for the selected filters.
              </div>
            </div>
          ) : (
            <div className={styles.mobileCards}>
              {items.map((item) => (
                <div key={item.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div>
                      <div className={styles.mobileCardPeriod}>{item.name}</div>
                      <div className={styles.mobileCardDate}>
                        {item.from_date === item.to_date
                          ? formatDate(item.from_date)
                          : `${formatDate(item.from_date)} – ${formatDate(item.to_date)}`}
                      </div>
                    </div>
                    <span className={`${styles.badge} ${getStatusBadgeClass(item.status)}`}>
                      {item.status || "—"}
                    </span>
                  </div>

                  <div className={styles.mobileCardStats}>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Orders</span>
                      <span className={styles.mobileStatValue}>
                        {item.total_orders || item.orders || 0}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Sales</span>
                      <span className={styles.mobileStatValue}>
                        {formatINR(item.total_sales_amount || item.sales_amount)}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Collection</span>
                      <span className={`${styles.mobileStatValue} ${styles.green}`}>
                        {formatINR(item.total_cash_collection || item.cash_collection)}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Pending</span>
                      <span className={`${styles.mobileStatValue} ${styles.amber}`}>
                        {formatINR(item.total_pending_balance || item.orders_pending)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.mobileCardFooter}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                      Orders Collection: <strong style={{ color: "#2563eb" }}>{formatINR(item.orders_collection)}</strong>
                    </span>
                    <button
                      className={styles.viewBtn}
                      onClick={() => setDrawerItem(item)}
                    >
                      <Eye size={12} /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.paginationInfo}>
              Page <strong>{currentPage}</strong> of <strong>{pagination.total_pages}</strong>
              &nbsp;({pagination.total_count} records)
            </div>
            <Pagination
              total={pagination.total_count}
              limit={pagination.page_size}
              activePage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <SalesReportDetailsDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
      />
    </div>
  );
}
