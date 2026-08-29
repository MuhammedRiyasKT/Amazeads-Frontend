"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse, SalesOrderStatusData } from "../types";
import { getOrdersList } from "../services/order.service";
import { getSalesOrderStatusKpi } from "../services/salesKpi.service";
import OrderListKpiCards from "../components/OrderListKpiCards";
import OrderFilters from "../components/OrderFilters";
import ViewOrderModal from "../components/ViewOrderModal";
import UpdatePaymentModal from "../components/UpdatePaymentModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import { useSalesStore } from "@/store/salesStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "../components/OrderListComponents.module.css";

export default function OrderListPage() {
  const { selectedCategory } = useSalesStore();

  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // KPI States
  const [kpiData, setKpiData] = useState<SalesOrderStatusData | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [errorKpi, setErrorKpi] = useState(false);

  const fetchKpi = async () => {
    setLoadingKpi(true);
    setErrorKpi(false);
    try {
      const res = await getSalesOrderStatusKpi({ upto_today: true });
      if (res && res.success) {
        setKpiData(res.data);
      } else {
        setErrorKpi(true);
      }
    } catch (err) {
      console.error("Error fetching order status KPIs:", err);
      setErrorKpi(true);
    } finally {
      setLoadingKpi(false);
    }
  };

  useEffect(() => {
    fetchKpi();
  }, []);

  // Live Auto-Apply Filter States
  const [mobileSearch, setMobileSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [commitToDate, setCommitToDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState("");
  const [priceCategoryId, setPriceCategoryId] = useState("");

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  // Fetch active sales orders
  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = {
        page: pageToFetch,
        page_size: 5,
        category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
        is_quotation: false // 🌟 ONLY FETCH ACTIVE SALES ORDERS
      };

      if (mobileSearch.trim()) activeFilters.mobile_number = mobileSearch.trim();
      if (orderStatus) activeFilters.order_status = orderStatus;
      if (paymentStatus) activeFilters.payment_status = paymentStatus;
      if (commitToDate) activeFilters.commit_to_date = commitToDate;
      if (completionDate) activeFilters.completion_date = completionDate;
      if (deliveryTypeId) activeFilters.delivery_type_id = parseInt(deliveryTypeId);
      if (priceCategoryId) activeFilters.product_price_category_id = parseInt(priceCategoryId);

      const data = await getOrdersList(activeFilters);
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching orders list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedCategory,
    mobileSearch,
    orderStatus,
    paymentStatus,
    commitToDate,
    completionDate,
    deliveryTypeId,
    priceCategoryId
  ]);

  const handleCommitToDate = (val: string) => {
    setCommitToDate(val);
    setCurrentPage(1);
  };

  const handleCompletionDate = (val: string) => {
    setCompletionDate(val);
    setCurrentPage(1);
  };

  const handleSetOrderStatus = (val: string) => {
    setCurrentPage(1);
    setOrderStatus(val);
  };

  const handleSetMobileSearch = (val: string) => {
    setCurrentPage(1);
    setMobileSearch(val);
  };

  const handleClearFilters = () => {
    setMobileSearch("");
    setOrderStatus("");
    setPaymentStatus("");
    setCommitToDate("");
    setCompletionDate("");
    setDeliveryTypeId("");
    setPriceCategoryId("");
    setCurrentPage(1);
  };

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const draftCount = orders.filter((o) => o.order_status === "Draft").length;
  const confirmedCount = orders.filter((o) => o.order_status === "Confirmed").length;

  const formatDateStyle = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

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
          <h1 className={styles.title}>Sales Orders</h1>
          <p className={styles.subtitle}>
            Manage active orders, payment statuses and production workflow routes.
          </p>
        </div>
        <Link href="/sales/orders/create" passHref legacyBehavior>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer font-bold"
            onClick={() => useSidebarStore.getState().setCollapsed(true)}
          >
            <Plus size={16} /> New Sales Order
          </Button>
        </Link>
      </div>

      {/* Order Pipeline KPIs */}
      <OrderListKpiCards
        data={kpiData}
        loading={loadingKpi}
        error={errorKpi}
        onRetry={fetchKpi}
      />

      {/* Order Filters */}
      <OrderFilters
        mobileSearch={mobileSearch}
        setMobileSearch={handleSetMobileSearch}
        orderStatus={orderStatus}
        setOrderStatus={handleSetOrderStatus}
        commitToDate={commitToDate}
        setCommitToDate={handleCommitToDate}
        completionDate={completionDate}
        setCompletionDate={handleCompletionDate}
      />

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "95px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                <th style={{ width: "100px" }}>ACCOUNT</th>
                <th style={{ width: "100px" }}>FINAL AMT</th>
                <th style={{ width: "90px", textAlign: "center" }}>PAYMENT STATUS</th>
                <th style={{ width: "90px", textAlign: "center" }}>ORDER STATUS</th>
                <th style={{ width: "80px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                    Loading active sales orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "24px" }}>
                    No sales order records found.
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
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  {order.order_number ? `#${order.order_number}` : "—"}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="font-bold text-slate-800">{order.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                </td>
                              </>
                            )}

                            <td className="font-bold text-[0.78rem] text-slate-700 relative">
                              <span
                                className="hover:text-indigo-600 transition-colors cursor-pointer border-b border-dashed border-slate-300"
                                onClick={() => {
                                  if (proj) {
                                    setSelectedTimelineProjectId(
                                      selectedTimelineProjectId === proj.id ? null : proj.id
                                    );
                                  }
                                }}
                                title="Click to view department progress timeline"
                              >
                                {proj ? proj.project_name : "—"}
                              </span>

                              {proj && selectedTimelineProjectId === proj.id && (
                                <ProjectProgressTimelineDropdown
                                  projectId={proj.id}
                                  onClose={() => setSelectedTimelineProjectId(null)}
                                  position="bottom"
                                  role="sales"
                                />
                              )}
                            </td>

                            <td style={{ textAlign: "center", color: "#64748b" }}>
                              {proj ? proj.quantity : "—"}
                            </td>

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                  {formatDateStyle(order.commit_date || "")}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                  {formatDateStyle(order.completion_date || "")}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle font-bold text-slate-600">
                                  {order.account_name || "—"}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  <span className={getPaymentBadgeClass(order.payment_status)}>
                                    {order.payment_status || "Pending"}
                                  </span>
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle font-bold text-slate-700">
                                  <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {order.order_status || "Confirmed"}
                                  </span>
                                </td>

                                {/* ACTION COLUMN */}
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* 🌟 Flow 2: Edit Normal Order Button (`/sales/create-order?order_id={id}`) */}
                                    <Link href={`/sales/create-order?order_id=${order.id}`} passHref legacyBehavior>
                                      <button
                                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
                                        title="Edit Sales Order"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                    </Link>

                                    <button
                                      onClick={() => handleViewClick(order.id)}
                                      className={styles.actionBtn}
                                      title="View Order Details"
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