"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Eye,
  X,
  CalendarDays,
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
      break;
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
          {[100, 140, 80, 90, 90, 90, 90, 70].map((w, j) => (
            <td key={j}>
              <div className={`${styles.skeleton}`} style={{ width: `${w}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Detail Drawer ──────────────────────────────────────────────────────────────

interface DrawerProps {
  item: SalesReportItem | null;
  onClose: () => void;
}

function SalesReportDetailsDrawer({ item, onClose }: DrawerProps) {
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
          </div>

          {/* Sales Summary */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>Sales Summary</div>
            {[
              { key: "Orders",            val: String(item.orders || 0),                                           color: "" },
              { key: "Sales Amount",      val: formatINR(item.sales_amount),                                       color: "" },
              { key: "Cash Collection",   val: formatINR(item.cash_collection),                                    color: "#16a34a" },
              { key: "Orders Collection", val: formatINR(item.live_orders_collection ?? item.orders_collection), color: "#2563eb" },
              { key: "Pending",           val: formatINR(item.live_orders_pending ?? item.orders_pending),         color: "#d97706" },
            ].map(({ key, val, color }) => (
              <div key={key} className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>{key}</span>
                <span className={styles.drawerRowVal} style={color ? { color } : undefined}>{val}</span>
              </div>
            ))}
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

      {/* ── Filter UI ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-1.5 select-none">
              Period Filter:
            </span>
            {PERIOD_OPTIONS.map((o) => {
              const isActive = period === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setPeriod(o.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              id="sales-reports-clear-filters-btn"
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              <RotateCcw size={12} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Dynamic date inputs based on selected period */}
        {(showCustomDate || showCustomRange) && (
          <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-slate-100">
            {showCustomDate && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600" htmlFor="custom-date-input">
                  Select Date:
                </label>
                <input
                  id="custom-date-input"
                  type="date"
                  className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-white"
                  value={customDate}
                  onChange={(e) => { setCustomDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
            )}

            {showCustomRange && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600" htmlFor="from-date-input">
                    From Date:
                  </label>
                  <input
                    id="from-date-input"
                    type="date"
                    className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-white"
                    value={customFrom}
                    onChange={(e) => { setCustomFrom(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600" htmlFor="to-date-input">
                    To Date:
                  </label>
                  <input
                    id="to-date-input"
                    type="date"
                    className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-white"
                    value={customTo}
                    onChange={(e) => { setCustomTo(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </>
            )}
          </div>
        )}
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
                  <th className={styles.centerAlign}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows count={5} />
                ) : error ? (
                  <tr>
                    <td colSpan={8}>
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
                    <td colSpan={8}>
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
                        {item.orders || 0}
                      </td>
                      <td className={styles.rightAlign}>
                        {formatINR(item.sales_amount)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#16a34a" }}>
                        {formatINR(item.cash_collection)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#2563eb" }}>
                        {formatINR(item.live_orders_collection ?? item.orders_collection)}
                      </td>
                      <td className={styles.rightAlign} style={{ color: "#d97706" }}>
                        {formatINR(item.live_orders_pending ?? item.orders_pending)}
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
                  </div>

                  <div className={styles.mobileCardStats}>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Orders</span>
                      <span className={styles.mobileStatValue}>
                        {item.orders || 0}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Sales</span>
                      <span className={styles.mobileStatValue}>
                        {formatINR(item.sales_amount)}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Cash Collection</span>
                      <span className={`${styles.mobileStatValue} ${styles.green}`}>
                        {formatINR(item.cash_collection)}
                      </span>
                    </div>
                    <div className={styles.mobileStatItem}>
                      <span className={styles.mobileStatLabel}>Pending</span>
                      <span className={`${styles.mobileStatValue} ${styles.amber}`}>
                        {formatINR(item.live_orders_pending ?? item.orders_pending)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.mobileCardFooter}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                      Orders Collection: <strong style={{ color: "#2563eb" }}>{formatINR(item.live_orders_collection ?? item.orders_collection)}</strong>
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
