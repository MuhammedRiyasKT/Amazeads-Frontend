"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import CreateOrderIdModal from "../components/CreateOrderIdModal"; // 🌟 പുതിയ മോഡൽ ഇമ്പോർട്ട് ചെയ്തു
import styles from "../components/PMOrderComponents.module.css";

export default function PMNewOrdersPage() {
  const [allNewOrders, setAllNewOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal and Assignment States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchNewOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(1, 100);
      const filtered = (data.items || []).filter((item: any) => !item.order_number);
      setAllNewOrders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewOrders();
  }, []);

  const pageSize = 5;
  const totalCount = allNewOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentOrders = allNewOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>New Incoming Orders</h1>
        <p className={styles.subtitle}>Review new orders and assign custom production order numbers.</p>
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
                <th style={{ width: "150px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading incoming orders...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No new incoming orders awaiting IDs.</td></tr>
              ) : (
                currentOrders.map((order) => {
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
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle text-slate-400 text-center">
                                  —
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle capitalize">
                                  {order.created_by_name || "Aslam"}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  <span className={`${styles.statusBadge} ${styles.badgeOrder}`}>NEW ORDER</span>
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className={styles.actionGroup}>
                                    <button 
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                      className={styles.actionBtn}
                                      title="View order details"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button 
                                      onClick={() => { setSelectedOrderId(order.id); setIsAssignOpen(true); }}
                                      className={styles.createIdBtn}
                                    >
                                      <Plus size={10} /> Create ID
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} new orders)
            </div>
            <Pagination 
              total={totalCount} 
              limit={pageSize} 
              activePage={currentPage} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          </div>
        )}
      </div>

      {/* 🌟 1. Order ID Generation & Department Routing Modal */}
      <CreateOrderIdModal
        isOpen={isAssignOpen}
        orderId={selectedOrderId}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchNewOrders();
        }}
      />

      {/* 🌟 2. View Details Modal */}
      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}