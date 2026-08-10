"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, Filter, RefreshCw, IndianRupee, Wallet, CheckCircle } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";
import ViewOrderModal from "../components/ViewOrderModal";
import styles from "../components/OrderListComponents.module.css";

export default function PaymentsPage() {
  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [mobileSearch, setMobileSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = { page: pageToFetch, page_size: 5 };
      if (mobileSearch) activeFilters.mobile_number = mobileSearch;
      if (paymentStatus) activeFilters.payment_status = paymentStatus;
      if (fromDate) activeFilters.from_date = fromDate;
      if (toDate) activeFilters.to_date = toDate;

      const data = await getOrdersList(activeFilters);
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching orders for payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };

  const handleClearFilters = () => {
    setMobileSearch("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    
    setIsLoading(true);
    getOrdersList({ page: 1, page_size: 5 })
      .then((data) => {
        setOrders(data.items || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalCount(data.pagination?.total_count || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const formatDateStyle = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  // KPI calculations based on current page
  const pageTotalPaid = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
  const pageTotalDue = orders.reduce((sum, order) => sum + (order.balance_amount || 0), 0);

  const getPaymentBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "partial":
        return "bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "pending":
        return "bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Payment Register</h1>
          <p className={styles.subtitle}>View sales accounts, paid status, and handle due amounts verification.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconBlue}`}>
            <Wallet size={20} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Total Transactions</span>
            <strong className={styles.kpiValue}>{totalCount}</strong>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconGreen}`}>
            <CheckCircle size={20} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Page Paid Total</span>
            <strong className={styles.kpiValue}>₹{pageTotalPaid.toLocaleString("en-IN")}</strong>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.iconAmber}`}>
            <IndianRupee size={20} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Page Due Total</span>
            <strong className={styles.kpiValue}>₹{pageTotalDue.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Mobile search */}
          <div className="relative">
            <input
              type="number"
              placeholder="Search Mobile No..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>

          {/* Payment Status filter */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="h-10 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>

          {/* From Date */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none"
            title="From Date"
          />

          {/* To Date */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none"
            title="To Date"
          />
        </div>

        <div className="flex justify-end gap-2.5 border-t pt-3">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Filter size={12} /> Apply Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "95px" }}>ORDER DATE</th>
                <th style={{ width: "100px" }}>ACCOUNT</th>
                <th style={{ width: "100px" }}>PAID AMOUNT</th>
                <th style={{ width: "100px" }}>DUE AMOUNT</th>
                <th style={{ width: "100px" }}>TOTAL AMOUNT</th>
                <th style={{ width: "90px", textAlign: "center" }}>PAYMENT STATUS</th>
                <th style={{ width: "65px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-indigo-600" />
                      <span>Loading payments details...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj, pIdx) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`}>
                            {isFirstRow && (
                              <>
                                <td
                                  rowSpan={projectsCount}
                                  style={{ fontWeight: 700 }}
                                  className="align-middle whitespace-nowrap"
                                >
                                  {order.order_number ? `#${order.order_number}` : `#${order.id}`}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle"
                                >
                                  <div className="font-bold text-slate-800">{order.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                </td>
                              </>
                            )}

                            {/* Product column */}
                            <td className="font-bold text-[0.78rem] text-slate-700">
                              {proj ? proj.project_name : "—"}
                            </td>

                            {/* Quantity column */}
                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap text-xs text-slate-600"
                                >
                                  {formatDateStyle(order.order_date)}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle font-bold text-slate-600"
                                >
                                  {order.account_name || "—"}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap"
                                >
                                  <span className={styles.paidBubble}>
                                    ₹{(order.paid_amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap"
                                >
                                  <span className={styles.dueBubble}>
                                    ₹{(order.balance_amount || 0).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle whitespace-nowrap font-bold text-slate-800"
                                >
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  style={{ textAlign: "center" }}
                                  className="align-middle"
                                >
                                  <span className={getPaymentBadgeClass(order.payment_status)}>
                                    {order.payment_status || "Pending"}
                                  </span>
                                </td>
                                <td
                                  rowSpan={projectsCount}
                                  className="align-middle"
                                >
                                  <div className={styles.actionGroup}>
                                    <button
                                      onClick={() => handleViewClick(order.id)}
                                      className={styles.actionBtn}
                                      title="View Details"
                                    >
                                      <Eye size={13} />
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
              Showing page <span className={styles.highlightText}>{currentPage}</span> of{" "}
              <span className={styles.highlightText}>{totalPages}</span> ({totalCount} orders)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      <ViewOrderModal
        isOpen={isViewOpen}
        orderId={selectedOrderId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedOrderId(null);
        }}
      />
    </div>
  );
}
