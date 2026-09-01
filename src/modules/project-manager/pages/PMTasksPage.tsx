"use client";

import React, { useEffect, useState, useRef } from "react";
import { Eye, Filter, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  getPMTasksMasterList,
  getPMProjectStaffs,
  UserRole
} from "../services/managerOrder.service";
import PMTaskDetailsModal from "../components/PMTaskDetailsModal";
import styles from "../components/PMOrderComponents.module.css";

// 🌟 Task Status tabs config with color theme
const TASK_STATUS_TABS = [
  { label: "All Tasks", value: "", dot: "#6366f1", activeBg: "#ede9fe", activeColor: "#5b21b6", activeBorder: "#c4b5fd" },
  { label: "Assigned", value: "Assigned", dot: "#3b82f6", activeBg: "#eff6ff", activeColor: "#1d4ed8", activeBorder: "#bfdbfe" },
  { label: "Pending", value: "Pending", dot: "#ca8a04", activeBg: "#fefce8", activeColor: "#854d0e", activeBorder: "#fde68a" },
  { label: "In Progress", value: "In Progress", dot: "#f97316", activeBg: "#ffedd5", activeColor: "#9a3412", activeBorder: "#fed7aa" },
  { label: "Completed", value: "Completed", dot: "#22c55e", activeBg: "#dcfce7", activeColor: "#166534", activeBorder: "#86efac" },
];

export default function PMTasksPage({ role = "project-manager" }: { role?: UserRole }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Filter States
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");

  // Custom Dropdown States & Refs
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const DEPARTMENTS_CONFIG = [
    { id: "1", name: "Designing" },
    { id: "2", name: "Printing" },
    { id: "3", name: "Production" },
    { id: "4", name: "Logistics" },
  ];

  const getStaffForDept = (deptId: string) => {
    let targetRole = "";
    if (deptId === "1") targetRole = "designing";
    else if (deptId === "2") targetRole = "printing";
    else if (deptId === "3") targetRole = "production";
    else if (deptId === "4") targetRole = "logistics";

    return staffList.filter((s) => {
      const role = (s.role_name || "").toLowerCase();
      if (targetRole === "designing") {
        return role === "designer" || role === "designing";
      }
      if (targetRole === "printing") {
        return role === "operator" || role === "printing";
      }
      return role === targetRole;
    });
  };

  const getSelectedStaffLabel = () => {
    if (staffFilter) {
      const staff = staffList.find((s) => String(s.id) === staffFilter);
      if (staff) {
        let deptLabel = "";
        const role = (staff.role_name || "").toLowerCase();
        if (role === "designer" || role === "designing") deptLabel = "Designing";
        else if (role === "operator" || role === "printing") deptLabel = "Printing";
        else if (role === "production") deptLabel = "Production";
        else if (role === "logistics") deptLabel = "Logistics";
        else deptLabel = staff.role_name || "Staff";

        return `${staff.staff_name || staff.username || staff.name} (${deptLabel})`;
      }
    }
    if (deptFilter) {
      const dept = DEPARTMENTS_CONFIG.find((d) => d.id === deptFilter);
      return dept ? `All ${dept.name}` : "Choose Staff / Department";
    }
    return "Choose Staff / Department";
  };

  // Click Outside Dropdown Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStaffDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    getPMProjectStaffs(undefined, role).then(setStaffList).catch(console.error);
  }, [role]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = {};
      if (deptFilter) activeFilters.department_id = parseInt(deptFilter);
      if (staffFilter) activeFilters.staff_id = parseInt(staffFilter);
      if (statusFilter) activeFilters.task_status = statusFilter;
      if (completionDate) activeFilters.completion_date = completionDate;

      const data = await getPMTasksMasterList(currentPage, 5, activeFilters, role);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.total_pages || data.pagination?.total_pages || 1);
      setTotalCount(data.total || data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error loading PM tasks list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, deptFilter, staffFilter, statusFilter, completionDate]);

  const handleResetFilters = () => {
    setDeptFilter("");
    setStaffFilter("");
    setStatusFilter("");
    setCompletionDate("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styleMap: Record<string, string> = {
      "Assigned": "bg-blue-50 text-blue-700 border-blue-200",
      "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
      "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Not Completed": "bg-rose-50 text-rose-700 border-rose-200",
      "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md border inline-block capitalize ${styleMap[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
        {status || "Pending"}
      </span>
    );
  };

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
        {/* Title */}
        <div>
          <h1 className={styles.title}>All Department Tasks Register</h1>
          <p className={styles.subtitle}>Audit, filter and monitor assigned tasks across all production departments.</p>
        </div>

        {/* Status Tabs Slider */}
        <div style={{
          display: "flex",
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "5px",
          gap: "3px",
          flexShrink: 0,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {TASK_STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px", fontSize: "0.775rem",
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1px solid ${tab.activeBorder}` : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  background: isActive ? tab.activeBg : "transparent",
                  color: isActive ? tab.activeColor : "#64748b",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                  background: isActive ? tab.dot : "#cbd5e1",
                  transition: "background 0.18s",
                }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 Master Filters Panel (Department, Staff Member, Task Status) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
          <Filter size={14} className="text-indigo-600" /> Filter Tasks:
        </div>

        {/* Custom Staff/Dept Dropdown */}
        <div ref={dropdownRef} className="relative select-none z-[100]">
          <div
            onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
            className="flex items-center justify-between h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 cursor-pointer min-w-[200px]"
          >
            <div className="flex items-center gap-1.5 text-slate-650">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-650">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{getSelectedStaffLabel()}</span>
            </div>
            {/* Chevron down/up */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              {isStaffDropdownOpen ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
          </div>

          {isStaffDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 max-h-80 overflow-y-auto">
              {/* Option to clear filter */}
              <div
                onClick={() => {
                  setDeptFilter("");
                  setStaffFilter("");
                  setCurrentPage(1);
                  setIsStaffDropdownOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
              >
                All Staff / Departments
              </div>

              {/* Department Accordions */}
              {DEPARTMENTS_CONFIG.map((dept) => {
                const isExpanded = expandedDept === dept.id;
                const deptStaff = getStaffForDept(dept.id);

                return (
                  <div key={dept.id} className="border-b border-slate-50 last:border-b-0">
                    {/* Dept Header */}
                    <div
                      onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[10px] font-extrabold text-slate-500 uppercase tracking-wider"
                    >
                      <span>{dept.name}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-400 transition-transform">
                        {isExpanded ? (
                          <path d="m18 15-6-6-6 6" />
                        ) : (
                          <path d="m6 9 6 6 6-6" />
                        )}
                      </svg>
                    </div>

                    {/* Expanded Staff List */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 pb-1">
                        {deptStaff.length === 0 ? (
                          <div className="px-6 py-1.5 text-[10px] text-slate-400 italic">No staff found</div>
                        ) : (
                          deptStaff.map((staff) => {
                            const isSelected = staffFilter === String(staff.id);
                            return (
                              <div
                                key={staff.id}
                                onClick={() => {
                                  setDeptFilter(dept.id);
                                  setStaffFilter(String(staff.id));
                                  setCurrentPage(1);
                                  setIsStaffDropdownOpen(false);
                                }}
                                className={`px-6 py-1.5 text-xs font-bold cursor-pointer hover:bg-slate-100/80 ${
                                  isSelected ? "text-indigo-600 bg-indigo-50/50 font-extrabold" : "text-slate-700"
                                }`}
                              >
                                {staff.staff_name || staff.username || staff.name || `Staff #${staff.id}`}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completion Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Completion:</span>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => { setCompletionDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Reset Button */}
        {(deptFilter || staffFilter || statusFilter || completionDate) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw size={13} /> Reset Filters
          </button>
        )}
      </div>

      {/* Tasks Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "85px" }}>ORDER ID</th>
                <th>PRODUCT</th>
                <th style={{ width: "150px" }}>DEPARTMENT / UNIT</th>
                <th style={{ width: "130px" }}>ASSIGNED TO</th>
                <th style={{ width: "130px" }}>ASSIGNED BY</th>
                <th style={{ width: "110px" }}>DEADLINE</th>
                <th style={{ width: "100px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "65px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>Loading department tasks register...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>No tasks found for selected filters.</td></tr>
              ) : (
                orders.map((order) => {
                  const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
                  const tasksCount = tasksList.length;

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {tasksList.map((task: any, tIdx: number) => {
                        const isFirstRow = tIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${task?.id || tIdx}`}>
                            {/* Order ID (Merged RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={tasksCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                #{order.order_number || order.order_id}
                              </td>
                            )}

                            {/* Product Name */}
                            <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                              {task ? task.product_name : "—"}
                            </td>

                            {/* Department & Sub-Department Unit */}
                            <td className="align-middle text-xs font-bold text-slate-700 capitalize">
                              {task?.department_name || "—"}
                              {task?.sub_department_name && (
                                <span className="block text-[10px] text-indigo-600 font-normal">
                                  ({task.sub_department_name})
                                </span>
                              )}
                            </td>

                            {/* Assigned To Staff */}
                            <td className="align-middle text-xs font-semibold text-slate-800">
                              {task?.assigned_to_name || "Not Accepeted"}
                            </td>

                            {/* Assigned By Staff */}
                            <td className="align-middle text-xs font-medium text-slate-600">
                              {task?.assigned_by_name || "—"}
                            </td>

                            {/* Deadline */}
                            <td className="align-middle text-xs font-semibold text-slate-600 whitespace-nowrap">
                              {formatDateStyle(task?.completion_time)}
                            </td>

                            {/* Task Status Badge */}
                            <td style={{ textAlign: "center" }} className="align-middle">
                              {task ? getStatusBadge(task.status) : "—"}
                            </td>

                            {/* Actions */}
                            <td className="align-middle text-center">
                              {task && (
                                <button
                                  onClick={() => { setSelectedTaskId(task.id); setIsDetailsOpen(true); }}
                                  className={styles.actionBtn}
                                  title="View Task Details & Specifications"
                                >
                                  <Eye size={13} />
                                </button>
                              )}
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

        {/* Pagination Footer Row */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(page) => setCurrentPage(page)} />
          </div>
        )}
      </div>

      {/* Single Task Details Modal */}
      <PMTaskDetailsModal
        isOpen={isDetailsOpen}
        taskId={selectedTaskId}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTaskId(null);
        }}
        role={role}
      />
    </div>
  );
}