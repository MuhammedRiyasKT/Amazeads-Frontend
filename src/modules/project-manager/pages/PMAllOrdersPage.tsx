"use client";

import React, { useEffect, useState } from "react";
import { Eye, Calendar, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders, UserRole } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import styles from "../components/PMOrderComponents.module.css";

// 🌟 Status tabs config with color theme
const STATUS_TABS = [
  { label: "All Orders", value: "Ongoing", dot: "#6366f1", activeBg: "#ede9fe", activeColor: "#5b21b6", activeBorder: "#c4b5fd" },
  { label: "Packed", value: "Packed", dot: "#f59e0b", activeBg: "#fef9c3", activeColor: "#92400e", activeBorder: "#fde68a" },
  { label: "In Transist", value: "In Transist", dot: "#f97316", activeBg: "#ffedd5", activeColor: "#9a3412", activeBorder: "#fed7aa" },
  { label: "Delivered", value: "Delivered", dot: "#22c55e", activeBg: "#dcfce7", activeColor: "#166534", activeBorder: "#86efac" },
];

// 🌟 order_status → badge color mapping
function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case "In Progress": return { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" };
    case "Packed": return { background: "#fefce8", color: "#ca8a04", border: "1px solid #fde68a" };
    case "In Transist": return { background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" };
    case "Delivered": return { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
    case "Ongoing": return { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" };
    default: return { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
  }
}

export default function PMAllOrdersPage({ role = "project-manager" }: { role?: UserRole }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Filters
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [commitToDate, setCommitToDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(currentPage, 5, activeTab, commitToDate, completionDate, role);
      const items = data.items || [];
      setOrders(items);

      const rawCount = data.pagination?.total_count && data.pagination.total_count > 0
        ? data.pagination.total_count
        : (items.length >= 5 ? items.length + 5 : items.length);

      const rawPages = data.pagination?.total_pages && data.pagination.total_pages > 0
        ? data.pagination.total_pages
        : Math.ceil(rawCount / 5);

      setTotalCount(rawCount);
      setTotalPages(rawPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [currentPage, activeTab, commitToDate, completionDate]);

  const handleTabChange = (tab: string) => { setActiveTab(tab); setCurrentPage(1); };
  const handleCommitToDate = (val: string) => { setCommitToDate(val); setCurrentPage(1); };
  const handleCompletionDate = (val: string) => { setCompletionDate(val); setCurrentPage(1); };

  return (
    <div className={styles.container}>
      {/* 🌟 Row 1: Title left, Tab Slider right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
        {/* Title */}
        <div>
          <h1 className={styles.title}>All Production Orders</h1>
          <p className={styles.subtitle}>Full historical audit list of active and locked production orders.</p>
        </div>

        {/* Status Tabs — right side only */}
        <div style={{
          display: "flex",
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "5px",
          gap: "3px",
          flexShrink: 0,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px", fontSize: "0.775rem",
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1px solid ${tab.activeBorder}` : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  background: isActive ? tab.activeBg : "transparent",
                  color: isActive ? tab.activeColor : "#64748b",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                  background: isActive ? tab.dot : "#cbd5e1",
                  transition: "background 0.18s",
                }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 Row 2: Date filter bar — ExpenseFilters exact style */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3 px-4 py-2.5 w-fit mb-4 flex-wrap">
        {/* Funnel icon + label */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">DATE FILTERS:</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200" />

        {/* Commit Date */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
            Commit:
          </span>
          <div className="relative flex items-center">
            <input
              type="date"
              value={commitToDate}
              onChange={(e) => handleCommitToDate(e.target.value)}
              className="border-none outline-none text-xs text-slate-600 bg-transparent cursor-pointer"
              style={{ paddingRight: commitToDate ? "18px" : "0" }}
            />
            {commitToDate && (
              <button type="button" onClick={() => handleCommitToDate("")}
                className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200" />

        {/* Completion Date */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
            Completed:
          </span>
          <div className="relative flex items-center">
            <input
              type="date"
              value={completionDate}
              onChange={(e) => handleCompletionDate(e.target.value)}
              className="border-none outline-none text-xs text-slate-600 bg-transparent cursor-pointer"
              style={{ paddingRight: completionDate ? "18px" : "0" }}
            />
            {completionDate && (
              <button type="button" onClick={() => handleCompletionDate("")}
                className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </div>






      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ORDER ID</th>
                <th style={{ width: "120px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "90px" }}>TOTAL</th>
                <th style={{ width: "95px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                <th style={{ width: "100px" }}>CREATED BY</th>
                <th style={{ width: "95px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "60px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>Loading production register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>No orders found.</td></tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`}>
                            {/* Order ID & Customer (RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap text-center text-slate-400">
                                  {order.order_number ? `#${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* Product & Qty */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }} className="relative">
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
                                  role={role}
                                />
                              )}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* Total, Commit Date, Completed Date, Created By, Status, Actions (RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                {/* ✅ COMMIT DATE (commit_date) */}
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap" style={{ color: "#64748b", fontSize: "0.775rem" }}>
                                  {order.commit_date || "—"}
                                </td>
                                {/* ✅ COMPLETED DATE (completion_date) */}
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap" style={{ color: "#64748b", fontSize: "0.775rem" }}>
                                  {order.completion_date || "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle capitalize">
                                  {order.created_by_name || "—"}
                                </td>
                                {/* 🌟 Real order_status badge */}
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  <span style={{
                                    display: "inline-block",
                                    padding: "3px 9px",
                                    borderRadius: "6px",
                                    fontSize: "0.70rem",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    ...getStatusBadgeStyle(order.order_status),
                                  }}>
                                    {order.order_status || "—"}
                                  </span>
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className={styles.actionGroup}>
                                    <button
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                      className={styles.actionBtn}
                                      title="View details"
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

        {/* Pagination Footer */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div >
  );
}