"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getPrintingTasks, updatePrintingTaskStatus } from "../services/printingTask.service";
import { usePrintingStore } from "@/store/printingStore";
import PrintingTaskDetailsModal from "./PrintingTaskDetailsModal";
import Pagination from "@/components/ui/Pagination";

export default function QueueCardGrid() {
  const selectedSubDept = usePrintingStore((state) => state.selectedSubDept);

  const [tasks, setTasks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getPrintingTasks(currentPage, 5, selectedSubDept?.id);
      setTasks(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Error loading printing tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, selectedSubDept]);

  const handleStatusSelectChange = async (taskId: number, newStatus: "In Progress" | "Completed" | "Not Completed" | "Assigned" | "Pending") => {
    try {
      await updatePrintingTaskStatus(taskId, newStatus as any);
      alert(`Status updated to ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update status");
    }
  };

  // 🌟 DESIGN STATUS-ന് വ്യത്യസ്ത നിറങ്ങളിലുള്ള ബാഡ്ജുകൾ നൽകുന്ന ഫങ്ഷൻ
  const getDesigningStatusBadge = (status: string) => {
    if (!status) return <span className="text-slate-400">—</span>;

    const lower = status.toLowerCase();
    let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

    if (lower.includes("approved")) {
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200"; // പച്ച നിറം
    } else if (lower.includes("not started")) {
      badgeStyle = "bg-slate-100 text-slate-600 border-slate-200"; // സ്ലേറ്റ് നിറം
    } else if (lower.includes("not completed") || lower.includes("pending")) {
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200"; // മഞ്ഞ നിറം
    } else if (lower.includes("not needed")) {
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200"; // നീല നിറം
    }

    return (
      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border inline-block capitalize ${badgeStyle}`}>
        {status}
      </span>
    );
  };

  // Task Status Dropdown Styles
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
    <div className="flex flex-col gap-4 w-full">
      
      {/* 🌟 Column Lines & Colored Badges ഉള്ള ERP Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px]">ORDER ID</th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[180px]">PRODUCT</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[150px]">SUB DEPARTMENT</th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[200px]">DESIGN STATUS</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[160px] text-center">TASK STATUS</th>
                <th className="py-3.5 px-4 w-[90px] text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">
                    Loading printing jobs...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                    No tasks queued for this printing unit.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900">
                      #{task.order_number || task.order_id}
                    </td>

                    {/* Product Name */}
                    <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-800">
                      {task.product_name}
                    </td>

                    {/* Sub Department */}
                    <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600 whitespace-nowrap">
                      {task.sub_department_name}
                    </td>

                    {/* 🌟 Colored DESIGN STATUS Badge */}
                    <td className="py-3.5 px-4 border-r border-slate-200 whitespace-nowrap">
                      {getDesigningStatusBadge(task.designing_status)}
                    </td>

                    {/* Task Status Dropdown */}
                    <td className="py-3.5 px-4 border-r border-slate-200 text-center">
                      <select
                        value={task.status || "Pending"}
                        onChange={(e) => handleStatusSelectChange(task.id, e.target.value as any)}
                        className={`h-8 px-3 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center ${getStatusSelectStyle(task.status)}`}
                      >
                        <option value="Assigned" className="text-blue-600 font-bold bg-white">Assigned</option>
                        <option value="In Progress" className="text-amber-600 font-bold bg-white">In Progress</option>
                        <option value="Completed" className="text-emerald-600 font-bold bg-white">Completed</option>
                        <option value="Not Completed" className="text-rose-600 font-bold bg-white">Not Completed</option>
                      </select>
                    </td>

                    {/* Action Eye Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => { setSelectedTaskId(task.id); setIsDetailsOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                        title="View Artwork & Specifications"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 font-semibold">Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Artwork Modal */}
      <PrintingTaskDetailsModal 
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