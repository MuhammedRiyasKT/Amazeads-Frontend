"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getProjectsToDesignList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToDesignPage() {
  const [groupedOrders, setGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ഫ്ലാറ്റ് എപിഐ അറേ ഡാറ്റയെ ഓർഡർ വൈസ് ആയി ഗ്രൂപ്പ് ചെയ്യാനുള്ള ഫ്രണ്ട്-എൻഡ് ഹെൽപ്പർ
  const groupProjectsByOrder = (items: any[]) => {
    const grouped: Record<number, any> = {};
    
    items.forEach((item) => {
      const orderId = item.order_id;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          order_id: orderId,
          order_number: item.order_number,
          customer_name: item.customer_name || "Rahul Nair",
          order_date: item.order_date || item.commit_date,
          design_date: item.design_date, // 🌟 Updated: Added design_date
          order_status: item.order_status || item.status,
          projects: []
        };
      }
      grouped[orderId].projects.push(item);
    });
    
    return Object.values(grouped);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsToDesignList(currentPage, 5);
      const rawItems = data.items || [];
      
      const grouped = groupProjectsByOrder(rawItems);
      setGroupedOrders(grouped);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const stylesMap: Record<string, string> = {
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Draft: "bg-amber-50 text-amber-700 border-amber-100",
      Pending: "bg-amber-50 text-amber-700 border-amber-100",
      Completed: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${stylesMap[status] || "bg-slate-50"}`}>
        {status}
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
        <h1 className={styles.title}>Projects to Design</h1>
        <p className={styles.subtitle}>Track and review all active product lines ready for the graphic designing queue.</p>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th className={styles.borderCol}>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }} className={styles.borderRight}>QTY</th>
                <th style={{ width: "120px" }}>DESIGN DATE</th> {/* 🌟 Header text updated for clarity */}
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "110px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading pending design queue...</td></tr>
              ) : groupedOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No projects mapped for designing.</td></tr>
              ) : (
                groupedOrders.map((order) => {
                  const projectsCount = order.projects.length;

                  // ടേബിളിൽ ലിസ്റ്റ് ചെയ്തിരിക്കുന്ന പ്രൊഡക്റ്റുകളുടെ ആകെ തുക കാൽക്കുലേറ്റ് ചെയ്യുന്നു
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
                          <tr key={`${order.order_id}-${pIdx}`}>
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

                            {/* ഓരോ പ്രൊഡക്റ്റും വെവ്വേറെ വരികളായി */}
                            <td className={styles.borderCol} style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td className={styles.borderRight} style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* 🌟 1. order_date-ന് പകരം proj.design_date ഇവിടെ അപ്ഡേറ്റ് ചെയ്തു */}
                            <td className="align-middle text-xs font-semibold text-slate-600">
                              {formatDateStyle(proj?.design_date || order.design_date)}
                            </td>

                            {isFirstRow && (
                              /* 🌟 2. Total തുക മാത്രം rowSpan ആയി നിലനിർത്തി */
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* STATUS കോളം വെവ്വേറെ വരികളായി */}
                            <td style={{ textAlign: "center" }}>
                              {proj ? getStatusBadge(proj.status) : "—"}
                            </td>

                            {/* ACTIONS കോളം */}
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