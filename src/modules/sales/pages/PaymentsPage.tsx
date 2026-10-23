"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Eye, Search, RefreshCw, IndianRupee, Wallet, CheckCircle, Edit2, RotateCcw, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useSalesStore } from "@/store/salesStore";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import { getSalesPaymentStatusKpi } from "../services/salesKpi.service";
import { OrderItemResponse, SalesPaymentStatusData } from "../types";
import PaymentKpiCards from "../components/PaymentKpiCards";
import { getOrdersList } from "../services/order.service";
import ViewOrderModal from "../components/ViewOrderModal";
import UpdatePaymentModal from "../components/UpdatePaymentModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import { UserRole } from "@/modules/project-manager/services/managerOrder.service";
import api from "@/lib/axios";
import styles from "../components/OrderListComponents.module.css";

type PaymentFilterType = "Dues" | "Partial" | "Not Paid" | "Paid" | "All";

function PaymentsContent({ role }: { role?: UserRole }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterParam = searchParams.get("filter") || searchParams.get("payment_status");
  const effectiveRole: UserRole = useMemo(() => {
    if (role) return role;
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/manager")) return "manager";
    if (pathname.startsWith("/project-manager")) return "project-manager";
    return "sales";
  }, [role, pathname]);

  const salesCategory = useSalesStore((state) => state.selectedCategory);
  const pmCategory = useProjectManagerStore((state) => state.selectedCategory);

  const activeCategoryId = useMemo(() => {
    if (effectiveRole === "admin" || effectiveRole === "manager" || effectiveRole === "project-manager") {
      return pmCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
    }
    return salesCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
  }, [effectiveRole, salesCategory, pmCategory]);

  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // KPI states
  const [kpiData, setKpiData] = useState<SalesPaymentStatusData | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [errorKpi, setErrorKpi] = useState(false);

  const fetchKpi = async () => {
    setLoadingKpi(true);
    setErrorKpi(false);
    try {
      let res: any = null;
      if (effectiveRole === "sales") {
        res = await getSalesPaymentStatusKpi({ upto_today: true });
      } else {
        const params: any = { upto_today: true };
        if (activeCategoryId) params.category_id = activeCategoryId;
        try {
          res = await api.get(`/${effectiveRole}/sales-kpi-cards/payments`, { params });
        } catch {
          res = await api.get(`/${effectiveRole}/kpi-cards/payments`, { params });
        }
      }

      if (res && res.data) {
        setKpiData(res.data.data || res.data);
      } else {
        setErrorKpi(true);
      }
    } catch (err) {
      console.error("Error fetching payment KPI metrics:", err);
      setErrorKpi(true);
    } finally {
      setLoadingKpi(false);
    }
  };

  useEffect(() => {
    fetchKpi();
  }, [effectiveRole, activeCategoryId]);

  const getInitialPaymentFilter = (): PaymentFilterType => {
    if (!filterParam) return "Partial";
    const f = filterParam.toLowerCase();
    if (f === "dues" || f === "due" || f === "pending_dues") return "Dues";
    if (f === "partial") return "Partial";
    if (f === "not paid" || f === "not_paid" || f === "pending") return "Not Paid";
    if (f === "paid") return "Paid";
    if (f === "all") return "All";
    return "Partial";
  };

  // Status Filter Pill State (Defaults to URL param or Partial)
  const [activePaymentFilter, setActivePaymentFilter] = useState<PaymentFilterType>(getInitialPaymentFilter);

  useEffect(() => {
    if (filterParam) {
      const f = filterParam.toLowerCase();
      if (f === "dues" || f === "due" || f === "pending_dues") {
        setActivePaymentFilter("Dues");
        setCurrentPage(1);
      } else if (f === "partial") {
        setActivePaymentFilter("Partial");
        setCurrentPage(1);
      } else if (f === "not paid" || f === "not_paid" || f === "pending") {
        setActivePaymentFilter("Not Paid");
        setCurrentPage(1);
      } else if (f === "paid") {
        setActivePaymentFilter("Paid");
        setCurrentPage(1);
      } else if (f === "all") {
        setActivePaymentFilter("All");
        setCurrentPage(1);
      }
    }
  }, [filterParam]);

  // Form Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  // Payment Edit Modal State
  const [editPaymentOrderId, setEditPaymentOrderId] = useState<number | null>(null);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);

  // 🌟 തത്സമയം അപ്ലൈ ആകുന്ന ഫെച്ച് ഫങ്ഷൻ
  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = {
        page: pageToFetch,
        page_size: 5,
        is_quotation: false
      };

      if (activeCategoryId) {
        activeFilters.category_id = activeCategoryId;
      }

      if (debouncedSearch.trim()) activeFilters.search = debouncedSearch.trim();
      if (mobileSearch.trim()) activeFilters.mobile_number = mobileSearch.trim();
      if (fromDate) activeFilters.from_date = fromDate;
      if (toDate) activeFilters.to_date = toDate;

      let data: any = { items: [], pagination: { total_pages: 1, total_count: 0 } };

      if (activePaymentFilter === "Dues") {
        // 🌟 "Partial", "Pending" എന്നീ രണ്ട് സ്റ്റാറ്റസുകളിലുള്ള ബാക്കി തുകയുള്ള ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു
        const fetchByStatus = async (status: string) => {
          const params = {
            ...activeFilters,
            page: 1,
            page_size: 20,
            payment_status: status
          };
          try {
            return effectiveRole === "sales"
              ? await getOrdersList(params)
              : await api.get(`/${effectiveRole}/orders`, { params }).then((r) => r.data);
          } catch (e) {
            console.warn(`Failed to fetch orders for status ${status}:`, e);
            return { items: [], pagination: { total_count: 0 } };
          }
        };

        const [resPartial, resPending] = await Promise.all([
          fetchByStatus("Partial"),
          fetchByStatus("Pending"),
        ]);

        const extractList = (res: any): any[] => {
          if (!res) return [];
          if (Array.isArray(res.items)) return res.items;
          if (Array.isArray(res.data?.items)) return res.data.items;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          return [];
        };

        const itemsPartial = extractList(resPartial);
        const itemsPending = extractList(resPending);

        // ID വെച്ച് തനിപ്പകർപ്പുകൾ ഒഴിവാക്കി യോജിപ്പിക്കുന്നു (Merge & Deduplicate)
        const mergedMap = new Map<number, any>();
        [...itemsPartial, ...itemsPending].forEach((item: any) => {
          if (item?.id) mergedMap.set(item.id, item);
        });

        // ബാലൻസ് ഉള്ളവ മാത്രം ഫിൽട്ടർ ചെയ്ത് ഏറ്റവും കൂടുതൽ തുക ബാക്കിയുള്ളത് മുകളിൽ വരാൻ സോർട്ട് ചെയ്യുന്നു
        const allDues = Array.from(mergedMap.values())
          .filter((item: any) => {
            const due = Number(item.balance_amount ?? item.due_amount ?? 0);
            const total = Number(item.final_amount ?? item.total_amount ?? 0);
            const paid = Number(item.paid_amount ?? 0);
            return due > 0 || (total > paid);
          })
          .sort((a: any, b: any) => {
            const dueA = Number(a.balance_amount ?? a.due_amount ?? 0);
            const dueB = Number(b.balance_amount ?? b.due_amount ?? 0);
            return dueB - dueA;
          });

        const pageSize = 5;
        const totalCount = allDues.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const paginatedItems = allDues.slice((pageToFetch - 1) * pageSize, pageToFetch * pageSize);

        data = {
          items: paginatedItems,
          pagination: {
            total_count: totalCount,
            total_pages: totalPages,
            page: pageToFetch,
            page_size: pageSize,
          },
        };
      } else if (activePaymentFilter === "Not Paid") {
        // 🌟 ബാക്കെൻഡിൽ "Not Paid" ഓർഡറുകളുടെ സ്റ്റാറ്റസ് "Pending" എന്നാണ്
        const fetchPending = async () => {
          const params = { ...activeFilters, payment_status: "Pending" };
          return effectiveRole === "sales"
            ? await getOrdersList(params)
            : await api.get(`/${effectiveRole}/orders`, { params }).then((r) => r.data);
        };

        try {
          data = await fetchPending();
        } catch {
          data = { items: [], pagination: { total_count: 0, total_pages: 1 } };
        }
      } else {
        if (activePaymentFilter !== "All") {
          activeFilters.payment_status = activePaymentFilter;
        }

        if (effectiveRole === "sales") {
          data = await getOrdersList(activeFilters);
        } else {
          const response = await api.get(`/${effectiveRole}/orders`, { params: activeFilters });
          data = response.data;
        }
      }

      setOrders(data?.items || data?.data || []);
      setTotalPages(data?.pagination?.total_pages || Math.ceil((data?.pagination?.total_count || 0) / 5) || 1);
      setTotalCount(data?.pagination?.total_count || (data?.items || []).length);
    } catch (err) {
      console.error("Error fetching orders for payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Live Auto-Apply Filters: ഏതൊരു ഫിൽട്ടർ മാറിയാലും തനിയെ ഫെച്ച് ചെയ്യും
  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activePaymentFilter, activeCategoryId, debouncedSearch, mobileSearch, fromDate, toDate, effectiveRole]);

  const handleFilterTabChange = (filter: PaymentFilterType) => {
    setActivePaymentFilter(filter);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setMobileSearch("");
    setFromDate("");
    setToDate("");
    setActivePaymentFilter("Partial");
    setCurrentPage(1);
    router.replace(pathname);
  };

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const handleEditPaymentClick = (id: number) => {
    setEditPaymentOrderId(id);
    setIsEditPaymentOpen(true);
  };

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  // KPI calculations
  const pageTotalPaid = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
  const pageTotalDue = orders.reduce((sum, order) => sum + (order.balance_amount || 0), 0);

  const getPaymentBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "partial":
        return "bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "not paid":
      case "pending":
        return "bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
    }
  };

  const formatPaymentStatusLabel = (status?: string | null) => {
    if (!status) return "NOT PAID";
    const s = status.toLowerCase();
    if (s === "pending" || s === "not paid") return "NOT PAID";
    return status.toUpperCase();
  };

  const getPaymentTypeLabel = (type?: string | null) => {
    if (!type) return "—";
    const mapping: Record<string, string> = {
      "Cash": "💰 Cash",
      "Credit/Debit Card": "💳 Card",
      "Card": "💳 Card",
      "UPI": "📱 UPI",
      "Bank Transfer": "🏦 Transfer",
      "Cheque": "📄 Cheque"
    };
    return mapping[type] || type;
  };

  const isAnyFilterActive = Boolean(mobileSearch || fromDate || toDate || activePaymentFilter !== "Partial");

  return (
    <div className={styles.container}>
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full border-b border-slate-200 pb-3.5">
        <div>
          <h1 className={styles.title}>Payment Register</h1>
          <p className={styles.subtitle}>
            View sales accounts, paid status, and handle due amounts verification.
          </p>
        </div>

        {/* Payment Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none self-start sm:self-auto">
          {[
            { id: "Dues", label: "💰 All Dues" },
            { id: "Partial", label: "Partial" },
            { id: "Not Paid", label: "Not Paid" },
            { id: "Paid", label: "Paid" },
            { id: "All", label: "All Records" },
          ].map((tab) => {
            const isActive = activePaymentFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterTabChange(tab.id as PaymentFilterType)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? tab.id === "Dues"
                      ? "bg-amber-600 text-white shadow-xs font-black"
                      : "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Pipeline KPIs */}
      <PaymentKpiCards
        data={kpiData}
        loading={loadingKpi}
        error={errorKpi}
        onRetry={fetchKpi}
      />

      {/* 🌟 Live Auto-Applying Filters Bar (Apply Button പൂർണ്ണമായി ഒഴിവാക്കി) */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Search across all text fields */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-lg pl-9 pr-8 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* From Date */}
          {/* <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none bg-white"
            title="From Date"
          /> */}

          {/* To Date */}
          {/* <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none bg-white"
            title="To Date"
          /> */}
        </div>

        {isAnyFilterActive && (
          <div className="flex justify-end border-t border-slate-100 pt-2.5">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-rose-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Payments Table Container */}
      <div className={styles.tableCard}>
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "115px" }}>PAYMENT TYPE</th>
                <th style={{ width: "100px" }}>ACCOUNT</th>
                <th style={{ width: "100px" }}>PAID AMOUNT</th>
                <th style={{ width: "100px" }}>DUE AMOUNT</th>
                <th style={{ width: "100px" }}>TOTAL AMOUNT</th>
                <th style={{ width: "90px", textAlign: "center" }}>PAYMENT STATUS</th>
                <th style={{ width: "80px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-indigo-600" />
                      <span>Loading payments details...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-500">
                    No payment records found under "{activePaymentFilter === "Dues" ? "Pending Dues" : activePaymentFilter}" status.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;
                  const isPaid = (order.payment_status || "").toLowerCase() === "paid";

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj, pIdx) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`}>
                            {isFirstRow && (
                              <>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap"
                                >
                                  <div className="font-bold text-slate-800">
                                    {order.order_number ? `#${order.order_number}` : "—"}
                                  </div>
                                  {(order.commit_date || order.order_date) && (
                                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                      {formatDateStyle(order.commit_date || order.order_date)}
                                    </div>
                                  )}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle"
                                >
                                  <div className="font-bold text-slate-800">{order.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                </td>
                              </>
                            )}

                            {/* Product column */}
                            <td className="font-bold text-[0.78rem] text-slate-700 relative">
                              <span
                                className="hover:text-indigo-600 transition-colors cursor-pointer border-b border-dashed border-slate-300"
                                onClick={() => {
                                  if (proj) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === proj.id ? null : proj.id
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : "—"}
                              </span>

                              {proj && selectedTimelineProjectId === proj.id && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                  role={effectiveRole}
                                />
                              )}
                            </td>

                            {/* Quantity column */}
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap text-xs font-bold text-slate-700"
                                >
                                  {getPaymentTypeLabel(order.payment_type)}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle font-bold text-slate-600"
                                >
                                  {order.account_name || "—"}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap"
                                >
                                  <span className={styles.paidBubble}>
                                    ₹{(order.paid_amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap"
                                >
                                  <span className={styles.dueBubble}>
                                    ₹{(order.balance_amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap font-bold text-slate-800"
                                >
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  style={{ textAlign: "center" }}
                                  className="align-middle"
                                >
                                  <span className={getPaymentBadgeClass(order.payment_status)}>
                                    {formatPaymentStatusLabel(order.payment_status)}
                                  </span>
                                </td>

                                {/* ACTION COLUMN */}
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle"
                                >
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleEditPaymentClick(order.id)}
                                      className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                                      title="Manage Payment & History"
                                    >
                                      <Edit2 size={13} />
                                    </button>

                                    <button
                                      onClick={() => handleViewClick(order.id)}
                                      className={styles.actionBtn}
                                      title="View Order Details"
                                    >
                                      <Eye size={13} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="block md:hidden p-3 space-y-3 w-full">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              Loading payment records...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
              No payment records found under "{activePaymentFilter === "Dues" ? "Pending Dues" : activePaymentFilter}" status.
            </div>
          ) : (
            orders.map((order) => {
              const isPaid = (order.payment_status || "").toLowerCase() === "paid";
              return (
                <div
                  key={`mob-pay-${order.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3 w-full min-w-0"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs text-slate-900">
                        {order.order_number ? `#${order.order_number}` : "—"}
                      </span>
                      {(order.commit_date || order.order_date) && (
                        <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {formatDateStyle(order.commit_date || order.order_date)}
                        </span>
                      )}
                    </div>
                    <span className={getPaymentBadgeClass(order.payment_status)}>
                      {formatPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {order.customer_name} <span className="text-slate-400 font-normal">({order.customer_mobile_number})</span>
                    </h4>
                    <p className="text-xs font-semibold text-indigo-700">
                      {order.projects?.[0]?.project_name || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Paid</span>
                      <span className="font-extrabold text-emerald-700 text-xs block mt-0.5">
                        ₹{(order.paid_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="border-x border-slate-200/80 px-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Due</span>
                      <span className="font-extrabold text-rose-600 text-xs block mt-0.5">
                        ₹{(order.balance_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="font-extrabold text-slate-800 text-xs block mt-0.5">
                        ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Account: <strong className="text-slate-700">{order.account_name || "—"}</strong>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Type: <strong className="text-slate-700">{getPaymentTypeLabel(order.payment_type)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditPaymentClick(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                        title="Manage Payment & History"
                      >
                        <Edit2 size={12} /> {isPaid ? "History" : "Update"}
                      </button>

                      <button
                        onClick={() => handleViewClick(order.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg bg-white"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <span className={styles.highlightText}>{currentPage}</span> of{" "}
              <span className={styles.highlightText}>{totalPages}</span> ({totalCount} orders)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Details View Modal */}
      <ViewOrderModal
        isOpen={isViewOpen}
        orderId={selectedOrderId}
        role={effectiveRole}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {/* Payment Edit Modal */}
      <UpdatePaymentModal
        isOpen={isEditPaymentOpen}
        orderId={editPaymentOrderId}
        onClose={() => {
          setIsEditPaymentOpen(false);
          setEditPaymentOrderId(null);
        }}
        onSuccess={() => {
          fetchOrders();
          fetchKpi();
        }}
      />
    </div>
  );
}

export default function PaymentsPage({ role }: { role?: UserRole }) {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading payment register...</div>}>
      <PaymentsContent role={role} />
    </React.Suspense>
  );
}