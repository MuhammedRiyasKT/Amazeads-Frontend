"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { getPMOrders, assignOrderNumber } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMNewOrdersPage() {
  const [allNewOrders, setAllNewOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal and Assignment States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState("");

  const fetchNewOrders = async () => {
    setIsLoading(true);
    try {
      // 🌟 പുതിയ എല്ലാ ഓർഡറുകളും ഫെച്ച് ചെയ്യുന്നു (page_size=100)
      const data = await getPMOrders(1, 100);
      
      // Order ID (order_number) ഇല്ലാത്ത പുതിയ ഓർഡറുകൾ മാത്രം ഫിൽട്ടർ ചെയ്യുന്നു
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

  // 🌟 ഓർഡർ തലത്തിലുള്ള ഫ്രണ്ട്-എൻഡ് പേജിനേഷൻ (1 പേജിൽ 5 പുതിയ ഓർഡറുകൾ)
  const pageSize = 5;
  const totalCount = allNewOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // നിലവിലെ പേജിലെ 5 പുതിയ ഓർഡറുകൾ സ്ലൈസ് ചെയ്തെടുക്കുന്നു
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

        {/* 🌟 1 പേജിൽ കൂടുതൽ ഓർഡറുകൾ ഉള്ളപ്പോൾ മാത്രം (< 1 2 >) ബട്ടണുകൾ കൃത്യമായി കാണിക്കുന്നു */}
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

      {/* Order ID Generation Dialog Modal */}
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