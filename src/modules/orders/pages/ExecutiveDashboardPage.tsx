"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  ShoppingBag,
  Activity,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  Filter,
  RotateCcw,
  User,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  getPMOrders,
  getPMNewOrders,
  getProjectManagerOrderStatus,
  UserRole,
} from "@/modules/project-manager/services/managerOrder.service";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";

// 🌟 Helper for Today's Date YYYY-MM-DD
const getTodayDateStr = () => new Date().toISOString().split("T")[0];

// 🌟 Admin & Manager Orders Dashboard Tabs
const EXECUTIVE_ORDER_TABS = [
  { id: "all", label: "All Orders", icon: ShoppingBag, color: "#6366f1" },
  { id: "new", label: "New Orders", icon: Sparkles, color: "#ec4899" },
  { id: "in-progress", label: "In Progress", icon: Activity, color: "#3b82f6" },
  { id: "packed", label: "Packed", icon: Package, color: "#d97706" },
  { id: "in-transit", label: "In Transit", icon: Truck, color: "#ea580c" },
  { id: "delivered", label: "Delivered", icon: CheckCircle2, color: "#16a34a" },
  { id: "closed", label: "Closed", icon: CheckCircle2, color: "#475569" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "#e11d48" },
  { id: "dispatch", label: "Orders To Dispatch", icon: Send, color: "#0284c7" },
];

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case "In Progress": return { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" };
    case "Packed": return { background: "#fefce8", color: "#ca8a04", border: "1px solid #fde68a" };
    case "In Transist":
    case "In Transit": return { background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" };
    case "Delivered": return { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
    case "Closed": return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
    case "Cancelled":
    case "Cancel": return { background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3" };
    case "Ongoing": return { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" };
    default: return { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
  }
}

export function ExecutiveDashboardPage({
  role = "admin",
  defaultTab = "all",
}: {
  role?: UserRole;
  defaultTab?: string;
}) {
  const searchParams = useSearchParams();
  const tabQuery = searchParams?.get("tab") || defaultTab;

  const [activeTab, setActiveTab] = useState<string>(tabQuery);
  const { selectedCategory } = useProjectManagerStore();
  const activeCategoryId =
    role === "admin" || role === "manager" ? undefined : selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [commitDate, setCommitDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  // Modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);

  // KPI stats
  const [kpis, setKpis] = useState<any>({
    ongoing_orders: 0,
    in_progress: 0,
    packed: 0,
    in_transit: 0,
    in_transist: 0,
    delivered: 0,
  });

  const fetchKpis = async () => {
    try {
      const res = await getProjectManagerOrderStatus(
        { upto_today: true, category_id: activeCategoryId },
        role
      );
      if (res && res.success !== false) {
        setKpis(res.data || res);
      }
    } catch (err) {
      console.error("Failed to fetch KPIs:", err);
    }
  };

  const fetchOrdersData = async () => {
    setIsLoading(true);
    try {
      fetchKpis();
      let res: any = null;

      switch (activeTab) {
        case "new":
          res = await getPMNewOrders(currentPage, 5, role, activeCategoryId);
          break;
        case "in-progress":
          res = await getPMOrders(
            currentPage,
            5,
            "In Progress",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "packed":
          res = await getPMOrders(
            currentPage,
            5,
            "Packed",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "in-transit":
          res = await getPMOrders(
            currentPage,
            5,
            "In Transit",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "delivered":
          res = await getPMOrders(
            currentPage,
            5,
            "Delivered",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "closed":
          res = await getPMOrders(
            currentPage,
            5,
            "Closed",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "cancelled":
          res = await getPMOrders(
            currentPage,
            5,
            "Cancel",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
        case "dispatch":
          // Orders To Dispatch — filter by today's date for completion_date automatically
          const targetDispatchDate = completionDate || getTodayDateStr();
          res = await getPMOrders(
            currentPage,
            5,
            "",
            "",
            targetDispatchDate,
            role,
            activeCategoryId
          );
          break;
        case "all":
        default:
          res = await getPMOrders(
            currentPage,
            5,
            "",
            commitDate,
            completionDate,
            role,
            activeCategoryId
          );
          break;
      }

      if (res) {
        let rawItems = res.items || res.data || [];

        if (activeTab === "new") {
          rawItems = rawItems.filter((item: any) => !item.order_number);
        }

        if (searchOrder) {
          rawItems = rawItems.filter((i: any) =>
            (i.order_number || `${i.id}`).toLowerCase().includes(searchOrder.toLowerCase())
          );
        }
        if (searchCustomer) {
          rawItems = rawItems.filter((i: any) =>
            (i.customer_name || "").toLowerCase().includes(searchCustomer.toLowerCase())
          );
        }
        setOrders(rawItems);

        const totalC = res.pagination?.total_count || rawItems.length;
        const totalP = res.pagination?.total_pages || Math.ceil(totalC / 5) || 1;
        setTotalCount(totalC);
        setTotalPages(totalP);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [activeTab, currentPage, commitDate, completionDate, searchOrder, searchCustomer, selectedCategory]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchOrder("");
    setSearchCustomer("");
    setCommitDate("");
    setCompletionDate("");
    setCurrentPage(1);
  };

  const formatDateStyle = (dateStr: string) => {
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
  };

  return (
    <div className={styles.container}>
      {/* 🌟 Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight capitalize">
            {role} Orders Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Centralized register to view, track and manage production orders across all stages.
          </p>
        </div>
      </div>

      {/* 🌟 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Ongoing Orders</span>
            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
              <ShoppingBag size={14} />
            </div>
          </div>
          <strong className="text-xl font-black text-slate-900">{kpis.ongoing_orders ?? 0}</strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">In Progress</span>
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Activity size={14} />
            </div>
          </div>
          <strong className="text-xl font-black text-slate-900">{kpis.in_progress ?? 0}</strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Packed</span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <Package size={14} />
            </div>
          </div>
          <strong className="text-xl font-black text-slate-900">{kpis.packed ?? 0}</strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">In Transit</span>
            <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
              <Truck size={14} />
            </div>
          </div>
          <strong className="text-xl font-black text-slate-900">{kpis.in_transist ?? kpis.in_transit ?? 0}</strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Delivered</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <strong className="text-xl font-black text-slate-900">{kpis.delivered ?? 0}</strong>
        </div>
      </div>

      {/* 🌟 Tab Navigation Pills */}
      <div className="bg-white p-1.5 border border-slate-200 rounded-2xl shadow-2xs mb-4 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {EXECUTIVE_ORDER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs scale-102"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={13} style={{ color: isActive ? "#ffffff" : tab.color }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🌟 Filters Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 mb-4">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px]">
          <Filter size={13} className="text-indigo-600" /> Filters:
        </div>

        <input
          type="text"
          placeholder="Search Order Number..."
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          className="h-8 border border-slate-200 rounded-lg px-2.5 bg-white text-xs focus:outline-none"
        />

        <input
          type="text"
          placeholder="Search Customer..."
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          className="h-8 border border-slate-200 rounded-lg px-2.5 bg-white text-xs focus:outline-none"
        />

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Commit:</span>
          <input
            type="date"
            value={commitDate}
            onChange={(e) => setCommitDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Completion:</span>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {(searchOrder || searchCustomer || commitDate || completionDate) && (
          <button
            onClick={handleResetFilters}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-auto"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* 🌟 Orders Table (CREATED BY Column added, STAGE Column removed) */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "85px" }}>ORDER NUMBER</th>
                <th style={{ width: "140px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "95px" }}>TOTAL</th>
                <th style={{ width: "105px" }}>COMMIT DATE</th>
                <th style={{ width: "115px" }}>COMPLETION DATE</th>
                <th style={{ width: "120px" }}>CREATED BY</th>
                <th style={{ width: "110px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "70px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 font-semibold text-slate-500">
                    Loading orders register...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 font-semibold text-slate-500">
                    No orders found for this view.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id || order.order_id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id || order.order_id}-${proj?.id || pIdx}`}>
                            {/* Order Number & Customer */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle">
                                  {order.order_number ? `#${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} className="font-bold text-slate-800 align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* Product Name */}
                            <td
                              style={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                position: "relative",
                                zIndex: proj && selectedTimelineProjectId === proj.id ? 50 : undefined,
                              }}
                              className="align-middle"
                            >
                              <span
                                className="cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block"
                                onClick={() => {
                                  if (proj) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === proj.id ? null : proj.id
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : order.product_name || "—"}
                              </span>

                              {proj && selectedTimelineProjectId === proj.id && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                  role={role}
                                />
                              )}
                            </td>

                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : order.total_units || "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle whitespace-nowrap">
                                  ₹{(order.final_amount || order.total_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle text-slate-600 text-xs whitespace-nowrap">
                                  {formatDateStyle(order.commit_date)}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle text-slate-600 text-xs whitespace-nowrap">
                                  {formatDateStyle(order.completion_date)}
                                </td>

                                {/* 🌟 CREATED BY Column */}
                                <td rowSpan={projectsCount} className="align-middle text-xs font-bold text-slate-700 capitalize">
                                  <div className="flex items-center gap-1 text-slate-700 font-bold">
                                    <User size={12} className="text-slate-400 shrink-0" />
                                    <span>{order.created_by_name || order.created_by || "—"}</span>
                                  </div>
                                </td>

                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      fontSize: "0.70rem",
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      ...getStatusBadgeStyle(order.order_status || order.status),
                                    }}
                                  >
                                    {order.order_status || order.status || "Ongoing"}
                                  </span>
                                </td>

                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <div className={styles.actionGroup}>
                                    <button
                                      onClick={() => {
                                        setSelectedOrderId(order.id || order.order_id);
                                        setIsViewOrderOpen(true);
                                      }}
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

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewOrderModal
        isOpen={isViewOrderOpen}
        orderId={selectedOrderId}
        role={role}
        onClose={() => setIsViewOrderOpen(false)}
      />
    </div>
  );
}

export default ExecutiveDashboardPage;
