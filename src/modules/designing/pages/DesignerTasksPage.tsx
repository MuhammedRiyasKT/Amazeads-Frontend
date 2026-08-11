"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, Filter, RotateCcw, Calendar } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getDesignerTasks, updateDesignerTaskStatus } from "../services/designerTask.service";
import { getCategories } from "@/modules/products/services/category.service";
import DesignerTaskDetailsModal from "../components/DesignerTaskDetailsModal";
import styles from "../components/DesignerTaskComponents.module.css";

export default function DesignerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Master Filters States
  const [searchTerm, setSearchTerm] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
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
          : [];
        setCategories(list);
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const activeFilters: any = {};
      if (searchTerm.trim()) activeFilters.search = searchTerm.trim();
      if (orderNumber.trim()) activeFilters.order_number = orderNumber.trim();
      if (categoryId) activeFilters.category_id = parseInt(categoryId);
      if (taskStatus) activeFilters.task_status = taskStatus;
      if (assignedDate) activeFilters.assigned_date = assignedDate;
      if (completionDate) activeFilters.completion_date = completionDate;

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
  }, [currentPage, categoryId, taskStatus, assignedDate, completionDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setOrderNumber("");
    setCategoryId("");
    setTaskStatus("");
    setAssignedDate("");
    setCompletionDate("");
    setCurrentPage(1);
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateDesignerTaskStatus(taskId, newStatus);
      alert(`Task status updated to: ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusStyle = (status: string) => {
    const colors: Record<string, string> = {
      Assigned: "text-blue-600 border-blue-200 bg-blue-50/40",
      "In Progress": "text-amber-600 border-amber-200 bg-amber-50/40",
      Completed: "text-emerald-600 border-emerald-200 bg-emerald-50/40",
      "Not Completed": "text-rose-600 border-rose-200 bg-rose-50/40"
    };
    return colors[status] || "text-slate-600 border-slate-200 bg-white";
  };

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const isAnyFilterActive = Boolean(searchTerm || orderNumber || categoryId || taskStatus || assignedDate || completionDate);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Designer Tasks Queue</h1>
        <p className={styles.subtitle}>Review your allocated project works and update active design progress.</p>
      </div>

      {/* 🌟 Mobile-Responsive Master Filter Panel */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-600">
        
        {/* Filter Title Header & Reset (Mobile Layout) */}
        <div className="flex items-center justify-between font-bold text-slate-700 uppercase text-[10px] w-full sm:w-auto">
          <span className="flex items-center gap-1">
            <Filter size={14} className="text-indigo-600" /> Filter Tasks:
          </span>
          {isAnyFilterActive && (
            <button
              onClick={handleResetFilters}
              className="sm:hidden flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Search Term Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1 sm:min-w-[150px]">
          <input
            type="text"
            placeholder="Search tasks, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-lg pl-8 pr-3 bg-white text-xs font-medium focus:outline-none"
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
              className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-medium focus:outline-none"
            />
          </form>

          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <select
            value={taskStatus}
            onChange={(e) => { setTaskStatus(e.target.value); setCurrentPage(1); }}
            className="col-span-2 sm:col-span-1 w-full sm:w-auto h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Not Completed">Not Completed</option>
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
              onChange={(e) => { setAssignedDate(e.target.value); setCurrentPage(1); }}
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
              onChange={(e) => { setCompletionDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Button (Desktop) */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="hidden sm:flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Main Section */}
      <div className={styles.tableCard}>
        {/* 💻 DESKTOP TABLE VIEW (Unchanged - Shows on sm and larger) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>Order Number</th>
                <th>Product Name</th>
                <th style={{ width: "150px" }}>Assigned By</th>
                <th style={{ width: "130px" }}>Assigned On</th>
                <th style={{ width: "130px" }}>Target Deadline</th>
                <th style={{ width: "160px", textAlign: "center" }}>Task Status</th>
                <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading designer sheets...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>No design tasks found matching your filter.</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="font-bold text-slate-900">#{task.order_number || task.order_id || "—"}</td>
                    <td className="font-bold text-slate-800">{task.product_name}</td>
                    
                    <td className="font-semibold text-slate-700 capitalize">
                      {task.assigned_by_name || "—"}
                    </td>

                    <td className="text-slate-600 font-medium">{formatDateStyle(task.assigned_on)}</td>
                    <td className="text-slate-600 font-medium">{formatDateStyle(task.completion_time)}</td>
                    
                    {/* Status Dropdown Select */}
                    <td className="text-center">
                      <select
                        value={task.status || "Pending"}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`h-8 px-3 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center ${getStatusStyle(task.status)}`}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                      </select>
                    </td>

                    <td className="text-center">
                      <div className={styles.actionGroup}>
                        <button 
                          onClick={() => { setSelectedTaskId(task.id); setIsViewOpen(true); }}
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

        {/* 📱 MOBILE CARDS VIEW (Shows on mobile screens only) 🌟 */}
        <div className="block sm:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              Loading designer sheets...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-500">
              No design tasks found matching your filter.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3"
              >
                {/* Header: Order # & View Button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    Order #{task.order_number || task.order_id || "—"}
                  </span>
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
                  <select
                    value={task.status || "Pending"}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`h-8 px-3 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Completed">Not Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Row */}
        {!isLoading && tasks.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} tasks)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
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