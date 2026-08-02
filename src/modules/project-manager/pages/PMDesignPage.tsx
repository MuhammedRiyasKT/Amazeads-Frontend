"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsForDesignList } from "../services/managerOrder.service";
import SalesProjectDetailsModal from "@/modules/sales/components/SalesProjectDetailsModal";
import AssignTaskModal from "../components/AssignTaskModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMDesignPage() {
  const [groupedOrders, setGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modals States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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
      const data = await getProjectsForDesignList(currentPage, 5);
      const rawItems = data.items || [];

      const grouped = groupProjectsByOrder(rawItems);
      setGroupedOrders(grouped);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching PM Design queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignProjects();
  }, [currentPage]);

  // പ്രൊജക്റ്റിന്റെ വെവ്വേറെ സ്റ്റാറ്റസിനുള്ള ബാഡ്ജ് 🌟
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
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th className={styles.borderCol}>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }} className={styles.borderRight}>QTY</th>
                <th style={{ width: "120px" }}>DESIGN DATE</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "170px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading designs register...</td></tr>
              ) : groupedOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No design files mapped for review.</td></tr>
              ) : (
                groupedOrders.map((order) => {
                  const projectsCount = order.projects.length;

                  // ഓർഡറിന്റെ ആകെ തുക (Merged RowSpan ആയി കാണിക്കാൻ)
                  const totalProjectsAmount = order.projects.reduce(
                    (sum: number, p: any) => sum + p.amount + (p.additional_amount || 0),
                    0
                  );

                  return (
                    <React.Fragment key={order.order_id}>
                      {Array.from({ length: projectsCount }).map((_, pIdx) => {
                        const proj = order.projects?.[pIdx];
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${proj?.id || pIdx}`}>
                            {/* ORDER ID & CUSTOMER (Merged RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.order_number ? `#${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* PRODUCT, QTY, DESIGN DATE (ഓരോ പ്രൊജക്റ്റിനും വെവ്വേറെ) */}
                            <td className={styles.borderCol} style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td className={styles.borderRight} style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>
                            <td className="align-middle text-xs font-semibold text-slate-600">
                              {formatDateStyle(proj?.design_date || order.design_date)}
                            </td>

                            {/* TOTAL AMOUNT (Merged RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* 🌟 STATUS കോളം: ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെയായി ഇവിടെ നൽകിയിരിക്കുന്നു */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {proj ? getStatusBadge(proj.status) : "—"}
                            </td>

                            {/* ACTIONS (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td>
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

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={setCurrentPage} />
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