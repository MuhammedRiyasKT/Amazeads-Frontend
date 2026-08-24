"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForProductionList, UserRole } from "../services/managerOrder.service";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignProductionTaskModal from "../components/AssignProductionTaskModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import styles from "../components/PMOrderComponents.module.css";

export default function PMProductionPage({ role = "project-manager" }: { role?: UserRole }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter State (Unassigned vs Assigned) 🌟
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false); // default: false (Unassigned)

  // Modals States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchProductionProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 ബാക്ക്-എൻഡ് നേരിട്ട് തരുന്ന Server-Side Pagination (1 പേജിൽ 5 ഓർഡറുകൾ)
      const data = await getProjectsForProductionList(currentPage, 5, taskFilter, role);
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
  }, [currentPage, taskFilter]);

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
      {/* Top Header */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className={styles.title}>Project For Production</h1>
          <p className={styles.subtitle}>Production line items mapped for framing, laser cutting and assembly.</p>
        </div>

        {/* 🌟 Task Assignment Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setTaskFilter(false); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${taskFilter === false ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Pending Assign
          </button>
          <button
            onClick={() => { setTaskFilter(true); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${taskFilter === true ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Assigned
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
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>Loading production items...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>No production items found for this filter.</td></tr>
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

                            {/* Product Name, Qty, Print Date (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
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

                            {/* Commit Date (RowSpan — merged per order) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.commit_date)}
                              </td>
                            )}

                            {/* Completed Date (RowSpan — merged per order) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.completion_date)}
                              </td>
                            )}

                            {/* Total Amount (RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* Actions (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
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

                                {proj && role === "project-manager" && taskFilter !== true && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderId(order.order_id || order.id);
                                      setSelectedProjectId(proj.id);
                                      setIsAssignOpen(true);
                                    }}
                                    className={styles.createIdBtn}
                                  >
                                    <Plus size={10} /> Assign Task
                                  </button>
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

        {/* 🌟 Pagination Footer Row */}
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

      {/* Project Specifications Modal */}
      <SalesProjectDetailsModal
        isOpen={isViewOpen}
        projectId={selectedProjectId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }}
      />

      {/* Production Task Assign Modal */}
      <AssignProductionTaskModal
        isOpen={isAssignOpen}
        orderId={selectedOrderId}
        projectId={selectedProjectId}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchProductionProjects();
        }}
      />
    </div>
  );
}