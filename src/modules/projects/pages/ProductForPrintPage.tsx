"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus, Calendar, RotateCcw, AlertTriangle, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForPrintList, UserRole } from "@/modules/project-manager/services/managerOrder.service";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignPrintingTaskModal from "@/modules/project-manager/components/AssignPrintingTaskModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import PMUpdateDatesModal from "@/modules/project-manager/components/PMUpdateDatesModal";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";

export function ProductForPrintPage({ role = "project-manager" }: { role?: UserRole }) {
  const { selectedCategory } = useProjectManagerStore();
  const activeCategoryId =
    role === "admin" || role === "manager" ? undefined : selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayDateStr = () => new Date().toISOString().split("T")[0];

  const [printingDate, setPrintingDate] = useState<string>(getTodayDateStr());
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [selectedDatesProject, setSelectedDatesProject] = useState<{
    projectId: number;
    projectName: string;
    currentDesignDate: string | null;
    currentPrintingDate: string | null;
    commitDate: string | null;
    completionDate: string | null;
  } | null>(null);

  const [paymentWarning, setPaymentWarning] = useState<{
    isOpen: boolean;
    orderId: number | null;
    projectId: number | null;
    status: string;
  }>({
    isOpen: false,
    orderId: null,
    projectId: null,
    status: "",
  });

  const fetchPrintProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsForPrintList(currentPage, 5, printingDate, taskFilter, role, activeCategoryId);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching PM Print queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintProjects();
  }, [currentPage, printingDate, taskFilter, selectedCategory]);

  const handleResetFilters = () => {
    setPrintingDate(getTodayDateStr());
    setTaskFilter(false);
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
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className={styles.title}>Products For Print</h1>
          <p className={styles.subtitle}>Production files mapped for UV, Laser & Photo printing deadlines.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <Calendar size={13} className="text-indigo-600" />
            <span className="text-[10px] uppercase text-slate-400 font-bold">Print Date:</span>
            <input
              type="date"
              value={printingDate}
              onChange={(e) => { setPrintingDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => { setTaskFilter(false); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === false ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Pending Assign
            </button>
            <button
              onClick={() => { setTaskFilter(true); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === true ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Assigned
            </button>
          </div>

          <button
            onClick={handleResetFilters}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Reset Filters to Today"
          >
            <RotateCcw size={14} />
          </button>
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
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>Loading printing sheets...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>No printing templates mapped for selected date or filter.</td></tr>
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
                            <td className="align-middle whitespace-nowrap text-xs text-slate-655">
                              {proj && role === "project-manager" ? (
                                <button
                                  type="button"
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
                                  className="hover:text-indigo-650 flex items-center gap-1 font-semibold cursor-pointer border-none bg-transparent"
                                  title="Click to update project dates"
                                >
                                  <Calendar size={11} className="text-slate-400 shrink-0" />
                                  {formatDateStyle(proj?.printing_date || order.printing_date)}
                                </button>
                              ) : (
                                formatDateStyle(proj?.printing_date || order.printing_date)
                              )}
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
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

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
                                      title="View Project Specifications"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    {role === "project-manager" && (
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
                                        <Calendar size={13} className="text-slate-500" />
                                      </button>
                                    )}
                                  </div>
                                )}

                                {proj && role === "project-manager" && taskFilter !== true && (
                                  (proj.designing_status?.toLowerCase().includes("not approved") ||
                                    proj.designing_status?.toLowerCase() === "design not approved by customer" ||
                                    proj.designing_status?.toLowerCase() === "design not completed") ? (
                                    <button
                                      disabled
                                      className={`${styles.createIdBtn} opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200`}
                                      title={
                                        proj.designing_status?.toLowerCase() === "design not completed"
                                          ? "Cannot assign to printing: Design is not completed"
                                          : "Cannot assign to printing: Design is not approved by customer"
                                      }
                                      style={{ pointerEvents: "auto" }}
                                    >
                                      <Plus size={10} /> Assign Task
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const pStatus = order.payment_status?.toLowerCase();
                                        if (pStatus === "partial" || pStatus === "not paid") {
                                          setPaymentWarning({
                                            isOpen: true,
                                            orderId: order.order_id || order.id,
                                            projectId: proj.id,
                                            status: pStatus,
                                          });
                                        } else {
                                          setSelectedOrderId(order.order_id || order.id);
                                          setSelectedProjectId(proj.id);
                                          setIsAssignOpen(true);
                                        }
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

      <AssignPrintingTaskModal
        isOpen={isAssignOpen}
        orderId={selectedOrderId}
        projectId={selectedProjectId}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchPrintProjects();
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
          fetchPrintProjects();
        }}
      />

      {paymentWarning.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">

            <div className="flex items-center justify-between px-6 py-4 border-b bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={18} />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase leading-tight">
                  Payment Status Warning
                </h3>
              </div>
              <button
                onClick={() => setPaymentWarning({ isOpen: false, orderId: null, projectId: null, status: "" })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {paymentWarning.status === "partial" ? (
                  <>
                    Warning: The payment status for this order is <span className="text-amber-600 font-extrabold">Partial</span>.
                    Only advance payment has been received, and the balance is still pending.
                  </>
                ) : (
                  <>
                    Warning: The payment status for this order is <span className="text-rose-600 font-extrabold">Pending</span>.
                    No payment has been received yet.
                  </>
                )}
              </p>
              <p className="text-xs text-slate-500 mt-3 font-medium">
                Do you want to proceed with assigning this printing task anyway?
              </p>
            </div>

            <div className="px-6 py-3 border-t bg-slate-50/30 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setPaymentWarning({ isOpen: false, orderId: null, projectId: null, status: "" })}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { orderId, projectId } = paymentWarning;
                  setPaymentWarning({ isOpen: false, orderId: null, projectId: null, status: "" });
                  setSelectedOrderId(orderId);
                  setSelectedProjectId(projectId);
                  setIsAssignOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors shadow-sm"
              >
                Yes, Proceed
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ProductForPrintPage;
