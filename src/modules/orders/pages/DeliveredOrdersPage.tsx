"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, DollarSign, Eye } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getCourierOrders } from "@/modules/project-manager/services/courierTracking.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { useSalesStore } from "@/store/salesStore";
import { CATEGORY_IDS } from "@/constants/categories";
import { UserRole } from "@/modules/project-manager/services/managerOrder.service";

export function DeliveredOrdersPage({ role = "project-manager" }: { role?: UserRole }) {
  const pmCategory = useProjectManagerStore((s) => s.selectedCategory);
  const salesCategory = useSalesStore((s) => s.selectedCategory);
  const selectedCategory = role === "sales" ? salesCategory : pmCategory;
  const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getCourierOrders(currentPage, 5, "Delivered", { category_id: activeCategoryId }, "project-manager");
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || (data.items || []).length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeCategoryId]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{role === "sales" ? "Delivered Orders" : "Courier & Tracking — Delivered Orders"}</h1>
        <p className={styles.subtitle}>Read-only historical register of fully delivered customer orders.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Orders</span>
            <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Closed Revenue</span>
            <span className="text-lg font-extrabold text-slate-900">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Closed Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER NUMBER</th>
                <th style={{ width: "160px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "140px" }}>TRACKING ID</th>
                <th style={{ width: "140px" }}>DELIVERY TYPE</th>
                <th style={{ width: "120px", textAlign: "center" }}>FINAL AMOUNT</th>
                <th style={{ width: "140px", textAlign: "center" }}>DELIVERED STATUS</th>
                <th style={{ width: "120px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 font-semibold text-slate-500">Loading closed orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 font-semibold text-slate-500">No delivered orders found in history.</td></tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`} className="hover:bg-slate-50/80 transition-colors">
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle">
                                  #{order.order_number || order.id}
                                </td>
                                <td rowSpan={projectsCount} className="font-bold text-slate-800 align-middle">
                                  <div>{order.customer_name}</div>
                                  {order.customer_mobile_number && (
                                    <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                  )}
                                </td>
                              </>
                            )}

                            {/* Product Name (Clickable Timeline Dropdown) */}
                            <td
                              style={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                position: "relative",
                                zIndex: proj && selectedTimelineProjectId === (proj.id || proj.project_id) ? 50 : undefined
                              }}
                              className="align-middle"
                            >
                              <span
                                className={proj || order.id ? "cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block" : ""}
                                onClick={() => {
                                  const pId = proj?.id || proj?.project_id || order.project_id || order.id;
                                  if (pId) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === pId ? null : pId
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : order.product_name || "—"}
                              </span>

                              {(proj?.id || proj?.project_id || order.project_id || order.id) && selectedTimelineProjectId === (proj?.id || proj?.project_id || order.project_id || order.id) && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj?.id || proj?.project_id || order.project_id || order.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                  role={role}
                                />
                              )}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-mono text-slate-600 align-middle">{order.tracking_id || "—"}</td>
                                <td rowSpan={projectsCount} className="font-semibold text-slate-700 capitalize align-middle">{order.delivery_type_name || "—"}</td>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle">₹{(order.final_amount || 0).toLocaleString("en-IN")}</td>
                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                    <CheckCircle2 size={13} /> Delivered
                                  </span>
                                </td>
                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <div className="flex items-center justify-center">
                                    <button
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                                      title="View Order Details"
                                    >
                                      <Eye size={13} />
                                      <span>View More</span>
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

        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} role={role} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}

export default DeliveredOrdersPage;
