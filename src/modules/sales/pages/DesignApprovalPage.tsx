"use client";

import React, { useEffect, useState } from "react";
import { Eye, Check, X, ClipboardCheck } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { getPendingDesignApprovals, submitCustomerApproval } from "../services/designApproval.service";
import DesignApprovalDetailsModal from "../components/DesignApprovalDetailsModal";
import styles from "../components/DesignApprovalComponents.module.css";

export default function DesignApprovalPage() {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const loadPendingList = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingDesignApprovals();
      setPendingList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingList();
  }, []);

  // കസ്റ്റമർ ഡിസൈൻ അപ്പ്രൂവൽ സബ്മിറ്റ് ചെയ്യുന്നു 🌟
  const handleApprovalAction = async (projectId: number, approvedStatus: boolean) => {
    const isConfirm = window.confirm(
      `Are you sure you want to ${approvedStatus ? "APPROVE" : "REJECT"} this design proof?`
    );
    if (!isConfirm) return;

    try {
      await submitCustomerApproval(projectId, approvedStatus);
      alert(`Customer design status updated successfully!`);
      loadPendingList(); // ടേബിൾ റീഫ്രഷ് ചെയ്യുന്നു (അംഗീകരിച്ച പ്രൊജക്റ്റ് തനിയെ ലിസ്റ്റിൽ നിന്നും ഒഴിവാകും)
    } catch (err) {
      console.error(err);
      alert("Failed to update approval status.");
    }
  };

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
        <h1 className={styles.title}>Design Approvals Desk</h1>
        <p className={styles.subtitle}>Verify and submit customer design approvals before forwarding to the printing unit.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER ID</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "140px" }}>COMPLETED ON</th>
                <th style={{ width: "140px" }}>ASSIGNED TO</th>
                <th style={{ width: "120px" }}>DEADLINE</th>
                <th style={{ width: "140px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>Loading pending approvals...</td></tr>
              ) : pendingList.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>No design proofs awaiting customer approval.</td></tr>
              ) : (
                pendingList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td style={{ fontWeight: 700 }}>{item.order_number || `Order #${item.order_id}`}</td>
                    <td style={{ fontWeight: 700 }}>{item.customer_name}</td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{item.product_name}</td>
                    <td>{new Date(item.completed_on).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }} className="capitalize">{item.assigned_to_name || "Anas"}</td>
                    <td style={{ fontWeight: 700 }}>{formatDateStyle(item.commit_date)}</td>
                    <td className="text-center">
                      <div className={styles.actionGroup}>
                        {/* കൂടുതൽ സ്പെസിഫിക്കേഷൻ കാണാനുള്ള ബട്ടൺ */}
                        <button 
                          onClick={() => { setSelectedTaskId(item.task_id); setIsViewOpen(true); }}
                          className={styles.actionBtn}
                        >
                          <Eye size={13} />
                        </button>
                        
                        {/* അപ്പ്രൂവൽ ആക്ഷൻ ബട്ടണുകൾ 🌟 */}
                        <button 
                          onClick={() => handleApprovalAction(item.project_id, true)}
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all cursor-pointer border border-green-100"
                          title="Approve Design"
                        >
                          <Check size={13} className="stroke-[3px]" />
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

      <DesignApprovalDetailsModal 
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