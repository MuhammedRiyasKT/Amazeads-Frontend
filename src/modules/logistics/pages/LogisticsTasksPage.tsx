"use client";

import React, { useEffect, useState } from "react";
import { Eye, Truck, CheckCircle2, PackageCheck } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { 
  getLogisticsTasks, 
  updateLogisticsTaskStatus, 
  updateLogisticsOrderStatus 
} from "../services/logisticsTask.service";
import LogisticsTaskDetailsModal from "../components/LogisticsTaskDetailsModal";

export default function LogisticsTasksPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 LocalStorage വഴി റിഫ്രഷ് ചെയ്താലും Packed സ്റ്റാറ്റസ് ഓർത്തുവെക്കാനുള്ള സ്റ്റേറ്റ്
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

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getLogisticsTasks(currentPage, 5);
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
  }, [currentPage]);

  // Individual Task Status Change
  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateLogisticsTaskStatus(taskId, newStatus);
      alert(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error("Error updating logistics task status:", err);
      alert("Failed to update task status");
    }
  };

  // 🌟 "Mark Packed" ക്ലിക്ക് ചെയ്യുമ്പോൾ എപിഐ റെസ്പോൺസ് ഒബ്ജക്റ്റ് നേരിട്ട് സ്റ്റേറ്റിലേക്ക് സേവ് ചെയ്യുന്നു
  const handleMarkPacked = async (orderId: number) => {
    try {
      // 🌟 API Call Returns: { "id": 26, "order_status": "Packed" }
      const response = await updateLogisticsOrderStatus(orderId, "Packed");
      
      const currentOrderId = response?.id || orderId;

      // 1. Direct State Update
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if ((o.order_id || o.id) === currentOrderId) {
            return { ...o, order_status: response?.order_status || "Packed" };
          }
          return o;
        })
      );

      // 2. LocalStorage Persistence
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
    } catch (err) {
      console.error("Error marking order as packed:", err);
      alert("Failed to mark order as packed");
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
                <th className="py-3.5 px-4 border-r border-slate-200 w-[140px]">ASSIGNED BY</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[160px] text-center">TASK STATUS</th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[80px] text-center">ACTIONS</th>
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
                    No active logistics tasks.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
                  const tasksCount = tasksList.length;

                  // ഓർഡറിലെ എല്ലാ ടാസ്കുകളും Completed ആയോ എന്ന് ചെക്ക് ചെയ്യുന്നു
                  const areAllTasksCompleted = tasksList.every((t: any) => t && t.status === "Completed");

                  // 🌟 എപിഐ വഴി ലഭിക്കുന്ന order_status ഉം LocalStorage വഴി ഉള്ളതും ചെക്ക് ചെയ്യുന്നു
                  const isOrderPacked = 
                    packedOrderIds.includes(order.order_id || order.id) ||
                    (order.order_status || order.status || "").toLowerCase() === "packed";

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {tasksList.map((task: any, tIdx: number) => {
                        const isFirstRow = tIdx === 0;

                        return (
                          <tr key={`${order.order_id}-${task?.id || tIdx}`} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Order ID (Merged RowSpan) */}
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
                            <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600">
                              {task ? task.assigned_by_name || "Aslam" : "—"}
                            </td>

                            {/* Task Status Dropdown Select */}
                            <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle">
                              {task && (
                                <select
                                  value={task.status || "Pending"}
                                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                  className={`h-8 px-3 rounded-lg border text-xs font-bold outline-none cursor-pointer text-center ${getStatusSelectStyle(task.status)}`}
                                >
                                  <option value="Assigned" className="text-blue-600 font-bold bg-white">Assigned</option>
                                  <option value="In Progress" className="text-amber-600 font-bold bg-white">In Progress</option>
                                  <option value="Completed" className="text-emerald-600 font-bold bg-white">Completed</option>
                                  <option value="Not Completed" className="text-rose-600 font-bold bg-white">Not Completed</option>
                                </select>
                              )}
                            </td>

                            {/* Action Eye Button */}
                            <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle">
                              {task && (
                                <button
                                  onClick={() => { setSelectedTaskId(task.id); setIsDetailsOpen(true); }}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                                  title="View Details"
                                >
                                  <Eye size={15} />
                                </button>
                              )}
                            </td>

                            {/* 🌟 ORDER PACKED STATUS (Merged RowSpan) */}
                            {isFirstRow && (
                              <td rowSpan={tasksCount} className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                                {isOrderPacked ? (
                                  /* 🌟 Packed ആയി കഴിഞ്ഞാൽ പച്ച നിറത്തിലുള്ള "Packed ✓" ബാഡ്ജ് തെളിയും */
                                  <span className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 size={14} /> Packed
                                  </span>
                                ) : areAllTasksCompleted ? (
                                  /* 🌟 എല്ലാ ടാസ്കുകളും Completed ആണെങ്കിൽ "Mark Packed" ബട്ടൺ കാണിക്കും */
                                  <button
                                    onClick={() => handleMarkPacked(order.order_id || order.id)}
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                                    title="Click to confirm order is packed"
                                  >
                                    <PackageCheck size={14} /> Mark Packed
                                  </button>
                                ) : (
                                  /* 🌟 ടാസ്കുകൾ തീരാനുണ്ടെങ്കിൽ Pending കാണിക്കും */
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

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
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