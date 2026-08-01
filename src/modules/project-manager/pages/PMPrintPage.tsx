"use client";

import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "../services/managerOrder.service";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import AssignTaskModal from "../components/AssignTaskModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMPrintPage() {
  const [flatProjects, setFlatProjects] = useState<any[]>([]); // സ്റ്റേറ്റ് പേര് flatProjects എന്ന് ശരിയാക്കി 🌟
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // useState സിന്റാക്സ് തിരുത്തി 🌟

  // Modals States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchPrintProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getPMOrders(currentPage, 5);
      const list: any[] = [];
      const todayStr = new Date().toISOString().substring(0, 10);

      (data.items || []).forEach((order: any) => {
        (order.projects || []).forEach((proj: any) => {
          list.push({
            ...proj,
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            order_date: order.order_date,
            final_amount: order.final_amount,
            order_status: order.order_status
          });
        });
      });

      // ഇന്നത്തെ പ്രിന്റിങ് തീയതി ഉള്ളവയും അൺ-അസൈൻ ചെയ്തതുമായ പ്രൊജക്റ്റുകൾ ഫിൽട്ടർ ചെയ്യുന്നു
      const filteredPrintProjects = list.filter(
        (p) => p.printing_date === todayStr && (!p.departments || p.departments.every((d: any) => d.status === "Pending"))
      );
      
      setFlatProjects(filteredPrintProjects);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(filteredPrintProjects.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintProjects();
  }, [currentPage]);

  const formatDateStyle = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Products For Print</h1>
        <p className={styles.subtitle}>Production files mapped for today's UV/Acrylic print deadlines.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th className={styles.borderCol}>PRODUCT</th>
                <th style={{ width: "70px", textAlign: "center" }} className={styles.borderRight}>QTY</th>
                <th style={{ width: "120px" }}>DATE</th>
                <th style={{ width: "120px" }}>TOTAL</th>
                <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "160px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>Loading printing sheets...</td></tr>
              ) : flatProjects.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>No printing templates mapped for today's deadline.</td></tr>
              ) : (
                flatProjects.map((proj, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td style={{ fontWeight: 700 }}>{proj.order_number || `Order #${proj.order_id}`}</td>
                    <td style={{ fontWeight: 700 }}>{proj.customer_name}</td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{proj.project_name}</td>
                    <td style={{ textAlign: "center", color: "#64748b" }}>{proj.quantity}</td>
                    <td>{formatDateStyle(proj.order_date)}</td>
                    <td style={{ fontWeight: 700 }}>₹{proj.amount.toLocaleString()}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.statusBadge} ${styles.badgeProject}`}>{proj.status}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1.5 items-center">
                        <button 
                          onClick={() => { setSelectedOrderId(proj.order_id); setIsViewOpen(true); }}
                          className={styles.actionBtn}
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          onClick={() => { 
                            setSelectedOrderId(proj.order_id); 
                            setSelectedProjectId(proj.id); 
                            setIsAssignOpen(true); 
                          }}
                          className={styles.createIdBtn}
                        >
                          <Plus size={10} /> Assign Task
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
      
      <AssignTaskModal 
        isOpen={isAssignOpen} 
        orderId={selectedOrderId} 
        projectId={selectedProjectId} 
        forceDepartmentType="printing" 
        onClose={() => setIsAssignOpen(false)} 
        onSuccess={() => { setIsAssignOpen(false); fetchPrintProjects(); }} 
      />
    </div>
  );
}