"use client";

import React, { useEffect, useState } from "react";
import { 
  Eye, 
  Truck, 
  CheckCircle2, 
  PackageCheck, 
  Search, 
  Filter, 
  RotateCcw, 
  Calendar 
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { 
  getLogisticsTasks, 
  updateLogisticsTaskStatus, 
  updateLogisticsOrderStatus 
} from "../services/logisticsTask.service";
import { getCategories } from "@/modules/products/services/category.service";
import { CATEGORY_IDS } from "@/constants/categories";
import LogisticsTaskDetailsModal from "../components/LogisticsTaskDetailsModal";

export type LogisticsStatusFilterType = "Assigned" | "In Progress" | "Completed" | "Not Completed";

const DEFAULT_CATEGORIES = [
  { id: CATEGORY_IDS.CRYSTAL_WALL_ART || 4, category_name: "Crystal Wall Art" },
  { id: CATEGORY_IDS.AMAZE_ADS || 5, category_name: "Amaze Ads" },
];

export default function LogisticsTasksPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Status Filter State
  const [activeStatusFilter, setActiveStatusFilter] = useState<LogisticsStatusFilterType>("Assigned");

  // Master Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  // LocalStorage വഴി റിഫ്രഷ് ചെയ്താലും Packed സ്റ്റാറ്റസ് ഓർത്തുവെക്കാനുള്ള സ്റ്റേറ്റ്
  const [packedOrderIds, setPackedOrderIds] = useState<number[]>([]);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("logistics_packed_orders");
      if (saved) {
        setPackedOrderIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading packed orders from storage", e);
    }
  }, []);

  // Load Categories for dropdown
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

  // Status Filter മാറുമ്പോൾ പേജ് 1 ആക്കുന്നു
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
      if (activeStatusFilter) activeFilters.task_status = activeStatusFilter;

      const data = await getLogisticsTasks(currentPage, 5, activeFilters);
      const items = data.items || [];

      setOrders(items);
      setTotalPages(data.total_pages || data.pagination?.total_pages || 1);
      setTotalCount(data.total || data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching logistics tasks:", err);
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
    const confirmAccept = window.confirm("Are you sure you want to accept this logistics task?");
    if (!confirmAccept) return;

    try {
      await updateLogisticsTaskStatus(taskId, "In Progress");
      alert("Task accepted and moved to In Progress!");
      fetchTasks();
    } catch (err) {
      console.error("Error accepting task:", err);
      alert("Failed to accept task.");
    }
  };

  // Individual Task Status Change
  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    const confirmChange = window.confirm(`Are you sure you want to change status to "${newStatus}"?`);
    if (!confirmChange) return;

    try {
      await updateLogisticsTaskStatus(taskId, newStatus);
      alert(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Error updating logistics task status:", err);
      alert("Failed to update task status");
    }
  };

  // Mark Packed Handler
  const handleMarkPacked = async (orderId: number) => {
    try {
      const response = await updateLogisticsOrderStatus(orderId, "Packed");
      const currentOrderId = response?.id || orderId;

      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if ((o.order_id || o.id) === currentOrderId) {
            return { ...o, order_status: response?.order_status || "Packed" };
          }
          return o;
        })
      );

      setPackedOrderIds((prev) => {
        const updated = Array.from(new Set([...prev, currentOrderId]));
        try {
          localStorage.setItem("logistics_packed_orders", JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving to local storage", e);
        }
        return updated;
      });

      alert(`Order #${currentOrderId} marked as Packed successfully!`);
      fetchTasks();
    } catch (err: any) {
      console.error("Error marking order as packed:", err);
      const detail =
        err?.response?.data?.detail ||
        err?.data?.detail ||
        err?.message ||
        "Failed to mark order as packed";
      alert(detail);
    }
  };

  const getStatusBadge = (status: string) => {
    const styleMap: Record<string, string> = {
      Assigned: "bg-blue-50 text-blue-700 border-blue-200",
      "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Not Completed": "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styleMap[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  // 🌟 Missing Helper Function Restored
  const getStatusSelectStyle = (status: string) => {
    const styleMap: Record<string, string> = {
      Assigned: "text-blue-600 border-blue-200 bg-blue-50/40 focus:border-blue-500",
      "In Progress": "text-amber-600 border-amber-200 bg-amber-50/40 focus:border-amber-500",
      Completed: "text-emerald-600 border-emerald-200 bg-emerald-50/40 focus:border-emerald-500",
      "Not Completed": "text-rose-600 border-rose-200 bg-rose-50/40 focus:border-rose-500",
      Pending: "text-amber-600 border-amber-200 bg-amber-50/40 focus:border-amber-500",
    };
    return styleMap[status] || "text-slate-700 border-slate-200 bg-white";
  };

  const isAnyFilterActive = Boolean(
    searchTerm || orderNumber || categoryId || assignedDate || completionDate
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-3 sm:p-6 w-full max-w-full overflow-x-hidden box-border">
      {/* HEADER ROW: Title on Left, Filter Tabs on Top Right */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3.5 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-indigo-600" size={24} />
            Logistics Tasks Queue
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track and manage dispatch, courier and customer pickup tasks.
          </p>
        </div>

        {/* Right Side: Status Filter Tabs */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: "Assigned", label: "Assigned" },
              { id: "In Progress", label: "In Progress" },
              { id: "Completed", label: "Completed" },
              { id: "Not Completed", label: "Not Completed" },
            ].map((tab) => {
              const isActive = activeStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusFilter(tab.id as LogisticsStatusFilterType)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
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

      {/* FULLY MOBILE-RESPONSIVE MASTER FILTER PANEL */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-600 w-full">
        {/* Search Term Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1 sm:min-w-[150px]">
          <input
            type="text"
            placeholder="Search product, staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-lg pl-8 pr-3 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
          <Search size={13} className="absolute left-2.5 top-3 text-slate-400" />
        </form>

        {/* Order # & Category Dropdown */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-28">
            <input
              type="text"
              placeholder="Order #"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </form>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer capitalize"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>
                {cat.category_name || cat.name || `Category #${cat.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters: Assigned & Target */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-indigo-600" />
              <span className="text-[10px] uppercase text-slate-400 font-bold">Assigned:</span>
            </div>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => {
                setAssignedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-indigo-600" />
              <span className="text-[10px] uppercase text-slate-400 font-bold">Target:</span>
            </div>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => {
                setCompletionDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Button */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 sm:ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Main Table & Mobile Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full">
        {/* 💻 DESKTOP TABLE VIEW (>= md / 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px]">ORDER ID</th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[180px]">PRODUCT</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[140px]">ASSIGNED BY</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[160px] text-center">TASK STATUS</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[100px] text-center">ACTIONS</th>
                <th className="py-3.5 px-4 w-[160px] text-center">ORDER PACKED STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">
                    Loading logistics tasks...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                    No active logistics tasks matching "{activeStatusFilter}" status.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
                  const tasksCount = tasksList.length;

                  const areAllTasksCompleted = tasksList.every((t: any) => t && t.status === "Completed");

                  const isOrderPacked = 
                    packedOrderIds.includes(order.order_id || order.id) ||
                    (order.order_status || order.status || "").toLowerCase() === "packed";

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {tasksList.map((task: any, tIdx: number) => {
                        const isFirstRow = tIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${task?.id || tIdx}`} className="hover:bg-slate-50/80 transition-colors">
                            {/* Order ID */}
                            {isFirstRow && (
                              <td rowSpan={tasksCount} className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900 align-middle whitespace-nowrap">
                                #{order.order_number || order.order_id}
                              </td>
                            )}

                            {/* Product Name */}
                            <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-800">
                              {task ? task.product_name : "—"}
                            </td>

                            {/* Assigned By */}
                            <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600 capitalize">
                              {task ? task.assigned_by_name || "Aslam" : "—"}
                            </td>

                            {/* Task Status Dropdown Select / Badge */}
                            <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle whitespace-nowrap">
                              {task && (
                                activeStatusFilter === "In Progress" ? (
                                  <select
                                    value={task.status || "In Progress"}
                                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                    className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500"
                                  >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Not Completed">Not Completed</option>
                                  </select>
                                ) : activeStatusFilter === "Not Completed" ? (
                                  <select
                                    value={task.status || "Not Completed"}
                                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                    className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-500"
                                  >
                                    <option value="Not Completed">Not Completed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                ) : (
                                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border inline-block ${getStatusBadge(task.status || activeStatusFilter)}`}>
                                    {task.status || activeStatusFilter}
                                  </span>
                                )
                              )}
                            </td>

                            {/* Actions Column */}
                            <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle whitespace-nowrap">
                              {task && (
                                <div className="flex items-center justify-center gap-1.5">
                                  {activeStatusFilter === "Assigned" && (
                                    <button
                                      onClick={() => handleAcceptTask(task.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                                      title="Accept Task"
                                    >
                                      <CheckCircle2 size={13} /> Accept
                                    </button>
                                  )}

                                  <button
                                    onClick={() => { setSelectedTaskId(task.id); setIsDetailsOpen(true); }}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                                    title="View Details"
                                  >
                                    <Eye size={15} />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* ORDER PACKED STATUS */}
                            {isFirstRow && (
                              <td rowSpan={tasksCount} className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                                {isOrderPacked ? (
                                  <span className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 size={14} /> Packed
                                  </span>
                                ) : areAllTasksCompleted ? (
                                  <button
                                    onClick={() => handleMarkPacked(order.order_id || order.id)}
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                                    title="Click to confirm order is packed"
                                  >
                                    <PackageCheck size={14} /> Mark Packed
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-500 border border-slate-200 inline-block">
                                    Tasks Pending
                                  </span>
                                )}
                              </td>
                            )}
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

        {/* 📱 MOBILE CARDS VIEW (< md / 768px) 🌟 */}
        <div className="block md:hidden p-3 space-y-3 w-full">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              Loading logistics tasks...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
              No active logistics tasks matching "{activeStatusFilter}" status.
            </div>
          ) : (
            orders.map((order) => {
              const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
              const areAllTasksCompleted = tasksList.every((t: any) => t && t.status === "Completed");
              const isOrderPacked = 
                packedOrderIds.includes(order.order_id || order.id) ||
                (order.order_status || order.status || "").toLowerCase() === "packed";

              return (
                <div
                  key={`mob-ord-${order.order_id || order.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3 w-full min-w-0"
                >
                  {/* Header: Order ID & Packed Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-xs text-slate-900">
                      Order #{order.order_number || order.order_id || "—"}
                    </span>
                    {isOrderPacked ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> Packed
                      </span>
                    ) : areAllTasksCompleted ? (
                      <button
                        onClick={() => handleMarkPacked(order.order_id || order.id)}
                        className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <PackageCheck size={13} /> Mark Packed
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                        Tasks Pending
                      </span>
                    )}
                  </div>

                  {/* Tasks List inside Order */}
                  <div className="space-y-2.5">
                    {tasksList.map((task: any, tIdx: number) => (
                      <div
                        key={`mob-task-${task?.id || tIdx}`}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">
                              Product Name
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs">
                              {task ? task.product_name : "—"}
                            </h4>
                          </div>
                          {task && (
                            <div className="flex items-center gap-1">
                              {activeStatusFilter === "Assigned" && (
                                <button
                                  onClick={() => handleAcceptTask(task.id)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-extrabold bg-emerald-600 text-white rounded-md"
                                >
                                  <CheckCircle2 size={11} /> Accept
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedTaskId(task.id);
                                  setIsDetailsOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg bg-white shrink-0"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {task && (
                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[11px]">
                            <span className="font-medium text-slate-600">
                              Assigned By: <strong className="text-slate-800">{task.assigned_by_name || "Aslam"}</strong>
                            </span>

                            {activeStatusFilter === "In Progress" ? (
                              <select
                                value={task.status || "In Progress"}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                className={`h-7 px-2 rounded-lg border text-[11px] font-bold outline-none cursor-pointer ${getStatusSelectStyle(
                                  task.status
                                )}`}
                              >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Not Completed">Not Completed</option>
                              </select>
                            ) : activeStatusFilter === "Not Completed" ? (
                              <select
                                value={task.status || "Not Completed"}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                className={`h-7 px-2 rounded-lg border text-[11px] font-bold outline-none cursor-pointer ${getStatusSelectStyle(
                                  task.status
                                )}`}
                              >
                                <option value="Not Completed">Not Completed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${getStatusBadge(
                                  task.status || activeStatusFilter
                                )}`}
                              >
                                {task.status || activeStatusFilter}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 gap-2">
            <div className="text-xs text-slate-500 font-semibold">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(page) => setCurrentPage(page)} />
          </div>
        )}
      </div>

      <LogisticsTaskDetailsModal 
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