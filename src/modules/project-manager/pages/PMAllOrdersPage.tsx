"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import styles from "../components/PMOrderComponents.module.css"; // പുതിയ സി.എസ്.എസ് മോഡ്യൂൾ ഇമ്പോർട്ട് ചെയ്തു 🌟

export default function PMAllOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(currentPage, 5);
      setOrders(data.items || []);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [currentPage]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>All Production Orders</h1>
        <p className={styles.subtitle}>Full historical audit list of active and locked production orders.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "130px" }}>CREATED BY</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "110px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading production register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No orders found in database.</td></tr>
              ) : (
                orders.map((order) => {
                  const isProject = order.order_number !== null;
                  const projectsCount = order.projects && order.projects.length > 0 ? order.projects.length : 1;

                  return (
                    <React.Fragment key={order.id}>
                      {Array.from({ length: projectsCount }).map((_, pIdx) => {
                        const proj = order.projects?.[pIdx];
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${pIdx}`}>
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.order_number ? `${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            <td style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  ₹{order.final_amount.toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle capitalize">
                                  {order.created_by_name || "Aslam"}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  {isProject ? (
                                    <span className={`${styles.statusBadge} ${styles.badgeProject}`}>PROJECT</span>
                                  ) : (
                                    <span className={`${styles.statusBadge} ${styles.badgeOrder}`}>ORDER</span>
                                  )}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className={styles.actionGroup}>
                                    <button 
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                      className={styles.actionBtn}
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

        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}