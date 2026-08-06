"use client";

import React, { useEffect, useState } from "react";
import { Eye, Filter, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getAllSalesProjects } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import ProjectProgressTimelineModal from "@/modules/project-manager/components/ProjectProgressTimelineModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function SalesProjectsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Filter States
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [designDate, setDesignDate] = useState<string>("");
  const [printingDate, setPrintingDate] = useState<string>("");
  const [commitDate, setCommitDate] = useState<string>("");
  const [completedDate, setCompletedDate] = useState<string>("");

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false); // Eye Icon Specifications Modal
  const [isTimelineOpen, setIsTimelineOpen] = useState(false); // Product Name Click Progress Timeline Modal

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = { page: currentPage, page_size: 5 };
      if (deptFilter) activeFilters.department_id = parseInt(deptFilter);
      if (designDate) activeFilters.design_date = designDate;
      if (printingDate) activeFilters.printing_date = printingDate;
      if (commitDate) activeFilters.commit_date = commitDate;
      if (completedDate) activeFilters.completed_date = completedDate;

      const data = await getAllSalesProjects(activeFilters);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching sales projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, deptFilter, designDate, printingDate, commitDate, completedDate]);

  const handleClearFilters = () => {
    setDeptFilter("");
    setDesignDate("");
    setPrintingDate("");
    setCommitDate("");
    setCompletedDate("");
    setCurrentPage(1);
  };

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
      {/* 🌟 Header Row with Title on Left & Department Tab Bar on Right */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className={styles.title}>All Projects Overview</h1>
          <p className={styles.subtitle}>Track active sales projects, department progress and commit deadlines.</p>
        </div>

        {/* 🌟 Department Filter Tab Switcher Bar */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setDeptFilter(""); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              deptFilter === "" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setDeptFilter("1"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              deptFilter === "1" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Designing
          </button>
          <button
            onClick={() => { setDeptFilter("2"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              deptFilter === "2" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Printing
          </button>
          <button
            onClick={() => { setDeptFilter("3"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              deptFilter === "3" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Production
          </button>
          <button
            onClick={() => { setDeptFilter("4"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              deptFilter === "4" ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Logistics
          </button>
        </div>
      </div>

      {/* 🌟 Date Filters Panel (Includes Completed Date) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
          <Filter size={14} className="text-indigo-600" /> Date Filters:
        </div>

        {/* Design Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Design:</span>
          <input
            type="date"
            value={designDate}
            onChange={(e) => { setDesignDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Print Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Print:</span>
          <input
            type="date"
            value={printingDate}
            onChange={(e) => { setPrintingDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Commit Date */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Commit:</span>
          <input
            type="date"
            value={commitDate}
            onChange={(e) => { setCommitDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* 🌟 Completed Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Completed:</span>
          <input
            type="date"
            value={completedDate}
            onChange={(e) => { setCompletedDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Reset Filters */}
        {(deptFilter || designDate || printingDate || commitDate || completedDate) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th style={{ width: "150px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "100px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>TOTAL</th>
                <th style={{ width: "85px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading sales projects...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No sales projects found for selected filters.</td></tr>
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

                            {/* 🌟 1. PRODUCT NAME CLICK: PROGRESS TIMELINE MODAL */}
                            <td 
                              style={{ fontWeight: 700, fontSize: "0.78rem" }} 
                              className="cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline"
                              onClick={() => {
                                if (proj) {
                                  setSelectedTimelineProjectId(proj.id);
                                  setIsTimelineOpen(true);
                                }
                              }}
                              title="Click to view department progress timeline"
                            >
                              {proj ? proj.project_name : "—"}
                            </td>

                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                              {formatDateStyle(proj?.commit_date || order.commit_date)}
                            </td>

                            {/* Total Amount (RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{totalProjectsAmount.toLocaleString("en-IN")}
                              </td>
                            )}

                            {/* Status */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {getStatusBadge(order.order_status || proj?.status)}
                            </td>

                            {/* 🌟 2. ACTIONS COLUMN: Eye Icon (Project Specifications View) */}
                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <button 
                                    onClick={() => { 
                                      setSelectedProjectId(proj.id); 
                                      setIsViewOpen(true); 
                                    }}
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

      {/* 🌟 1. Project Specifications Modal (Eye Icon Click) */}
      <SalesProjectDetailsModal 
        isOpen={isViewOpen} 
        projectId={selectedProjectId} 
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }} 
      />

      {/* 🌟 2. Progress Timeline Modal (Product Name Click) */}
      <ProjectProgressTimelineModal
        isOpen={isTimelineOpen}
        projectId={selectedTimelineProjectId}
        onClose={() => {
          setIsTimelineOpen(false);
          setSelectedTimelineProjectId(null);
        }}
      />
    </div>
  );
}