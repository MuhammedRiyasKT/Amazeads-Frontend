"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, Filter, RotateCcw, Calendar, CheckCircle2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getDesignerTasks, updateDesignerTaskStatus } from "../services/designerTask.service";
import { getCategories } from "@/modules/products/services/category.service";
import { CATEGORY_IDS } from "@/constants/categories";
import DesignerTaskDetailsModal from "../components/DesignerTaskDetailsModal";
import styles from "../components/DesignerTaskComponents.module.css";

export type DesignerStatusFilterType = "Assigned" | "In Progress" | "Completed" | "Not Completed";

const DEFAULT_CATEGORIES = [
  { id: CATEGORY_IDS.CRYSTAL_WALL_ART || 4, category_name: "Crystal Wall Art" },
  { id: CATEGORY_IDS.AMAZE_ADS || 5, category_name: "Amaze Ads" },
];

export default function DesignerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
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

      const data = await getDesignerTasks(currentPage, 5, activeFilters);
      setTasks(data.items || []);
      setTotalPages(data.total_pages || data.pagination?.total_pages || 1);
      setTotalCount(data.total || data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching designer tasks:", err);
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

  const getStatusBadge = (status: string) => {
    const styleMap: Record<string, string> = {
      Assigned: "bg-blue-50 text-blue-700 border-blue-200",
      "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Not Completed": "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styleMap[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isAnyFilterActive = Boolean(
    searchTerm || orderNumber || categoryId || assignedDate || completionDate
  );

  return (
    <div className={styles.container}>
      {/* 🌟 HEADER ROW: Title on Left, Filter Tabs on Top Right */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3.5 w-full">
        <div>
          <h1 className={styles.title}>Designer Tasks Queue</h1>
          <p className={styles.subtitle}>
            Review your allocated project works and update active design progress.
          </p>
        </div>

        {/* 🌟 Right Side: Filter Tabs (Touch Scrollable for Mobile) */}
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
                  onClick={() => setActiveStatusFilter(tab.id as DesignerStatusFilterType)}
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

      {/* 🌟 MOBILE-RESPONSIVE MASTER FILTER PANEL */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-600 w-full">
        {/* Search Term Input */}
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

        {/* Filters Grid */}
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

        {/* Date Inputs */}
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

      {/* Main Section */}
      <div className={styles.tableCard}>
        {/* 💻 DESKTOP TABLE VIEW (>= sm / 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>Order Number</th>
                <th>Product Name</th>
                <th style={{ width: "150px" }}>Assigned By</th>
                <th style={{ width: "150px" }}>Assigned On</th>
                <th style={{ width: "150px" }}>Target Deadline</th>
                <th style={{ width: "160px", textAlign: "center" }}>Task Status</th>
                <th style={{ width: "110px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                    Loading designer sheets...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    No design tasks found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="font-bold text-slate-900">
                      #{task.order_number || task.order_id || "—"}
                    </td>
                    <td className="font-bold text-slate-800">{task.product_name}</td>

                    <td className="font-semibold text-slate-700 capitalize">
                      {task.assigned_by_name || "—"}
                    </td>

                    <td className="text-slate-600 font-medium whitespace-nowrap">
                      {formatDateStyle(task.assigned_on)}
                    </td>
                    <td className="text-indigo-700 font-bold whitespace-nowrap">
                      {formatDateStyle(task.completion_time)}
                    </td>

                    {/* Task Status Column */}
                    <td className="text-center whitespace-nowrap">
                      {activeStatusFilter === "In Progress" ? (
                        <select
                          value={task.status || "In Progress"}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Not Completed">Not Completed</option>
                        </select>
                      ) : activeStatusFilter === "Not Completed" ? (
                        <select
                          value={task.status || "Not Completed"}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-500"
                        >
                          <option value="Not Completed">Not Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md border inline-block ${getStatusBadge(
                            task.status || activeStatusFilter
                          )}`}
                        >
                          {task.status || activeStatusFilter}
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="text-center whitespace-nowrap">
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
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsViewOpen(true);
                          }}
                          className={styles.actionBtn}
                          title="View Specifications & Images"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARDS VIEW (< sm / 640px) 🌟 */}
        <div className="block sm:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              Loading designer sheets...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              No design tasks found matching your filter criteria.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3"
              >
                {/* Header: Order # & Actions */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    Order #{task.order_number || task.order_id || "—"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeStatusFilter === "Assigned" && (
                      <button
                        onClick={() => handleAcceptTask(task.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Accept
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsViewOpen(true);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <Eye size={13} /> View Specs
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                    Product / Project
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {task.product_name || "—"}
                  </h4>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
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
                      {formatDateStyle(task.assigned_on)}
                    </span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 pt-1.5 mt-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Target Deadline
                    </span>
                    <span className="font-extrabold text-indigo-700 block">
                      {formatDateStyle(task.completion_time)}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Task Status:</span>
                  {activeStatusFilter === "In Progress" ? (
                    <select
                      value={task.status || "In Progress"}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Not Completed">Not Completed</option>
                    </select>
                  ) : activeStatusFilter === "Not Completed" ? (
                    <select
                      value={task.status || "Not Completed"}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="h-8 px-2.5 rounded-lg border text-xs font-bold outline-none cursor-pointer bg-rose-50 text-rose-700 border-rose-200"
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
              </div>
            ))
          )}
        </div>

        {/* Pagination Row */}
        {!isLoading && tasks.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              {totalCount} tasks)
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
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTaskId(null);
        }}
      />
    </div>
  );
}