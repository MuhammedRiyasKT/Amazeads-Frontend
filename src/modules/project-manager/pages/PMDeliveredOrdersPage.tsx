"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, DollarSign, Package } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getCourierOrders } from "../services/courierTracking.service";
import styles from "../components/PMOrderComponents.module.css";

export default function PMDeliveredOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getCourierOrders(currentPage, 5, "Delivered");
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || (data.items || []).length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Courier & Tracking — Delivered Orders</h1>
        <p className={styles.subtitle}>Read-only historical register of fully delivered customer orders.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Orders</span>
            <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Closed Revenue</span>
            <span className="text-lg font-extrabold text-slate-900">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Closed Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "120px" }}>ORDER NUMBER</th>
                <th style={{ width: "200px" }}>CUSTOMER</th>
                <th style={{ width: "160px" }}>TRACKING ID</th>
                <th style={{ width: "160px" }}>DELIVERY TYPE</th>
                <th style={{ width: "140px" }}>FINAL AMOUNT</th>
                <th style={{ width: "120px", textAlign: "center" }}>DELEVERED STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 font-semibold text-slate-500">Loading closed orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 font-semibold text-slate-500">No delivered orders found in history.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-extrabold text-slate-900">#{order.order_number || order.id}</td>
                    <td className="font-bold text-slate-800">{order.customer_name}</td>
                    <td className="font-mono text-slate-600">{order.tracking_id || "—"}</td>
                    <td className="font-semibold text-slate-700 capitalize">{order.delivery_type_name || "—"}</td>
                    <td className="font-extrabold text-slate-900">₹{(order.final_amount || 0).toLocaleString("en-IN")}</td>
                    <td className="text-center">
                      <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-red-200 inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Closed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>
    </div>
  );
}