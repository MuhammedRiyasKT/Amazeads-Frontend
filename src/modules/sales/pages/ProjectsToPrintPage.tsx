"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsToPrintList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToPrintPage() {
  const [groupedOrders, setGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // 🌟 ഫ്ലാറ്റ് എപിഐ അറേ ഡാറ്റയെ Order ID വെച്ച് ഗ്രൂപ്പ് ചെയ്യുകയും ഡൂപ്ലിക്കേഷൻ ഒഴിവാക്കുകയും ചെയ്യുന്ന ഫങ്ഷൻ
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
          printing_date: item.printing_date,
          order_status: item.order_status || item.status,
          projects: []
        };
      }

      // ഒരേ പ്രൊജക്റ്റ് ID ഡൂപ്ലിക്കേറ്റ് ആയി വരുന്നുണ്ടെങ്കിൽ അത് ഒഴിവാക്കുന്നു
      const existingProject = grouped[orderId].projects.find((p: any) => p.id === item.id);
      if (!existingProject) {
        grouped[orderId].projects.push(item);
      }
    });

    return Object.values(grouped);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsToPrintList(currentPage, 5);
      const rawItems = data.items || [];

      // പ്രൊജക്റ്റുകൾ ഓർഡർ അടിസ്ഥാനത്തിൽ മെർജ് ചെയ്യുന്നു
      const grouped = groupProjectsByOrder(rawItems);
      setGroupedOrders(grouped);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching print queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const getDesigningStatusBadge = (status: string) => {
    const stylesMap: Record<string, string> = {
      "design not completed": "bg-amber-50 text-amber-700 border-amber-200",
      "design not approved by customer": "bg-rose-50 text-rose-700 border-rose-200",
      "designing is not started": "bg-slate-100 text-slate-700 border-slate-200",
      "designing not needed": "bg-blue-50 text-blue-700 border-blue-200",
      "completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border inline-block capitalize ${stylesMap[status] || "bg-slate-50 text-slate-600"}`}>
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
        <h1 className={styles.title}>Projects to Print</h1>
        <p className={styles.subtitle}>Manage and track all order line items ready for the printing department.</p>
      </div>

      {/* Table Section */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th className={styles.borderCol}>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }} className={styles.borderRight}>QTY</th>
                <th style={{ width: "130px" }}>PRINT DATE</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "200px", textAlign: "center" }}>DESIGNING STATUS</th>
                <th style={{ width: "100px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading pending print queue...</td></tr>
              ) : groupedOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No projects queued for printing.</td></tr>
              ) : (
                groupedOrders.map((order) => {
                  const projectsCount = order.projects.length;

                  // ഓർഡറിലെ ആകെ തുക കണക്കാക്കുന്നു
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
                            {/* 🌟 ഒന്നാമത്തെ വരിയിൽ മാത്രം ORDER ID, CUSTOMER എന്നിവ മെർജ് ചെയ്ത് കാണിക്കുന്നു */}
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

                            {/* പ്രൊഡക്റ്റുകൾ ഓരോ വരിയായി */}
                            <td className={styles.borderCol} style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td className={styles.borderRight} style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* Print Date */}
                            <td className="align-middle text-xs font-semibold text-slate-600">
                              {formatDateStyle(proj?.printing_date || order.printing_date)}
                            </td>

                            {/* Total Amount (rowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* Designing Status */}
                            <td style={{ textAlign: "center" }}>
                              {proj ? getDesigningStatusBadge(proj.designing_status) : "—"}
                            </td>

                            {/* Action Button */}
                            <td>
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <button 
                                    onClick={() => { setSelectedProjectId(proj.id); setIsViewOpen(true); }}
                                    className={styles.actionBtn}
                                    title="View specifications"
                                  >
                                    <Eye size={13} />
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

      {/* Modal */}
      <SalesProjectDetailsModal 
        isOpen={isViewOpen} 
        projectId={selectedProjectId} 
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }} 
      />
    </div>
  );
}