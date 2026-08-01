"use client";

import React, { useEffect, useState } from "react";
import { Eye, ClipboardList } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getDesignerTasks, updateDesignerTaskStatus } from "../services/designerTask.service";
import DesignerTaskDetailsModal from "../components/DesignerTaskDetailsModal";
import styles from "../components/DesignerTaskComponents.module.css";

export default function DesignerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getDesignerTasks(currentPage, 10);
      setTasks(data.items || []);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  // ടാസ്ക് സ്റ്റാറ്റസ് മാറ്റുന്നു 🌟
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateDesignerTaskStatus(taskId, newStatus);
      alert(`Task status updated to: ${newStatus}`);
      fetchTasks(); // ടേബിൾ അപ്ഡേറ്റ് ചെയ്യുന്നു
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusStyle = (status: string) => {
    const colors: Record<string, string> = {
      Assigned: "text-blue-600 border-blue-200",
      "In Progress": "text-amber-600 border-amber-200",
      Completed: "text-green-600 border-green-200",
      "Not Completed": "text-red-600 border-red-200"
    };
    return colors[status] || "text-slate-600 border-slate-200";
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Designer Tasks</h1>
        <p className={styles.subtitle}>Review your allocated project works and update their active progress.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Order Number</th>
                <th>Product Name</th>
                <th style={{ width: "180px" }}>Category</th>
                <th style={{ width: "160px" }}>Assigned On</th>
                <th style={{ width: "160px" }}>Target Deadline</th>
                <th style={{ width: "160px", textAlign: "center" }}>Task Status</th>
                <th style={{ width: "110px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading designer sheets...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>No design tasks assigned to you.</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td style={{ fontWeight: 700 }}>{task.order_number || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{task.product_name}</td>
                    <td className="capitalize font-semibold text-slate-500">{task.category_name}</td>
                    <td>{new Date(task.assigned_on).toLocaleDateString()}</td>
                    <td>{new Date(task.completion_time).toLocaleDateString()}</td>
                    
                    {/* തത്സമയ അപ്പ്രൂവൽ പ്രോഗ്രസ്സ് അപ്ഡേറ്റ് ഡ്രോപ്പ്ഡൗൺ 🌟 */}
                    <td className="text-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`${styles.statusSelect} ${getStatusStyle(task.status)}`}
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
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={10} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

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