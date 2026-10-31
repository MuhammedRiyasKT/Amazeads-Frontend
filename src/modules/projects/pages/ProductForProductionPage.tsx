"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, X, RotateCcw, Check } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForProductionList, UserRole } from "@/modules/project-manager/services/managerOrder.service";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignProductionTaskModal from "@/modules/project-manager/components/AssignProductionTaskModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";
import { formatDateStyle } from "@/lib/formatDate";

export function ProductForProductionPage({ role = "project-manager" }: { role?: UserRole }) {
  const { selectedCategory } = useProjectManagerStore();
  const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Search & Filter States
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedCommitDate, setSelectedCommitDate] = useState<string | null>(null);
  const [selectedCompletionDate, setSelectedCompletionDate] = useState<string | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Check if project is assigned to production
  const isProductionTaskAssigned = (proj: any): boolean => {
    if (!proj) return false;
    if (taskFilter === true) return true;
    if (taskFilter === false) return false;

    // 1. Direct flags on project
    if (proj.production_task_assigned === true || proj.is_production_assigned === true) return true;
    if (proj.production_task_assigned === false) return false;

    // 2. Check departments array for Production (id: 3, name: "production")
    if (Array.isArray(proj.departments) && proj.departments.length > 0) {
      const dept = proj.departments.find(
        (d: any) =>
          d.department_id === 3 ||
          d.id === 3 ||
          d.department_name?.toLowerCase() === "production" ||
          d.name?.toLowerCase() === "production"
      );
      if (dept) {
        if (dept.task_assigned === true || dept.is_task_assigned === true) return true;
        if (dept.task_assigned === false || dept.is_task_assigned === false) return false;
        if (dept.staff_name || dept.assigned_to) return true;
        if (dept.final_status === true) return true;
        if (dept.status && dept.status.toLowerCase() !== "pending") return true;
      }
    }

    // 3. Fallback direct flags on project
    if (proj.task_assigned === true || proj.is_task_assigned === true) return true;
    if (proj.task_assigned === false || proj.is_task_assigned === false) return false;

    // 4. Check production status strings if present
    if (proj.production_status) {
      const s = proj.production_status.toLowerCase();
      if (s.includes("assigned") || s.includes("progress") || s.includes("completed")) {
        return true;
      }
      if (s.includes("pending") || s.includes("not assigned")) {
        return false;
      }
    }

    return false;
  };

  const fetchProductionProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsForProductionList(
        currentPage,
        5,
        taskFilter,
        role,
        activeCategoryId,
        debouncedSearch.trim() || undefined
      );
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching PM Production queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionProjects();
  }, [currentPage, taskFilter, selectedCategory, debouncedSearch, role]);

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setTaskFilter(false);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className={styles.title}>Project For Production</h1>
          <p className={styles.subtitle}>Production line items mapped for framing, laser cutting and assembly.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          {/* 🌟 Search across all text fields */}
          <div className="relative flex items-center min-w-[200px] sm:w-60">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, customer, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 h-8 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 transition-all shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => { setTaskFilter(false); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === false ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Pending Assign
            </button>
            <button
              onClick={() => { setTaskFilter(true); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === true ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Assigned
            </button>
            <button
              onClick={() => { setTaskFilter(undefined); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === undefined ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              All Items
            </button>
          </div>

          {(search || taskFilter !== false) && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th style={{ width: "150px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "100px" }}>PRINT DATE</th>
                <th style={{ width: "95px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "170px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>Loading production items...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>No production items found for this filter.</td></tr>
              ) : (
                orders.map((order, orderIdx) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  const orderFinalAmount = order.final_amount !== undefined && order.final_amount !== null
                    ? Number(order.final_amount)
                    : (order.total_amount !== undefined && order.total_amount !== null ? Number(order.total_amount) : 0);

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id || order.id}-${proj?.id || pIdx}`}>
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  #{order.order_number || order.order_id || order.id}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            <td
                              style={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                position: "relative",
                                zIndex: selectedTimelineProjectId === proj.id ? 50 : undefined
                              }}
                              className="align-middle"
                            >
                              <span
                                className="cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block"
                                onClick={(e) => {
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
                                />
                              )}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>
                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.printing_date || order.printing_date)}
                            </td>

                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.commit_date)}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.completion_date)}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{orderFinalAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <button
                                    onClick={() => {
                                      setSelectedProjectId(proj.id);
                                      setIsViewOpen(true);
                                    }}
                                    className={styles.actionBtn}
                                    title="View Project Specifications"
                                  >
                                    <Eye size={13} />
                                  </button>
                                )}

                                {proj && role === "project-manager" && (
                                  isProductionTaskAssigned(proj) ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
                                      <Check size={11} className="stroke-[2.5]" /> Assigned
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedOrderId(order.order_id || order.id);
                                        setSelectedProjectId(proj.id);
                                        setSelectedCommitDate(order.commit_date || null);
                                        setSelectedCompletionDate(order.completion_date || null);
                                        setIsAssignOpen(true);
                                      }}
                                      className={styles.createIdBtn}
                                    >
                                      <Plus size={10} /> Assign Task
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
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

      <SalesProjectDetailsModal
        isOpen={isViewOpen}
        projectId={selectedProjectId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }}
      />

      <AssignProductionTaskModal
        isOpen={isAssignOpen}
        orderId={selectedOrderId}
        projectId={selectedProjectId}
        commitDate={selectedCommitDate}
        completionDate={selectedCompletionDate}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchProductionProjects();
        }}
      />
    </div>
  );
}

export default ProductForProductionPage;
