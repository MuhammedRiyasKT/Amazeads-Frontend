"use client";

import React, { useEffect, useState } from "react";
import { Package, Box, DollarSign, Filter, RotateCcw, Truck, CheckCircle2, Eye, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getCourierOrders, getDeliveryTypes } from "../services/courierTracking.service";
import MoveToTransitModal from "../components/MoveToTransitModal";
import MarkDeliveredFromPackedModal from "../components/MarkDeliveredFromPackedModal";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import styles from "../components/PMOrderComponents.module.css";

export default function PMPackedOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [statusFilter, setStatusFilter] = useState("Packed");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("");

  // View Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [isDeliveredFromPackedModalOpen, setIsDeliveredFromPackedModalOpen] = useState(false);

  // Helper: resolve delivery type name from fetched deliveryTypes list when API returns null
  const getResolvedDeliveryTypeName = (order: any): string => {
    if (order.delivery_type_name) return order.delivery_type_name;
    const found = deliveryTypes.find((dt) => dt.id === order.delivery_type_id);
    return found?.name || "";
  };

  // Helper: detect delivery types that skip transit and go directly to delivered
  const isDirectDeliveryType = (typeName?: string): boolean => {
    const name = (typeName || "").toLowerCase().trim();
    return name === "customer pickup" || name === "self installation";
  };

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

      const data = await getCourierOrders(currentPage, 5, statusFilter, filters);
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
  }, [currentPage, statusFilter, deliveryTypeFilter]);

  const openViewModal = (order: any) => {
    setSelectedOrderId(order.id);
    setIsViewOpen(true);
  };

  const handleResetFilters = () => {
    setSearchOrder("");
    setSearchCustomer("");
    setStatusFilter("Packed");
    setDeliveryTypeFilter("");
    setCurrentPage(1);
  };

  // Status Badge Styling
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "packed") return "bg-amber-500 text-white";
    if (s === "confirmed") return "bg-blue-600 text-white";
    if (s === "in progress") return "bg-purple-600 text-white";
    if (s === "in transit") return "bg-indigo-600 text-white";
    if (s === "delivered") return "bg-emerald-600 text-white";
    return "bg-slate-500 text-white";
  };

  // KPI Calculations
  const totalPackedOrders = totalCount;
  const totalUnits = orders.reduce((sum, o) => sum + (o.total_units || 0), 0);
  const totalAmount = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Title */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Courier & Tracking — Packed Orders</h1>
        <p className={styles.subtitle}>Review packed orders waiting to be dispatched to transit couriers.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Packed Orders</span>
            <span className="text-lg font-extrabold text-slate-900">{totalPackedOrders}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Box size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Units Queued</span>
            <span className="text-lg font-extrabold text-slate-900">{totalUnits}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount Value</span>
            <span className="text-lg font-extrabold text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px]">
          <Filter size={14} className="text-indigo-600" /> Filters:
        </div>

        <select
          value={deliveryTypeFilter}
          onChange={(e) => { setDeliveryTypeFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800"
        >
          <option value="">All Delivery Types</option>
          {deliveryTypes.map((dt) => (
            <option key={dt.id} value={dt.id}>
              {dt.name}
            </option>
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

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>ORDER NUMBER</th>
                <th style={{ width: "160px" }}>CUSTOMER</th>
                <th style={{ width: "110px" }}>MOBILE</th>
                <th style={{ width: "100px" }}>ORDER DATE</th>
                <th style={{ width: "130px" }}>DELIVERY TYPE</th>
                <th style={{ width: "70px", textAlign: "center" }}>UNITS</th>
                <th style={{ width: "110px" }}>FINAL AMOUNT</th>
                <th style={{ width: "110px" }}>TRACKING ID</th>
                <th style={{ width: "100px", textAlign: "center" }}>PAYMENT</th>
                <th style={{ width: "100px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "170px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={11} className="text-center py-10 font-semibold text-slate-500">Loading packed orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10 font-semibold text-slate-500">No packed orders found.</td></tr>
              ) : (
                orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="font-extrabold text-slate-900">#{order.order_number || order.id}</td>
                        <td className="font-bold text-slate-800">{order.customer_name}</td>
                        <td className="text-slate-600">{order.customer_mobile_number || "—"}</td>
                        <td className="text-slate-600">{formatDateStyle(order.order_date)}</td>
                        <td className="font-semibold text-indigo-700 capitalize">{getResolvedDeliveryTypeName(order) || "—"}</td>
                        <td className="text-center font-bold text-slate-700">{order.total_units || 0}</td>
                        <td className="font-extrabold text-slate-900">₹{(order.final_amount || 0).toLocaleString("en-IN")}</td>
                        <td className="font-mono text-slate-600">{order.tracking_id || "—"}</td>
                        <td className="text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {order.payment_status || "Paid"}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${getStatusBadge(order.order_status)}`}>
                            {order.order_status || "Packed"}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* View Icon */}
                            <button
                              onClick={() => openViewModal(order)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye size={14} />
                            </button>
                            {/* Action Button */}
                            {isDirectDeliveryType(getResolvedDeliveryTypeName(order)) ? (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDeliveredFromPackedModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <CheckCircle2 size={12} /> Mark Delivered
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsTransitModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Truck size={12} /> Move To Transit
                              </button>
                            )}
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

      {/* Move To Transit Modal */}
      <MoveToTransitModal
        isOpen={isTransitModalOpen}
        orderId={selectedOrder?.id || null}
        orderNumber={selectedOrder?.order_number || null}
        defaultDeliveryTypeId={selectedOrder?.delivery_type_id}
        onClose={() => {
          setIsTransitModalOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => {
          setIsTransitModalOpen(false);
          fetchOrders();
        }}
      />

      {/* Mark Delivered From Packed Modal (Customer Pickup / Self Installation) */}
      <MarkDeliveredFromPackedModal
        isOpen={isDeliveredFromPackedModalOpen}
        orderId={selectedOrder?.id || null}
        orderNumber={selectedOrder?.order_number || null}
        deliveryTypeName={selectedOrder?.delivery_type_name}
        defaultDeliveryTypeId={selectedOrder?.delivery_type_id}
        onClose={() => {
          setIsDeliveredFromPackedModalOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => {
          setIsDeliveredFromPackedModalOpen(false);
          fetchOrders();
        }}
      />

      {/* View Order Details Modal */}
      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />
    </div>
  );
}