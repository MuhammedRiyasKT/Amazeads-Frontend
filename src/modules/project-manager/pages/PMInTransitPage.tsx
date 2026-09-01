"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Eye,
  CheckCircle2,
  RotateCcw,
  Filter,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getInTransitOrders, getDeliveryTypes } from "../services/courierTracking.service";
import MarkDeliveredModal from "../components/MarkDeliveredModal";
import styles from "../components/PMOrderComponents.module.css";

// ─── Order Details Modal ───────────────────────────────────────────────────────

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch { return dateStr; }
  };

  if (!order) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Truck size={16} className="text-indigo-600" />
                Order #{order.order_number || order.id}
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {order.customer_name} — In Transit Details
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

            {/* Tracking Info */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Truck size={12} className="text-indigo-500" /> Tracking Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Tracking ID</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {order.tracking_id || "Not Assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Delivery Type</span>
                  <span className="font-bold text-slate-800 capitalize">{order.delivery_type_name || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Expected Days</span>
                  <span className="font-bold text-slate-800">{order.expected_delivery_days || 0} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Days Left</span>
                  <span className="font-bold text-emerald-700">{order.days_left ?? "—"} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Days Over</span>
                  <span className={`font-bold ${(order.days_over || 0) > 0 ? "text-rose-600" : "text-slate-700"}`}>
                    {order.days_over ?? 0} Days
                  </span>
                </div>
              </div>
            </div>

            {/* Order Line Items */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Order Line Items ({order.projects?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {(order.projects || []).length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    No line items found.
                  </div>
                ) : (
                  (order.projects || []).map((proj: any) => (
                    <div key={proj.id} className="p-3.5 flex items-start gap-3 bg-white hover:bg-slate-50/60 transition-colors">
                      {/* Image */}
                      {proj.project_images && proj.project_images.length > 0 ? (
                        <img
                          src={proj.project_images[0].img_url}
                          alt={proj.project_name}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold flex-shrink-0">
                          No Img
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-slate-800 text-xs block truncate">{proj.project_name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{proj.description || "Standard Specification"}</span>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-semibold">
                          <span>Qty: <strong className="text-slate-800">{proj.quantity}</strong></span>
                          <span>Print Date: <strong className="text-slate-700">{formatDateStyle(proj.printing_date)}</strong></span>
                        </div>
                      </div>


                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PMInTransitPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("");

  // View details modal
  const [viewOrder, setViewOrder] = useState<any>(null);

  // Mark Delivered modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);

  useEffect(() => {
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (searchOrder) filters.order_number = searchOrder;
      if (searchCustomer) filters.customer_name = searchCustomer;
      if (deliveryTypeFilter) filters.delivery_type_id = Number(deliveryTypeFilter);

      const data = await getInTransitOrders(currentPage, 5, filters);
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || (data.items || []).length);
    } catch (err) {
      console.error("Error loading in-transit orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, deliveryTypeFilter]);

  const handleResetFilters = () => {
    setSearchOrder("");
    setSearchCustomer("");
    setDeliveryTypeFilter("");
    setCurrentPage(1);
  };

  // ETA Badge
  const getEtaBadge = (daysLeft: number = 0, daysOver: number = 0) => {
    if (daysOver > 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          Overdue by {daysOver} {daysOver === 1 ? "Day" : "Days"}
        </span>
      );
    }
    if (daysLeft === 0 && daysOver === 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Delivery Today
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {daysLeft} {daysLeft === 1 ? "Day Left" : "Days Left"}
      </span>
    );
  };

  return (
    <div className={styles.container}>

      {/* Title */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Courier &amp; Tracking — In Transit</h1>
        <p className={styles.subtitle}>Track live dispatched shipments currently in transit to customer destinations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders In Transit</span>
            <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivering Today</span>
            <span className="text-lg font-extrabold text-slate-900">
              {orders.filter((o) => (o.days_left === 0 && o.days_over === 0)).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Shipments</span>
            <span className="text-lg font-extrabold text-slate-900">
              {orders.filter((o) => (o.days_over || 0) > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px]">
          <Filter size={14} className="text-indigo-600" /> Filters:
        </div>

        <input
          type="text"
          placeholder="Search Order Number..."
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          className="h-9 border rounded-lg px-3 bg-white text-xs focus:outline-none border-slate-200"
        />

        <input
          type="text"
          placeholder="Search Customer..."
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          className="h-9 border rounded-lg px-3 bg-white text-xs focus:outline-none border-slate-200"
        />

        <select
          value={deliveryTypeFilter}
          onChange={(e) => { setDeliveryTypeFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800"
        >
          <option value="">All Delivery Types</option>
          {deliveryTypes.map((dt) => (
            <option key={dt.id} value={dt.id}>{dt.name}</option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer ml-auto"
          title="Reset Filters"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "110px" }}>ORDER NUMBER</th>
                <th style={{ width: "160px" }}>CUSTOMER</th>
                <th style={{ width: "150px" }}>TRACKING ID</th>
                <th style={{ width: "140px" }}>DELIVERY TYPE</th>
                <th style={{ width: "140px", textAlign: "center" }}>ETA / STATUS</th>
                <th style={{ width: "120px" }}>TOTAL AMOUNT</th>
                <th style={{ width: "100px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "140px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 font-semibold text-slate-500">Loading transit shipments...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 font-semibold text-slate-500">No active shipments in transit.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-extrabold text-slate-900">#{order.order_number || order.id}</td>
                    <td className="font-bold text-slate-800">{order.customer_name}</td>

                    <td className="font-mono text-xs">
                      {order.tracking_id ? (
                        <span className="font-bold text-indigo-700">{order.tracking_id}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Tracking ID Not Assigned</span>
                      )}
                    </td>

                    <td className="font-semibold text-slate-700 capitalize">{order.delivery_type_name || "—"}</td>

                    <td className="text-center">{getEtaBadge(order.days_left, order.days_over)}</td>

                    <td className="font-extrabold text-slate-900">₹{(order.final_amount || 0).toLocaleString("en-IN")}</td>

                    <td className="text-center">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase bg-indigo-600 text-white">
                        In Transit
                      </span>
                    </td>

                    {/* ACTION: Eye (view) + Mark Delivered */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer transition-all"
                          title="View Order Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeliveredModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 size={12} /> Mark Delivered
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>

      {/* Order Details Modal (Eye icon) */}
      {viewOrder && (
        <OrderDetailsModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}

      {/* Mark Delivered Modal */}
      <MarkDeliveredModal
        isOpen={isDeliveredModalOpen}
        orderId={selectedOrder?.id || null}
        orderNumber={selectedOrder?.order_number || null}
        onClose={() => {
          setIsDeliveredModalOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => {
          setIsDeliveredModalOpen(false);
          fetchOrders();
        }}
      />
    </div>
  );
}