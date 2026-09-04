"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, RotateCcw, CheckCircle2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getDesignerTasks, updateDesignerTaskStatus } from "../services/designerTask.service";
import { getCategories } from "@/modules/products/services/category.service";
import { CATEGORY_IDS } from "@/constants/categories";
import DesignerTaskDetailsModal from "../components/DesignerTaskDetailsModal";
import { DepartmentOrder, DepartmentTask } from "@/types/departmentTask.types";
import styles from "../components/DesignerTaskComponents.module.css";

export type DesignerStatusFilterType = "Assigned" | "In Progress" | "Completed" | "Not Completed" | "Cancelled";

const DEFAULT_CATEGORIES = [
  { id: CATEGORY_IDS.CRYSTAL_WALL_ART || 4, category_name: "Crystal Wall Art" },
  { id: CATEGORY_IDS.AMAZE_ADS || 5, category_name: "Amaze Ads" },
];

export default function DesignerTasksPage() {
  const [orders, setOrders] = useState<DepartmentOrder[]>([]);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Status Filter State
  const [activeStatusFilter, setActiveStatusFilter] = useState<DesignerStatusFilterType>("Assigned");

  // Master Filters States
  const [searchTerm, setSearchTerm] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Load Categories for filter dropdown
  useEffect(() => {
    getCategories()
      .then((res: any) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.results)
          ? res.results
          : [];

        if (list.length > 0) {
          setCategories(list);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      })
      .catch((err) => {
        console.error("Error loading categories, using defaults:", err);
        setCategories(DEFAULT_CATEGORIES);
      });
  }, []);

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = {};
      if (searchTerm.trim()) activeFilters.search = searchTerm.trim();
      if (orderNumber.trim()) activeFilters.order_number = orderNumber.trim();
      if (categoryId) activeFilters.category_id = parseInt(categoryId);
      if (assignedDate) activeFilters.assigned_date = assignedDate;
      if (completionDate) activeFilters.completion_date = completionDate;

      if (activeStatusFilter === "Cancelled") {
        activeFilters.order_status = "Cancel";
      } else {
        if (activeStatusFilter) activeFilters.task_status = activeStatusFilter;
      }

      const data = await getDesignerTasks(currentPage, 5, activeFilters);
      const rawItems: DepartmentOrder[] = data.items || [];

      // Filter locally: Cancelled tab shows ONLY cancelled orders; other tabs exclude cancelled orders
      const filteredItems = activeStatusFilter === "Cancelled"
        ? rawItems.filter((o) =>
            String(o.order_status || "").toLowerCase().trim() === "cancel" ||
            o.tasks?.some((t) => String(t.order_status || "").toLowerCase().trim() === "cancel")
          )
        : rawItems.filter((o) => String(o.order_status || "").toLowerCase().trim() !== "cancel");

      setOrders(filteredItems);
      setTotalPages(data.total_pages || data.pagination?.total_pages || 1);
      setTotalCount(data.total ?? data.pagination?.total_count ?? filteredItems.length);
    } catch (err) {
      console.error("Error fetching designer tasks:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeStatusFilter, categoryId, assignedDate, completionDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setOrderNumber("");
    setCategoryId("");
    setAssignedDate("");
    setCompletionDate("");
    setCurrentPage(1);
  };

  // Accept Task Handler (Assigned -> In Progress)
  const handleAcceptTask = async (taskId: number) => {
    const confirmAccept = window.confirm("Are you sure you want to accept this design task?");
    if (!confirmAccept) return;

    try {
      await updateDesignerTaskStatus(taskId, "In Progress");
      alert("Task accepted and moved to In Progress!");
      fetchTasks();
    } catch (err) {
      console.error("Failed to accept task:", err);
      alert("Failed to accept task.");
    }
  };

  // Status Change Handler for In Progress & Not Completed dropdowns
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    const confirmChange = window.confirm(`Are you sure you want to change status to "${newStatus}"?`);
    if (!confirmChange) return;

    try {
      await updateDesignerTaskStatus(taskId, newStatus);
      alert(`Task status updated to: ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status?: string | null) => {
    const styleMap: Record<string, string> = {
      Assigned: "bg-blue-50 text-blue-700 border-blue-200",
      "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Not Completed": "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styleMap[status || ""] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Date-only formatter (No time portion displayed)
  const formatDateOnly = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isAnyFilterActive = Boolean(searchTerm || orderNumber);

  return (
    <div className={styles.container}>
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3.5 w-full">
        <div>
          <h1 className={styles.title}>Designer Tasks Queue</h1>
          <p className={styles.subtitle}>
            Review your allocated project works and update active design progress.
          </p>
        </div>

        {/* Filter Tabs (Includes Cancelled Tab) */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: "Assigned", label: "Assigned" },
              { id: "In Progress", label: "In Progress" },
              { id: "Completed", label: "Completed" },
              { id: "Cancelled", label: "Cancelled" },
            ].map((tab) => {
              const isActive = activeStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusFilter(tab.id as DesignerStatusFilterType)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? tab.id === "Cancelled"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MASTER FILTER PANEL */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-600 w-full">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1 sm:min-w-[150px]">
          <input
            type="text"
            placeholder="Search tasks, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-lg pl-8 pr-3 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
          <Search size={13} className="absolute left-2.5 top-3 text-slate-400" />
        </form>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-28">
            <input
              type="text"
              placeholder="Order #"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </form>
        </div>

        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 sm:ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* MAIN SECTION */}
      <div className={styles.tableCard}>
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden sm:block overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>Order Number</th>
                <th style={{ width: "140px" }}>Customer Name</th>
                <th>Product Name</th>
                <th style={{ width: "140px" }}>Assigned By</th>
                <th style={{ width: "120px" }}>Assigned On</th>
                <th style={{ width: "130px" }}>Target Deadline</th>
                <th style={{ width: "130px", textAlign: "center" }}>Task Status</th>
                <th style={{ width: "100px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>
                    Loading designer sheets...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>
                    No design tasks found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
                  const tasksCount = tasksList.length;
                  const isOrderCancelled =
                    String(order.order_status || "").toLowerCase().trim() === "cancel";

                  return (
                    <React.Fragment key={order.order_id}>
                      {tasksList.map((task: DepartmentTask | null, tIdx: number) => {
                        const isFirstRow = tIdx === 0;
                        const isTaskCancelled =
                          isOrderCancelled ||
                          String(task?.order_status || "").toLowerCase().trim() === "cancel";

                        return (
                          <tr key={`${order.order_id}-${task?.id || tIdx}`} className="hover:bg-slate-50/50 transition-colors">
                            {isFirstRow && (
                              <td rowSpan={tasksCount} className="font-bold text-slate-900 align-middle">
                                #{order.order_number || order.order_id || task?.order_number || "—"}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={tasksCount} className="font-semibold text-slate-700 capitalize align-middle">
                                {order.customer_name || task?.customer_name || "—"}
                              </td>
                            )}

                            <td className="font-bold text-slate-800">
                              {task ? task.product_name || "—" : "—"}
                            </td>

                            <td className="font-semibold text-slate-700 capitalize">
                              {task ? task.assigned_by_name || "—" : "—"}
                            </td>

                            <td className="text-slate-600 font-medium whitespace-nowrap">
                              {formatDateOnly(task?.assigned_on)}
                            </td>

                            <td className="text-indigo-700 font-bold whitespace-nowrap">
                              {formatDateOnly(task?.completion_time)}
                            </td>

                            <td className="py-3 px-4 border-r border-slate-200 text-center font-bold">
                              {isTaskCancelled ? (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-md border bg-rose-50 text-rose-700 border-rose-200 inline-block">
                                  Cancelled
                                </span>
                              ) : (
                                <span
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md border inline-block ${getStatusBadge(
                                    task?.status || activeStatusFilter
                                  )}`}
                                >
                                  {task?.status || activeStatusFilter}
                                </span>
                              )}
                            </td>

                            {/* Actions Column */}
                            <td className="text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {!isTaskCancelled && task && activeStatusFilter === "Assigned" && (
                                  <button
                                    onClick={() => handleAcceptTask(task.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                                    title="Accept Task"
                                  >
                                    <CheckCircle2 size={13} /> Accept
                                  </button>
                                )}

                                {!isTaskCancelled && task && activeStatusFilter === "In Progress" && (
                                  <button
                                    onClick={() => handleStatusChange(task.id, "Completed")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                                    title="Complete Task"
                                  >
                                    <CheckCircle2 size={13} /> Complete
                                  </button>
                                )}

                                {task && (
                                  <button
                                    onClick={() => {
                                      setSelectedTaskId(task.id);
                                      setSelectedTask(task);
                                      setIsViewOpen(true);
                                    }}
                                    className={styles.actionBtn}
                                    title="View Specifications & Images"
                                  >
                                    <Eye size={14} />
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

        {/* MOBILE CARDS VIEW */}
        <div className="block sm:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              Loading designer sheets...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              No design tasks found matching your filter criteria.
            </div>
          ) : (
            orders.map((order) => {
              const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
              const isOrderCancelled =
                String(order.order_status || "").toLowerCase().trim() === "cancel";

              return (
                <div
                  key={`mob-${order.order_id}`}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        Order #{order.order_number || order.order_id || "—"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 capitalize block">
                        {order.customer_name || "—"}
                      </span>
                    </div>
                    {isOrderCancelled && (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border bg-rose-50 text-rose-700 border-rose-200">
                        Cancelled
                      </span>
                    )}
                  </div>

                  {tasksList.map((task: DepartmentTask | null, tIdx: number) => {
                    const isTaskCancelled =
                      isOrderCancelled ||
                      String(task?.order_status || "").toLowerCase().trim() === "cancel";

                    return (
                      <div key={`mob-t-${task?.id || tIdx}`} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                              Product / Project
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                              {task?.product_name || "—"}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isTaskCancelled && task && activeStatusFilter === "Assigned" && (
                              <button
                                onClick={() => handleAcceptTask(task.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-extrabold bg-emerald-600 text-white rounded-md"
                              >
                                <CheckCircle2 size={11} /> Accept
                              </button>
                            )}
                            {!isTaskCancelled && task && activeStatusFilter === "In Progress" && (
                              <button
                                onClick={() => handleStatusChange(task.id, "Completed")}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-extrabold bg-emerald-600 text-white rounded-md"
                              >
                                <CheckCircle2 size={11} /> Complete
                              </button>
                            )}
                            {task && (
                              <button
                                onClick={() => {
                                  setSelectedTaskId(task.id);
                                  setSelectedTask(task);
                                  setIsViewOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg bg-white shrink-0"
                                title="View Specs"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {task && (
                          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg text-xs border border-slate-200/60">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                Assigned By
                              </span>
                              <span className="font-semibold text-slate-700 capitalize truncate block">
                                {task.assigned_by_name || "—"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                Assigned On
                              </span>
                              <span className="font-semibold text-slate-700 block">
                                {formatDateOnly(task.assigned_on)}
                              </span>
                            </div>

                            <div className="col-span-2 border-t border-slate-150 pt-1">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                Target Deadline
                              </span>
                              <span className="font-extrabold text-indigo-700 block">
                                {formatDateOnly(task.completion_time)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="font-bold text-slate-500">Status:</span>
                          {isTaskCancelled ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md border bg-rose-50 text-rose-700 border-rose-200">
                              Cancelled
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${getStatusBadge(
                                task?.status || activeStatusFilter
                              )}`}
                            >
                              {task?.status || activeStatusFilter}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Row */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              {totalCount} orders)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <DesignerTaskDetailsModal
        isOpen={isViewOpen}
        taskId={selectedTaskId}
        task={selectedTask}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTaskId(null);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}