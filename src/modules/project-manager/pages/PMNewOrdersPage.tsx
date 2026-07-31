"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { getPMOrders, assignOrderNumber } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import styles from "../components/PMOrderComponents.module.css"; // പുതിയ സി.എസ്.എസ് മോഡ്യൂൾ ഇമ്പോർട്ട് ചെയ്തു 🌟

export default function PMNewOrdersPage() {
  const [currentManagerId] = useState(3);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal and Assignment States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState("");

  const fetchNewOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(currentPage, 10);
      const filtered = (data.items || []).filter((item: any) => !item.order_number);
      setOrders(filtered);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(filtered.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewOrders();
  }, [currentPage]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !newOrderNumber.trim()) return;

    try {
      await assignOrderNumber(selectedOrderId, newOrderNumber.trim());
      alert("Order ID assigned successfully!");
      setIsAssignOpen(false);
      setNewOrderNumber("");
      setSelectedOrderId(null);
      fetchNewOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to assign Order ID");
    }
  };

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
                <th style={{ width: "100px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "130px" }}>CREATED BY</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "160px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading incoming orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No new incoming orders awaiting IDs.</td></tr>
              ) : (
                orders.map((order) => {
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
                                  —
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
                                  <span className={`${styles.statusBadge} ${styles.badgeOrder}`}>ORDER</span>
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className={styles.actionGroup}>
                                    <button 
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                      className={styles.actionBtn}
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
      </div>

      {/* 3. ORDER ID (Order Number) പാച്ച് ചെയ്യാനുള്ള പോപ്പ്-അപ്പ് മോഡൽ 🌟 */}
      {isAssignOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Generate Order ID</h3>
              <button onClick={() => setIsAssignOpen(false)} className={styles.modalCloseBtn}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssignSubmit} className={styles.modalContent}>
              <div className={styles.formCol}>
                <label className={styles.formLabel}>Production Order Number</label>
                <input
                  type="text"
                  placeholder="e.g. 123, SO-98419..."
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Create Order ID</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}