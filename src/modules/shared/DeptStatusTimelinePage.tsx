"use client";

import React, { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";

// ================================
// Types
// ================================
export type DeptTimelineDept = "designing" | "printing" | "production" | "logistics";

interface DeptStatusTimelinePageProps {
  department: DeptTimelineDept;
  title: string;
  subtitle: string;
  fetchFn: (filters: any) => Promise<any>;
}

// Dept config — fixed 4 positions always rendered
const DEPT_CONFIG = [
  { id: 1, label: "DS" },
  { id: 2, label: "PR" },
  { id: 3, label: "PD" },
  { id: 4, label: "LG" },
];

// Highlight the current department's column in progress
const DEPT_ID_MAP: Record<DeptTimelineDept, number> = {
  designing: 1,
  printing: 2,
  production: 3,
  logistics: 4,
};

// ================================
// Helpers
// ================================
function formatDateStyle(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ================================
// Progress Cell — 4 fixed slots
// ================================
function ProgressCell({
  departments,
  currentDeptId,
}: {
  departments: any[];
  currentDeptId: number;
}) {
  return (
    <div className="flex items-center justify-center py-0.5">
      <div className="flex items-center gap-1 text-[11px] font-bold">
        {DEPT_CONFIG.map(({ id, label }, idx) => {
          const d = departments.find(
            (x: any) => x.department_id === id || x.id === id
          );
          const isAssigned = d?.is_assigned === true;
          const isDone = d?.final_status === true;
          const isCurrent = id === currentDeptId;

          const prevD =
            idx > 0
              ? departments.find(
                  (x: any) =>
                    x.department_id === DEPT_CONFIG[idx - 1].id ||
                    x.id === DEPT_CONFIG[idx - 1].id
                )
              : null;
          const prevAssigned = prevD?.is_assigned === true;
          const prevDone = prevD?.final_status === true;

          return (
            <React.Fragment key={id}>
              {/* Connector — always shown */}
              {idx > 0 && (
                <span
                  className={`w-3.5 h-[1.5px] -translate-y-[4px] ${
                    prevAssigned && isAssigned && prevDone && isDone
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
              )}
              <div className="flex flex-col items-center w-5">
                {isAssigned ? (
                  <span
                    className={
                      isDone
                        ? "text-emerald-600 font-extrabold"
                        : isCurrent
                        ? "text-indigo-600 font-extrabold"
                        : "text-rose-500 font-extrabold"
                    }
                  >
                    {isDone ? "✓" : "✕"}
                  </span>
                ) : (
                  <span className="text-transparent select-none">–</span>
                )}
                <span
                  className={`text-[8px] font-extrabold mt-1 leading-none ${
                    isCurrent
                      ? "text-indigo-500"
                      : isAssigned
                      ? "text-slate-500"
                      : "text-slate-200"
                  }`}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ================================
// Main Page Component
// ================================
export default function DeptStatusTimelinePage({
  department,
  title,
  subtitle,
  fetchFn,
}: DeptStatusTimelinePageProps) {
  const currentDeptId = DEPT_ID_MAP[department];

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [designDate, setDesignDate] = useState("");
  const [printingDate, setPrintingDate] = useState("");
  const [commitDate, setCommitDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");

  const hasFilters = !!(designDate || printingDate || commitDate || completedDate);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const filters: any = { page: currentPage, page_size: 5 };
      if (designDate) filters.design_date = designDate;
      if (printingDate) filters.printing_date = printingDate;
      if (commitDate) filters.commit_date = commitDate;
      if (completedDate) filters.completed_date = completedDate;

      const data = await fetchFn(filters);
      const items = data.items || [];
      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error(`[${department}] Status Timeline fetch error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, designDate, printingDate, commitDate, completedDate]);

  const handleClearFilters = () => {
    setDesignDate("");
    setPrintingDate("");
    setCommitDate("");
    setCompletedDate("");
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
          <Filter size={14} className="text-indigo-600" /> Date Filters:
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Design:</span>
          <input
            type="date"
            value={designDate}
            onChange={(e) => { setDesignDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Print:</span>
          <input
            type="date"
            value={printingDate}
            onChange={(e) => { setPrintingDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Commit:</span>
          <input
            type="date"
            value={commitDate}
            onChange={(e) => { setCommitDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Completed:</span>
          <input
            type="date"
            value={completedDate}
            onChange={(e) => { setCompletedDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "110px" }}>DESIGN DATE</th>
                <th style={{ width: "110px" }}>PRINT DATE</th>
                <th style={{ width: "110px" }}>COMMIT DATE</th>
                <th style={{ width: "85px", textAlign: "center" }}>DAYS LEFT</th>
                <th style={{ width: "140px", textAlign: "center" }}>PROGRESS</th>
                <th style={{ width: "85px", textAlign: "center" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>
                    Loading timeline...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>
                    No projects found for the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList =
                    order.projects && order.projects.length > 0
                      ? order.projects
                      : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${proj?.id || pIdx}`}>
                            {/* ORDER ID (rowspan) */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle whitespace-nowrap"
                                style={{ fontWeight: 700 }}
                              >
                                #{order.order_number || order.order_id}
                              </td>
                            )}

                            {/* CUSTOMER (rowspan) */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle"
                                style={{ fontWeight: 700 }}
                              >
                                {order.customer_name}
                              </td>
                            )}

                            {/* PRODUCT NAME */}
                            <td
                              className="align-middle"
                              style={{ fontWeight: 700, fontSize: "0.78rem" }}
                            >
                              {proj ? proj.project_name : "—"}
                            </td>

                            {/* QTY */}
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* DESIGN DATE */}
                            <td className="align-middle text-xs text-slate-600 whitespace-nowrap">
                              {proj ? formatDateStyle(proj.design_date) : "—"}
                            </td>

                            {/* PRINTING DATE */}
                            <td className="align-middle text-xs text-slate-600 whitespace-nowrap">
                              {proj ? formatDateStyle(proj.printing_date) : "—"}
                            </td>

                            {/* COMMIT DATE (rowspan) */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle whitespace-nowrap text-xs text-slate-600"
                              >
                                {formatDateStyle(order.commit_date)}
                              </td>
                            )}

                            {/* DAYS LEFT (rowspan) */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                style={{ textAlign: "center" }}
                                className="align-middle"
                              >
                                <span
                                  className={
                                    order.days_left_to_complete < 0
                                      ? "text-rose-600 font-extrabold"
                                      : "text-slate-700 font-bold"
                                  }
                                >
                                  {order.days_left_to_complete !== undefined &&
                                  order.days_left_to_complete !== null
                                    ? `${order.days_left_to_complete}d`
                                    : "—"}
                                </span>
                              </td>
                            )}

                            {/* PROGRESS — 4 fixed positions */}
                            <td className="align-middle" style={{ minWidth: "140px" }}>
                              {proj ? (
                                <ProgressCell
                                  departments={proj.departments || []}
                                  currentDeptId={currentDeptId}
                                />
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </td>

                            {/* ORDER STATUS (rowspan) */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                style={{ textAlign: "center" }}
                                className="align-middle"
                              >
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                    order.order_status === "Delivered"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : order.order_status === "In Transit"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                      : order.order_status === "Packed"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : order.order_status === "Closed"
                                      ? "bg-slate-100 text-slate-500 border-slate-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {order.order_status || "Pending"}
                                </span>
                              </td>
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
              Showing page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong> ({totalCount} orders)
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
    </div>
  );
}
