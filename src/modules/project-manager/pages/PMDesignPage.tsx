"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import AssignTaskModal from "../components/AssignTaskModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMDesignPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modals States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchDesignProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(currentPage, 5);
      const list: any[] = [];
      const todayStr = new Date().toISOString().substring(0, 10); // '2026-07-28'

      (data.items || []).forEach((order: any) => {
        (order.projects || []).forEach((proj: any) => {
          list.push({
            ...proj,
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            order_date: order.order_date,
            final_amount: order.final_amount,
            order_status: order.order_status
          });
        });
      });

      // ഇന്നത്തെ ഡിസൈൻ പ്രൊജക്റ്റുകൾ മാത്രം ഫിൽട്ടർ ചെയ്യുന്നു
      const filteredOrders = (data.items || []).filter((item: any) => item.order_number !== null).map((order: any) => {
        const unassignedDesignProjects = (order.projects || []).filter(
          (p: any) => p.design_date === todayStr && (!p.departments || p.departments.every((d: any) => d.status === "Pending"))
        );
        return { ...order, projects: unassignedDesignProjects };
      }).filter((order: any) => order.projects.length > 0);

      setOrders(filteredOrders);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(filteredOrders.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignProjects();
  }, [currentPage]);

  const formatDateStyle = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Products For Design</h1>
        <p className={styles.subtitle}>Schedules mapped for today's creative artwork and design layouts.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th className={styles.borderCol}>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }} className={styles.borderRight}>QTY</th>
                <th style={{ width: "120px" }}>DATE</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "160px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading designs register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>No design files mapped for today's deadline.</td></tr>
              ) : (
                orders.map((order) => {
                  const projectsCount = order.projects.length;

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
                                  {order.order_number}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            <td className={styles.borderCol} style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td className={styles.borderRight} style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="align-middle text-xs font-semibold text-slate-600">
                                  {formatDateStyle(order.order_date)}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  ₹{order.final_amount.toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  <span className={`${styles.statusBadge} ${styles.badgeProject}`}>{order.order_status}</span>
                                </td>
                              </>
                            )}

                            <td>
                              <div className={styles.actionGroup}>
                                <button 
                                  onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                  className={styles.actionBtn}
                                >
                                  <Eye size={13} />
                                </button>
                                {proj && (
                                  <button 
                                    onClick={() => { 
                                      setSelectedOrderId(order.id); 
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
      </div>

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
      
      {/* allowedDepartments ഇവിടെ നിന്നും ഒഴിവാക്കി 🌟 */}
      <AssignTaskModal 
        isOpen={isAssignOpen} 
        orderId={selectedOrderId} 
        projectId={selectedProjectId} 
        forceDepartmentType="designing" 
        onClose={() => setIsAssignOpen(false)} 
        onSuccess={() => { setIsAssignOpen(false); fetchDesignProjects(); }} 
      />
    </div>
  );
}