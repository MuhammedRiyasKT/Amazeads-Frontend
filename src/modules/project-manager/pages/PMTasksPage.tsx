"use client";

import React, { useEffect, useState } from "react";
import { Eye, Filter, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { 
  getPMTasksMasterList, 
  getPMProjectStaffs 
} from "../services/managerOrder.service";
import PMTaskDetailsModal from "../components/PMTaskDetailsModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMTasksPage() {
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

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    getPMProjectStaffs().then(setStaffList).catch(console.error);
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = {};
      if (deptFilter) activeFilters.department_id = parseInt(deptFilter);
      if (staffFilter) activeFilters.staff_id = parseInt(staffFilter);
      if (statusFilter) activeFilters.task_status = statusFilter;

      const data = await getPMTasksMasterList(currentPage, 5, activeFilters);
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
  }, [currentPage, deptFilter, staffFilter, statusFilter]);

  const handleResetFilters = () => {
    setDeptFilter("");
    setStaffFilter("");
    setStatusFilter("");
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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>All Department Tasks Register</h1>
        <p className={styles.subtitle}>Audit, filter and monitor assigned tasks across all production departments.</p>
      </div>

      {/* 🌟 Master Filters Panel (Department, Staff Member, Task Status) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
          <Filter size={14} className="text-indigo-600" /> Filter Tasks:
        </div>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="">All Departments</option>
          <option value="1">1. Designing</option>
          <option value="2">2. Printing</option>
          <option value="3">3. Production</option>
          <option value="4">4. Logistics</option>
        </select>

        {/* Staff Filter */}
        <select
          value={staffFilter}
          onChange={(e) => { setStaffFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="">All Staff Members</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.staff_name} ({s.role_name})
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="">All Task Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Not Completed">Not Completed</option>
        </select>

        {/* Reset Button */}
        {(deptFilter || staffFilter || statusFilter) && (
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
                              {task?.assigned_to_name || "Unassigned"}
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
      />
    </div>
  );
}