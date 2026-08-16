"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForLogisticsList } from "../services/managerOrder.service";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignLogisticsTaskModal from "../components/AssignLogisticsTaskModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import styles from "../components/PMOrderComponents.module.css";

export default function PMLogisticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false); // default: unassigned
  const [tasksCompletedFilter, setTasksCompletedFilter] = useState<boolean | undefined>(undefined);

  // Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);



  const fetchLogisticsProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 ബാക്ക്-എൻഡിൽ നിന്നുള്ള സ്വാഭാവിക Server-Side Pagination (1 പേജിൽ 5 ഓർഡറുകൾ)
      const data = await getProjectsForLogisticsList(currentPage, 5, taskFilter, tasksCompletedFilter);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching PM Logistics queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsProjects();
  }, [currentPage, taskFilter, tasksCompletedFilter]);

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
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className={styles.title}>Project To Logistics</h1>
          <p className={styles.subtitle}>Review items ready for courier, dispatch and final customer pickup.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setTaskFilter(false); setTasksCompletedFilter(undefined); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${taskFilter === false && tasksCompletedFilter === undefined ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Pending Assign
          </button>
          <button
            onClick={() => { setTaskFilter(undefined); setTasksCompletedFilter(true); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${tasksCompletedFilter === true ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
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
                <th style={{ width: "100px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "170px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading logistics queue...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No items found for this filter.</td></tr>
              ) : (
                orders.map((order, orderIdx) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

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

                            {/* Product Name & Qty */}
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

                            {/* Commit Date */}
                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.commit_date || order.commit_date || order.order_date)}
                            </td>

                            {/* Total Amount (RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                              </td>
                            )}



                            {/* Actions (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <button
                                    onClick={() => { setSelectedProjectId(proj.id); setIsViewOpen(true); }}
                                    className={styles.actionBtn}
                                    title="View Specifications"
                                  >
                                    <Eye size={13} />
                                  </button>
                                )}

                                {proj && taskFilter === false && (
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
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(page) => setCurrentPage(page)} />
          </div>
        )}
      </div>

      {/* Specifications Modal */}
      <SalesProjectDetailsModal
        isOpen={isViewOpen}
        projectId={selectedProjectId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }}
      />

      {/* Logistics Task Assign Modal */}
      <AssignLogisticsTaskModal
        isOpen={isAssignOpen}
        orderId={selectedOrderId}
        projectId={selectedProjectId}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchLogisticsProjects();
        }}
      />
    </div>
  );
}