"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsToPrintList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToPrintPage() {
  const [allGroupedOrders, setAllGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // 🌟 ഫ്ലാറ്റ് പ്രൊജക്റ്റുകളെ ഓർഡറുകൾ വെച്ച് പൂർണ്ണമായി മെർജ് ചെയ്യുന്ന ഫങ്ഷൻ
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

      // ഡൂപ്ലിക്കേറ്റ് വരുന്നത് തടയുന്നു
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
      // 🌟 എല്ലാ പ്രൊഡക്റ്റുകളും ഒന്നിച്ച് എടുത്ത് ഓർഡർ വൈസ് ആക്കുന്നു
      const data = await getProjectsToPrintList(1, 100);
      const rawItems = data.items || [];

      const grouped = groupProjectsByOrder(rawItems);
      setAllGroupedOrders(grouped);
    } catch (err) {
      console.error("Error fetching print queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🌟 ഓർഡർ തലത്തിലുള്ള ഫ്രണ്ട്-എൻഡ് പേജിനേഷൻ കണക്കുകൂട്ടൽ (1 പേജിൽ 5 ഓർഡറുകൾ)
  const pageSize = 5;
  const totalCount = allGroupedOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // നിലവിലെ പേജിലെ 5 ഓർഡറുകൾ സ്ലൈസ് ചെയ്തെടുക്കുന്നു
  const currentOrders = allGroupedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th style={{ width: "150px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "100px" }}>PRINT DATE</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "180px", textAlign: "center" }}>DESIGNING STATUS</th>
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading pending print queue...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No projects queued for printing.</td></tr>
              ) : (
                currentOrders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  // ഓർഡറിലെ ആകെ തുക കണക്കാക്കുന്നു
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

                            {/* Product Name & Qty */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* Print Date */}
                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.printing_date || order.printing_date)}
                            </td>

                            {/* Total Amount (RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* Designing Status */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {proj ? getDesigningStatusBadge(proj.designing_status) : "—"}
                            </td>

                            {/* Action Button */}
                            <td className="align-middle">
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

        {/* 🌟 1 പേജിൽ കൂടുതൽ ഓർഡറുകൾ ഉണ്ടെങ്കിൽ മാത്രം പേജിനേഷൻ കാണിക്കുന്നു */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>Showing page {currentPage} of {totalPages} ({totalCount} orders)</div>
            <Pagination total={totalCount} limit={pageSize} activePage={currentPage} onPageChange={setCurrentPage} />
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