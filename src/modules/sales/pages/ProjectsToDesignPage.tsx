"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsToDesignList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToDesignPage() {
  const [allGroupedOrders, setAllGroupedOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ഫ്ലാറ്റ് പ്രൊജക്റ്റുകളെ ഓർഡറുകൾ വെച്ച് പൂർണ്ണമായി മെർജ് ചെയ്യുന്ന ഫങ്ഷൻ
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

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsToDesignList(1, 100);
      const rawItems = data.items || [];
      
      const grouped = groupProjectsByOrder(rawItems);
      setAllGroupedOrders(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ഓർഡർ തലത്തിലുള്ള ഫ്രണ്ട്-എൻഡ് പേജിനേഷൻ (1 പേജിൽ 5 ഓർഡറുകൾ)
  const pageSize = 5;
  const totalCount = allGroupedOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentOrders = allGroupedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    const stylesMap: Record<string, string> = {
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Draft: "bg-amber-50 text-amber-700 border-amber-100",
      Pending: "bg-amber-50 text-amber-700 border-amber-100",
      Completed: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border inline-block ${stylesMap[status] || "bg-amber-50 text-amber-700 border-amber-100"}`}>
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
        <h1 className={styles.title}>Projects to Design</h1>
        <p className={styles.subtitle}>Track and review all active product lines ready for the graphic designing queue.</p>
      </div>

      {/* Table Card */}
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
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading pending design queue...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No projects mapped for designing.</td></tr>
              ) : (
                currentOrders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  // ഓർഡർ ആകെ തുക
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
                            {/* 1. Order ID & Customer (RowSpan മെർജ് ചെയ്ത് കാണിക്കുന്നു) */}
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

                            {/* 2. Product Name, Qty, Design Date (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {proj ? proj.project_name : "—"}
                            </td>
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>
                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.design_date || order.design_date)}
                            </td>

                            {/* 3. Total Amount (RowSpan മെർജ് ചെയ്ത് കാണിക്കുന്നു) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* 🌟 4. STATUS കോളം: ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ നൽകി */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {proj ? getStatusBadge(proj.status) : "—"}
                            </td>

                            {/* 🌟 5. ACTIONS കോളം: ഓരോ പ്രൊഡക്റ്റിനും അതാതിന്റെ View Eye ബട്ടൺ നൽകി */}
                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <button 
                                    onClick={() => { setSelectedProjectId(proj.id); setIsViewOpen(true); }}
                                    className={styles.actionBtn}
                                    title="View product specifications"
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
            <div className={styles.resultsText}>Showing page {currentPage} of {totalPages} ({totalCount} orders)</div>
            <Pagination total={totalCount} limit={pageSize} activePage={currentPage} onPageChange={setCurrentPage} />
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