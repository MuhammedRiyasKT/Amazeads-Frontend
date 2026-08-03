"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForDesignList } from "../services/managerOrder.service";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignTaskModal from "../components/AssignTaskModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMDesignPage() {
  const [allGroupedOrders, setAllGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modals States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // 🌟 പ്രൊജക്റ്റുകളെ ഓർഡറുകൾ വെച്ച് പൂർണ്ണമായി മെർജ് ചെയ്യുന്ന ഫങ്ഷൻ
  const groupProjectsByOrder = (items: any[]) => {
    const grouped: Record<number, any> = {};

    items.forEach((item) => {
      const orderId = item.order_id;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          order_id: orderId,
          order_number: item.order_number,
          customer_name: item.customer_name || "—",
          order_date: item.order_date,
          design_date: item.design_date,
          order_status: item.order_status || item.status,
          projects: []
        };
      }

      const exists = grouped[orderId].projects.some((p: any) => p.id === item.id);
      if (!exists) {
        grouped[orderId].projects.push(item);
      }
    });

    return Object.values(grouped);
  };

  const fetchDesignProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 എല്ലാ പ്രൊഡക്റ്റുകളും ഒന്നിച്ച് എടുത്ത് ഓർഡർ വൈസ് ആക്കുന്നു
      const data = await getProjectsForDesignList(1, 100);
      const rawItems = data.items || [];

      const grouped = groupProjectsByOrder(rawItems);
      setAllGroupedOrders(grouped);
    } catch (err) {
      console.error("Error fetching PM Design queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignProjects();
  }, []);

  // 🌟 ഓർഡർ തലത്തിലുള്ള ഫ്രണ്ട്-എൻഡ് പേജിനേഷൻ (1 പേജിൽ 5 ഓർഡറുകൾ)
  const pageSize = 5;
  const totalCount = allGroupedOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentOrders = allGroupedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    const stylesMap: Record<string, string> = {
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-blue-50 text-blue-700 border-blue-200",
      Draft: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border inline-block ${stylesMap[status] || "bg-amber-50 text-amber-700 border-amber-200"}`}>
        {status || "Pending"}
      </span>
    );
  };

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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Products For Design</h1>
        <p className={styles.subtitle}>Schedules mapped for creative artwork and design layouts.</p>
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
                <th style={{ width: "100px" }}>DESIGN DATE</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "85px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "170px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading designs register...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No design files mapped for review.</td></tr>
              ) : (
                currentOrders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  const totalProjectsAmount = order.projects.reduce(
                    (sum: number, p: any) => sum + p.amount + (p.additional_amount || 0),
                    0
                  );

                  return (
                    <React.Fragment key={order.order_id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${proj?.id || pIdx}`}>
                            {/* Order ID & Customer (RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  #{order.order_number || order.order_id}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* Product Name, Qty, Design Date (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>
                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.design_date || order.design_date)}
                            </td>

                            {/* Total Amount (RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* Status (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {proj ? getStatusBadge(proj.status) : "—"}
                            </td>

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

                                {proj && (
                                  <button 
                                    onClick={() => { 
                                      setSelectedOrderId(order.order_id); 
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

        {/* 🌟 Pagination Footer Row (1 പേജിൽ കൂടുതൽ ഉള്ളപ്പോൾ മാത്രം കാണിക്കുന്നു) */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={pageSize} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      <SalesProjectDetailsModal 
        isOpen={isViewOpen} 
        projectId={selectedProjectId} 
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }} 
      />

      <AssignTaskModal 
        isOpen={isAssignOpen} 
        orderId={selectedOrderId} 
        projectId={selectedProjectId} 
        forceDepartmentType="designing" 
        onClose={() => setIsAssignOpen(false)} 
        onSuccess={() => { 
          setIsAssignOpen(false); 
          fetchDesignProjects(); 
        }} 
      />
    </div>
  );
}