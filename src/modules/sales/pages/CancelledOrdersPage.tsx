"use client";

import React, { useEffect, useState } from "react";
import { Eye, XCircle, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import Pagination from "@/components/ui/Pagination";
import ViewOrderModal from "../components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import styles from "../components/OrderListComponents.module.css";

interface CancelledOrdersPageProps {
  role?: "sales" | "admin" | "project-manager" | "manager";
}

export default function CancelledOrdersPage({ role = "sales" }: CancelledOrdersPageProps) {
  const { selectedCategory } = useProjectManagerStore();
  const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // View modal state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Timeline dropdown state
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  const fetchCancelledOrders = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/${role}/orders`, {
        params: {
          page,
          page_size: 5,
          order_status: "Cancel",
          category_id: activeCategoryId,
        },
      });

      const data = response.data;
      const items = data.items || [];
      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching cancelled orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders(currentPage);
  }, [currentPage, role, selectedCategory]);

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const formatDateStyle = (dateStr?: string) => {
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
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Cancel Orders</h1>
          <p className={styles.subtitle}>
            Historical register of all cancelled customer and production orders.
          </p>
        </div>

        {/* Total Cancelled Badge */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-rose-700 font-extrabold text-xs self-start sm:self-auto">
          <XCircle size={16} />
          <span>Total Cancelled: {totalCount}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "95px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                <th style={{ width: "100px" }}>FINAL AMT</th>
                <th style={{ width: "90px", textAlign: "center" }}>ORDER STATUS</th>
                <th style={{ width: "70px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px" }} className="text-slate-500 font-semibold">
                    Loading cancelled orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "32px" }} className="text-slate-500 font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="text-slate-400" size={24} />
                      <span>No cancelled order records found.</span>
                    </div>
                  </td>
                </tr>
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
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  {order.order_number ? `#${order.order_number}` : `#${order.id}`}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="font-bold text-slate-800">{order.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                </td>
                              </>
                            )}

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
                                  role={role}
                                />
                              )}
                            </td>

                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                  {formatDateStyle(order.commit_date || "")}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                  {formatDateStyle(order.completion_date || "")}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle font-bold text-slate-700">
                                  <span className="px-2.5 py-1 text-[10px] rounded-lg bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider font-extrabold inline-block">
                                    {order.order_status || "Cancel"}
                                  </span>
                                </td>

                                {/* ACTION COLUMN */}
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
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

      {/* Details Modal */}
      <ViewOrderModal
        isOpen={isViewOpen}
        orderId={selectedOrderId}
        role={role}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedOrderId(null);
        }}
      />
    </div>
  );
}
