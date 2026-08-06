"use client";

import React, { useEffect, useState } from "react";
import { Eye, Calendar, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getProjectsToPrintList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToPrintPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 ഡിഫോൾട്ട് ആയി ഇന്നത്തെ തീയതി (YYYY-MM-DD) ഫിൽട്ടറിനായി നൽകുന്നു
  const getTodayDateStr = () => new Date().toISOString().split("T")[0];
  const [printingDate, setPrintingDate] = useState<string>(getTodayDateStr());

  // 🌟 printing_task_assigned ഫിൽട്ടർ (default: false - Pending Assign)
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 Server-Side Pagination with printing_date & printing_task_assigned filters
      const data = await getProjectsToPrintList(currentPage, 5, printingDate, taskFilter);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching print queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, printingDate, taskFilter]);

  const handleResetFilters = () => {
    setPrintingDate(getTodayDateStr());
    setTaskFilter(false);
    setCurrentPage(1);
  };

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
      {/* Header & Filter Bar */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className={styles.title}>Projects to Print</h1>
          <p className={styles.subtitle}>Manage and track all order line items ready for the printing department.</p>
        </div>

        {/* 🌟 Printing Date (Default Today) & Task Assigned Filter Panel */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          
          {/* Printing Date Picker (Default Today) */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <Calendar size={13} className="text-indigo-600" />
            <span className="text-[10px] uppercase text-slate-400 font-bold">Print Date:</span>
            <input
              type="date"
              value={printingDate}
              onChange={(e) => { setPrintingDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Task Assigned Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => { setTaskFilter(false); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === false ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Pending Assign
            </button>
            <button
              onClick={() => { setTaskFilter(true); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === true ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Assigned
            </button>
            <button
              onClick={() => { setTaskFilter(undefined); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${taskFilter === undefined ? "bg-white text-indigo-700 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              All Items
            </button>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Reset Filters to Today"
          >
            <RotateCcw size={14} />
          </button>
        </div>
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
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No projects queued for selected date or filter.</td></tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  const totalProjectsAmount = order.projects 
                    ? order.projects.reduce((sum: number, p: any) => sum + (p.amount || 0) + (p.additional_amount || 0), 0)
                    : (order.final_amount || 0);

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.order_id || order.id}-${proj?.id || pIdx}`}>
                            {/* Order ID & Customer (RowSpan) */}
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  #{order.order_number || order.order_id || order.id}
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

        {/* 🌟 Pagination Footer Row */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination 
              total={totalCount} 
              limit={5} 
              activePage={currentPage} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
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