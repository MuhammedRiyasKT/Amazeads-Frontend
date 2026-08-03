"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import styles from "../components/PMOrderComponents.module.css";

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
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th style={{ width: "150px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "110px" }}>CREATED BY</th>
                <th style={{ width: "85px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading production register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No orders found in database.</td></tr>
              ) : (
                orders.map((order) => {
                  const isProject = order.order_number !== null;
                  
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
                                {/* 🌟 order_number ഉണ്ടെങ്കിൽ മാത്രം കാണിക്കുന്നു, ഇല്ലെങ്കിൽ '—' എന്ന് കൊടുക്കുന്നു */}
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap text-center text-slate-400">
                                  {order.order_number ? `#${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* Product & Qty */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* Total, Created By, Status & Actions (RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
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

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}