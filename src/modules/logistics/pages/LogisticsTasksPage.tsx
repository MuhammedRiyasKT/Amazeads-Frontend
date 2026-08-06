"use client";

import React, { useEffect, useState } from "react";
import { Eye, Truck } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getLogisticsTasks, updateLogisticsTaskStatus } from "../services/logisticsTask.service";
import LogisticsTaskDetailsModal from "../components/LogisticsTaskDetailsModal";

export default function LogisticsTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getLogisticsTasks(currentPage, 5);
      setTasks(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching logistics tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  const handleStatusSelectChange = async (taskId: number, newStatus: string) => {
    try {
      await updateLogisticsTaskStatus(taskId, newStatus);
      alert(`Status updated to ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Error updating logistics status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusSelectStyle = (status: string) => {
    const styleMap: Record<string, string> = {
      "Assigned": "text-blue-600 border-blue-200 bg-blue-50/40 focus:border-blue-500",
      "In Progress": "text-amber-600 border-amber-200 bg-amber-50/40 focus:border-amber-500",
      "Completed": "text-emerald-600 border-emerald-200 bg-emerald-50/40 focus:border-emerald-500",
      "Not Completed": "text-rose-600 border-rose-200 bg-rose-50/40 focus:border-rose-500",
      "Pending": "text-amber-600 border-amber-200 bg-amber-50/40 focus:border-amber-500",
    };
    return styleMap[status] || "text-slate-700 border-slate-200 bg-white";
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="text-indigo-600" size={24} />
          Logistics Tasks Queue
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Track and manage dispatch, courier and customer pickup tasks.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px]">ORDER ID</th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[180px]">PRODUCT</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[150px]">ASSIGNED BY</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[160px] text-center">TASK STATUS</th>
                <th className="py-3.5 px-4 w-[90px] text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 font-semibold">
                    Loading logistics tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 font-semibold">
                    No active logistics tasks.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900">
                      #{task.order_number || task.order_id}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-800">
                      {task.product_name}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600">
                      {task.assigned_by_name || "—"}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-200 text-center">
                      <select
                        value={task.status || "Pending"}
                        onChange={(e) => handleStatusSelectChange(task.id, e.target.value)}
                        className={`h-8 px-3 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center ${getStatusSelectStyle(task.status)}`}
                      >
                        <option value="Assigned" className="text-blue-600 font-bold bg-white">Assigned</option>
                        <option value="In Progress" className="text-amber-600 font-bold bg-white">In Progress</option>
                        <option value="Completed" className="text-emerald-600 font-bold bg-white">Completed</option>
                        <option value="Not Completed" className="text-rose-600 font-bold bg-white">Not Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => { setSelectedTaskId(task.id); setIsDetailsOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 font-semibold">Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={setCurrentPage} />
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