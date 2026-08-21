"use client";

import React, { useEffect, useState } from "react";
import { Eye, Calendar, RotateCcw, Edit3 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useSalesStore } from "@/store/salesStore";
import { CATEGORY_IDS } from "@/constants/categories";
import { getProjectsToDesignList } from "../services/designApproval.service";
import SalesProjectDetailsModal from "../components/SalesProjectDetailsModal";
import UpdateProjectDatesModal from "../components/UpdateProjectDatesModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import styles from "../components/DesignApprovalComponents.module.css";

export default function ProjectsToDesignPage() {
  const { selectedCategory } = useSalesStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 ഡിഫോൾട്ട് ആയി ഇന്നത്തെ തീയതി (YYYY-MM-DD) ഫിൽട്ടറിനായി നൽകുന്നു
  const getTodayDateStr = () => new Date().toISOString().split("T")[0];
  const [designDate, setDesignDate] = useState<string>(getTodayDateStr());

  // 🌟 design_task_assigned ഫിൽട്ടർ (default: false - Pending Assign)
  const [taskFilter, setTaskFilter] = useState<boolean | undefined>(false);

  // Modal States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateDatesOpen, setIsUpdateDatesOpen] = useState(false);
  const [selectedUpdateProject, setSelectedUpdateProject] = useState<any>(null);
  const [selectedUpdateOrder, setSelectedUpdateOrder] = useState<any>(null);

  const isEditAllowed = (proj: any, order: any) => {
    const commitStr = proj?.commit_date || order?.commit_date;
    const completionStr = proj?.completed_date || order?.completion_date;
    if (!commitStr || !completionStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(commitStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(completionStr);
    end.setHours(0, 0, 0, 0);

    return today >= start && today <= end;
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 category_id 5-ാമത്തെ പെരാമീറ്റർ ആയി അയക്കുന്നു
      const categoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

      const data = await getProjectsToDesignList(
        currentPage,
        5,
        designDate,
        taskFilter,
        categoryId // 👈 categoryId ചേർത്തു
      );

      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching projects for design:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, designDate, taskFilter, selectedCategory]);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, designDate, taskFilter]);

  const handleResetFilters = () => {
    setDesignDate(getTodayDateStr());
    setTaskFilter(false);
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
      {/* Header & Filter Bar */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className={styles.title}>Projects to Design</h1>
          <p className={styles.subtitle}>Track and review all active product lines ready for the graphic designing queue.</p>
        </div>

        {/* 🌟 Design Date (Default Today) & Task Assigned Filter Panel */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">

          {/* Design Date Picker (Default Today) */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <Calendar size={13} className="text-indigo-600" />
            <span className="text-[10px] uppercase text-slate-400 font-bold">Design Date:</span>
            <input
              type="date"
              value={designDate}
              onChange={(e) => { setDesignDate(e.target.value); setCurrentPage(1); }}
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
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>Loading pending design queue...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>No projects mapped for selected date or filter.</td></tr>
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

                            {/* Product Name, Qty, Design Date (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td
                              style={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                position: "relative",
                                zIndex: selectedTimelineProjectId === proj.id ? 50 : undefined
                              }}
                              className="align-middle"
                            >
                              <span
                                className="cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block"
                                onClick={(e) => {
                                  if (proj) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === proj.id ? null : proj.id
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : "—"}
                              </span>

                              {proj && selectedTimelineProjectId === proj.id && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                />
                              )}
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

                            {/* Actions (ഓരോ പ്രൊഡക്റ്റിനും വെവ്വേറെ) */}
                            <td className="align-middle">
                              <div className={styles.actionGroup}>
                                {proj && (
                                  <>
                                    <button
                                      onClick={() => { setSelectedProjectId(proj.id); setIsViewOpen(true); }}
                                      className={styles.actionBtn}
                                      title="View product specifications"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (isEditAllowed(proj, order)) {
                                          setSelectedUpdateProject(proj);
                                          setSelectedUpdateOrder(order);
                                          setIsUpdateDatesOpen(true);
                                        }
                                      }}
                                      disabled={!isEditAllowed(proj, order)}
                                      className={`${styles.actionBtn} ${!isEditAllowed(proj, order)
                                          ? "opacity-45 cursor-not-allowed hover:bg-transparent text-slate-350"
                                          : ""
                                        }`}
                                      title={
                                        isEditAllowed(proj, order)
                                          ? "Edit schedule dates"
                                          : "Date updates only allowed between commit & completion dates"
                                      }
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  </>
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

      <SalesProjectDetailsModal
        isOpen={isViewOpen}
        projectId={selectedProjectId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProjectId(null);
        }}
      />

      <UpdateProjectDatesModal
        isOpen={isUpdateDatesOpen}
        project={selectedUpdateProject}
        order={selectedUpdateOrder}
        onClose={() => {
          setIsUpdateDatesOpen(false);
          setSelectedUpdateProject(null);
          setSelectedUpdateOrder(null);
        }}
        onSuccess={() => {
          fetchProjects();
        }}
      />
    </div>
  );
}