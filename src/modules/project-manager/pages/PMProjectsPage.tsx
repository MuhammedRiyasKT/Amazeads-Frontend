"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus, Filter, RotateCcw, Calendar } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getAllPMProjects, UserRole } from "../services/managerOrder.service";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import AssignMultiDeptTaskModal from "../components/AssignMultiDeptTaskModal";
import ProjectDeptStatusModal from "../components/ProjectDeptStatusModal";
import PMUpdateDatesModal from "../components/PMUpdateDatesModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMProjectsPage({ role = "project-manager" }: { role?: UserRole }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Filter States
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [designDate, setDesignDate] = useState<string>("");
  const [printingDate, setPrintingDate] = useState<string>("");
  const [commitDate, setCommitDate] = useState<string>("");
  const [completedDate, setCompletedDate] = useState<string>("");

  // Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("");
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeptStatusOpen, setIsDeptStatusOpen] = useState(false);

  // Update dates modal state
  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [selectedDatesProject, setSelectedDatesProject] = useState<{
    projectId: number;
    projectName: string;
    currentDesignDate: string | null;
    currentPrintingDate: string | null;
    commitDate: string | null;
    completionDate: string | null;
  } | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = { page: currentPage, page_size: 5, order_status: "In Progress" };
      if (deptFilter) activeFilters.department_id = parseInt(deptFilter);
      if (designDate) activeFilters.design_date = designDate;
      if (printingDate) activeFilters.printing_date = printingDate;
      if (commitDate) activeFilters.commit_date = commitDate;
      if (completedDate) activeFilters.completed_date = completedDate;

      const data = await getAllPMProjects(activeFilters, role);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching PM projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, deptFilter, designDate, printingDate, commitDate, completedDate]);

  const handleClearFilters = () => {
    setDeptFilter("");
    setDesignDate("");
    setPrintingDate("");
    setCommitDate("");
    setCompletedDate("");
    setCurrentPage(1);
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

  return (
    <div className={styles.container}>
      {/* 🌟 Header Row with Title on Left & Department Tab Bar on Right */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className={styles.title}>All Projects Dashboard</h1>
          <p className={styles.subtitle}>Track department progress, workflow timelines and assign multi-department tasks.</p>
        </div>

        {/* 🌟 Department Filter Tab Switcher Bar */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setDeptFilter(""); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deptFilter === "" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            All
          </button>
          <button
            onClick={() => { setDeptFilter("1"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deptFilter === "1" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Designing
          </button>
          <button
            onClick={() => { setDeptFilter("2"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deptFilter === "2" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Printing
          </button>
          <button
            onClick={() => { setDeptFilter("3"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deptFilter === "3" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Production
          </button>
          <button
            onClick={() => { setDeptFilter("4"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deptFilter === "4" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Logistics
          </button>
        </div>
      </div>

      {/* 🌟 Date Filters Panel (Includes Completed Date) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
          <Filter size={14} className="text-indigo-600" /> Date Filters:
        </div>

        {/* Design Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Design:</span>
          <input
            type="date"
            value={designDate}
            onChange={(e) => { setDesignDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Print Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Print:</span>
          <input
            type="date"
            value={printingDate}
            onChange={(e) => { setPrintingDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Commit Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Commit:</span>
          <input
            type="date"
            value={commitDate}
            onChange={(e) => { setCommitDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* 🌟 Completed Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Completed:</span>
          <input
            type="date"
            value={completedDate}
            onChange={(e) => { setCompletedDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Reset Filters */}
        {(deptFilter || designDate || printingDate || commitDate || completedDate) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th style={{ width: "135px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "115px" }}>COMPLETION DATE</th>
                <th style={{ width: "85px", textAlign: "center" }}>DAYS LEFT</th>
                <th style={{ width: "130px", textAlign: "center" }}>PROGRESS</th>
                <th style={{ width: "85px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "155px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>Loading projects register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>No projects found for selected filters.</td></tr>
              ) : (
                orders.map((order, orderIdx) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  const totalProjectsAmount = order.projects
                    ? order.projects.reduce((sum: number, p: any) => sum + (p.amount || 0) + (p.additional_amount || 0), 0)
                    : (order.final_amount || 0);

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id || order.id}-${proj?.id || pIdx}`}>
                            {/* Order ID & Customer (RowSpan) */}
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

                            {/* PRODUCT NAME CLICK: PROGRESS TIMELINE DROPDOWN */}
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

                            {/* Completed Date (RowSpan — merged per order) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.completion_date)}
                              </td>
                            )}

                            {/* Days Left to Complete (RowSpan — merged per order) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                <span className={order.days_left_to_complete < 0 ? "text-rose-600 font-extrabold" : "text-slate-700 font-bold"}>
                                  {order.days_left_to_complete !== undefined && order.days_left_to_complete !== null
                                    ? `${order.days_left_to_complete}d`
                                    : "—"}
                                </span>
                              </td>
                            )}

                            {/* Progress — 4 fixed positions, blank if not assigned */}
                            <td className="align-middle" style={{ minWidth: "140px" }}>
                              {(() => {
                                const depts = proj?.departments || [];

                                const deptConfig = [
                                  { id: 1, label: "DS" },
                                  { id: 2, label: "PR" },
                                  { id: 3, label: "PD" },
                                  { id: 4, label: "LG" },
                                ];

                                return (
                                  <div className="flex items-center justify-center py-0.5">
                                    <div className="flex items-center gap-1 text-[11px] font-bold">
                                      {deptConfig.map(({ id, label }, idx) => {
                                        const d = depts.find((x: any) => x.department_id === id || x.id === id);
                                        const isAssigned = d?.is_assigned === true;
                                        const isDone = d?.final_status === true;

                                        // prev slot-ന്റെ status (connector color-നു വേണ്ടി)
                                        const prevD = idx > 0 ? depts.find((x: any) => x.department_id === deptConfig[idx - 1].id || x.id === deptConfig[idx - 1].id) : null;
                                        const prevAssigned = prevD?.is_assigned === true;
                                        const prevDone = prevD?.final_status === true;

                                        return (
                                          <React.Fragment key={id}>
                                            {/* Connector — always show, green only if both sides done */}
                                            {idx > 0 && (
                                              <span className={`w-3.5 h-[1.5px] -translate-y-[4px] ${prevAssigned && isAssigned && prevDone && isDone ? "bg-emerald-500" : "bg-slate-200"}`} />
                                            )}
                                            <div className="flex flex-col items-center w-5">
                                              {isAssigned ? (
                                                <span className={isDone ? "text-emerald-600 font-extrabold" : "text-rose-500 font-extrabold"}>
                                                  {isDone ? "✓" : "✕"}
                                                </span>
                                              ) : (
                                                // blank slot — empty space, label faded
                                                <span className="text-transparent select-none">–</span>
                                              )}
                                              <span className={`text-[8px] font-extrabold mt-1 leading-none ${isAssigned ? "text-slate-500" : "text-slate-200"}`}>
                                                {label}
                                              </span>
                                            </div>
                                          </React.Fragment>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Status (RowSpan — merged per order) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${order.order_status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  order.order_status === "In Transit" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                    order.order_status === "Packed" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                      order.order_status === "Closed" ? "bg-slate-100 text-slate-500 border-slate-200" :
                                        "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}>
                                  {order.order_status || "Pending"}
                                </span>
                              </td>
                            )}

                            {/* ACTIONS COLUMN */}
                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <div className="flex gap-1.5 align-middle shrink-0">
                                    <button
                                      onClick={() => {
                                        setSelectedProjectId(proj.id);
                                        setIsViewOpen(true);
                                      }}
                                      className={styles.actionBtn}
                                      title="View Project Specifications & Images"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedDatesProject({
                                          projectId: proj.id,
                                          projectName: proj.project_name,
                                          currentDesignDate: proj.design_date || order.design_date,
                                          currentPrintingDate: proj.printing_date || order.printing_date,
                                          commitDate: order.commit_date,
                                          completionDate: order.completion_date,
                                        });
                                        setIsDatesModalOpen(true);
                                      }}
                                      className={styles.actionBtn}
                                      title="Edit target dates"
                                    >
                                      <Calendar size={13} />
                                    </button>
                                  </div>
                                )}

                                {proj && role === "project-manager" && order.order_status !== "Packed" && order.order_status !== "Closed" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderId(order.order_id || order.id);
                                      setSelectedProjectId(proj.id);
                                      setSelectedProjectName(proj.project_name || "");
                                      setSelectedOrderNumber(order.order_number || "");
                                      setSelectedPaymentStatus(order.payment_status || "");
                                      setIsDeptStatusOpen(true);
                                    }}
                                    className={styles.createIdBtn}
                                  >
                                    <Plus size={10} /> Assign
                                  </button>
                                ) : proj && (
                                  <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-400 border border-slate-200 italic">
                                    {order.order_status}
                                  </span>
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

        {/* Pagination Footer Row */}
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

      {/* Modals */}
      <SalesProjectDetailsModal
        isOpen={isViewOpen}
        projectId={selectedProjectId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }}
      />

      {/* Department Status + Assign Modal */}
      <ProjectDeptStatusModal
        isOpen={isDeptStatusOpen}
        orderId={selectedOrderId}
        projectId={selectedProjectId}
        projectName={selectedProjectName}
        orderNumber={selectedOrderNumber}
        paymentStatus={selectedPaymentStatus}
        onClose={() => {
          setIsDeptStatusOpen(false);
          setSelectedOrderId(null);
          setSelectedProjectId(null);
          setSelectedPaymentStatus("");
        }}
        onSuccess={() => {
          setIsDeptStatusOpen(false);
          setSelectedPaymentStatus("");
          fetchProjects();
        }}
      />

      <PMUpdateDatesModal
        isOpen={isDatesModalOpen}
        projectId={selectedDatesProject?.projectId || null}
        projectName={selectedDatesProject?.projectName}
        currentDesignDate={selectedDatesProject?.currentDesignDate || null}
        currentPrintingDate={selectedDatesProject?.currentPrintingDate || null}
        commitDate={selectedDatesProject?.commitDate || null}
        completionDate={selectedDatesProject?.completionDate || null}
        onClose={() => {
          setIsDatesModalOpen(false);
          setSelectedDatesProject(null);
        }}
        onSuccess={() => {
          setIsDatesModalOpen(false);
          setSelectedDatesProject(null);
          fetchProjects();
        }}
      />
    </div>
  );
}