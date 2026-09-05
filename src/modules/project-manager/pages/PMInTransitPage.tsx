"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Eye,
  CheckCircle2,
  RotateCcw,
  Clock,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getInTransitOrders, getDeliveryTypes } from "../services/courierTracking.service";
import MarkDeliveredModal from "../components/MarkDeliveredModal";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import styles from "../components/PMOrderComponents.module.css";

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

  // Timeline & View Order Details Modal State
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

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
                <th>PRODUCT</th>
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
                <tr><td colSpan={9} className="text-center py-10 font-semibold text-slate-500">Loading transit shipments...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 font-semibold text-slate-500">No active shipments in transit.</td></tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`} className="hover:bg-slate-50/80 transition-colors">
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle">
                                  #{order.order_number || order.id}
                                </td>
                                <td rowSpan={projectsCount} className="font-bold text-slate-800 align-middle">
                                  {order.customer_name}
                                </td>
                              </>
                            )}

                            {/* Product Name (Clickable Timeline Dropdown) */}
                            <td
                              style={{
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                position: "relative",
                                zIndex: proj && selectedTimelineProjectId === (proj.id || proj.project_id) ? 50 : undefined
                              }}
                              className="align-middle"
                            >
                              <span
                                className={proj || order.id ? "cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block" : ""}
                                onClick={() => {
                                  const pId = proj?.id || proj?.project_id || order.project_id || order.id;
                                  if (pId) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === pId ? null : pId
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : order.product_name || "—"}
                              </span>

                              {(proj?.id || proj?.project_id || order.project_id || order.id) && selectedTimelineProjectId === (proj?.id || proj?.project_id || order.project_id || order.id) && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj?.id || proj?.project_id || order.project_id || order.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                  role="project-manager"
                                />
                              )}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="font-mono text-xs align-middle">
                                  {order.tracking_id ? (
                                    <span className="font-bold text-indigo-700">{order.tracking_id}</span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">Tracking ID Not Assigned</span>
                                  )}
                                </td>
                                <td rowSpan={projectsCount} className="font-semibold text-slate-700 capitalize align-middle">{order.delivery_type_name || "—"}</td>
                                <td rowSpan={projectsCount} className="text-center align-middle">{getEtaBadge(order.days_left, order.days_over)}</td>
                                <td rowSpan={projectsCount} className="font-extrabold text-slate-900 align-middle">₹{(order.final_amount || 0).toLocaleString("en-IN")}</td>
                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase bg-indigo-600 text-white">
                                    In Transit
                                  </span>
                                </td>
                                <td rowSpan={projectsCount} className="text-center align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
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
                              </>
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
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} orders)
            </div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>

      {/* Order Details Modal (ViewOrderModal) */}
      <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} onClose={() => setIsViewOpen(false)} />

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