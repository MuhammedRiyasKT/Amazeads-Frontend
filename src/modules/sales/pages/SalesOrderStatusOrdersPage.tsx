"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, RefreshCw, ShoppingCart, ArrowRightLeft, Calendar, User, Lock } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";
import ViewOrderModal from "../components/ViewOrderModal";
import ConfirmCloseOrderModal from "../components/ConfirmCloseOrderModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import { useSalesStore } from "@/store/salesStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "../components/OrderListComponents.module.css";

type StatusKey = "quotations" | "new_orders" | "ongoing" | "to_close";

interface TabConfig {
  key: StatusKey;
  label: string;
  title: string;
  subtitle: string;
  badgeClass: string;
  getParams: (page: number, categoryId: number) => any;
}

const TAB_CONFIGS: Record<StatusKey, TabConfig> = {
  quotations: {
    key: "quotations",
    label: "Quotations",
    title: "Quotations (Draft)",
    subtitle: "Draft quotation estimates awaiting customer conversion",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    getParams: (page, categoryId) => ({
      page,
      page_size: 5,
      category_id: categoryId,
      is_quotation: true,
      order_status: "Draft",
    }),
  },
  new_orders: {
    key: "new_orders",
    label: "New Orders",
    title: "New Orders (Confirmed)",
    subtitle: "Freshly confirmed orders ready for routing and production",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    getParams: (page, categoryId) => ({
      page,
      page_size: 5,
      category_id: categoryId,
      is_quotation: false,
      order_status: "Confirmed",
    }),
  },
  ongoing: {
    key: "ongoing",
    label: "Ongoing Orders",
    title: "Ongoing Orders",
    subtitle: "Orders actively in progress across departments and pipelines",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    getParams: (page, categoryId) => ({
      page,
      page_size: 5,
      category_id: categoryId,
      is_quotation: false,
      order_status: "Ongoing",
    }),
  },
  to_close: {
    key: "to_close",
    label: "To Close",
    title: "Orders To Close (Delivered)",
    subtitle: "Delivered customer orders ready for final closure audit",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    getParams: (page, categoryId) => ({
      page,
      page_size: 5,
      order_status: "Delivered",
      category_id: categoryId,
    }),
  },
};

export default function SalesOrderStatusOrdersPage() {
  const searchParams = useSearchParams();
  const rawStatus = (searchParams.get("status") || "quotations").toLowerCase();

  const activeKey: StatusKey = useMemo(() => {
    if (rawStatus.includes("new")) return "new_orders";
    if (rawStatus.includes("ongoing")) return "ongoing";
    if (rawStatus.includes("close") || rawStatus.includes("deliver")) return "to_close";
    return "quotations";
  }, [rawStatus]);

  const activeConfig = TAB_CONFIGS[activeKey];
  const { selectedCategory } = useSalesStore();

  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);
  const [selectedCloseOrder, setSelectedCloseOrder] = useState<any>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
      const params = activeConfig.getParams(pageToFetch, activeCategoryId);
      const data = await getOrdersList(params);

      const items = data.items || [];
      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching status orders list:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeKey, selectedCategory]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [activeKey, currentPage, selectedCategory]);


  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const formatDateStyle = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "partial":
        return "bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      case "not paid":
        return "bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header Row with Back Button */}
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div className="flex items-center gap-3">
          <Link
            href="/sales"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer shrink-0"
            title="Return to Sales Overview"
          >
            <ArrowLeft size={14} /> Back to Overview
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={styles.title}>{activeConfig.title}</h1>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${activeConfig.badgeClass}`}>
                {totalCount} Orders
              </span>
            </div>
            <p className={styles.subtitle}>{activeConfig.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => fetchOrders(currentPage)}
          disabled={isLoading}
          className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
          title="Refresh List"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "95px" }}>ORDER ID</th>
                <th style={{ width: "150px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "50px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "110px" }}>COMMIT DATE</th>
                <th style={{ width: "110px" }}>COMPLETION DATE</th>
                <th style={{ width: "110px" }}>ACCOUNT</th>
                <th style={{ width: "105px" }}>FINAL AMT</th>
                <th style={{ width: "100px", textAlign: "center" }}>PAYMENT</th>
                <th style={{ width: "100px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: activeKey === "to_close" ? "140px" : "85px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "28px" }}>
                    Loading {activeConfig.label} records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "36px" }} className="text-slate-400 italic">
                    No {activeConfig.label} found for the selected category.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${order.id}-${proj?.id || pIdx}`}>
                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  {order.order_number ? `#${order.order_number}` : "-"}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="font-bold text-slate-800">{order.customer_name || "—"}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number || "—"}</div>
                                </td>
                              </>
                            )}

                            {/* Product Name with Progress Timeline Dropdown */}
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
                                {proj ? proj.project_name || proj.product_name : "—"}
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
                                  {formatDateStyle(order.commit_date || order.order_date)}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                  {formatDateStyle(order.completion_date)}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle font-bold text-slate-600">
                                  {order.account_name || "—"}
                                </td>
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                  <span className={getPaymentBadgeClass(order.payment_status)}>
                                    {order.payment_status || "Not Paid"}
                                  </span>
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle font-bold text-slate-700">
                                  <span className={`px-2 py-0.5 text-[10px] rounded border ${activeConfig.badgeClass}`}>
                                    {order.order_status || "Draft"}
                                  </span>
                                </td>

                                {/* Action Column */}
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleViewClick(order.id)}
                                      className={styles.actionBtn}
                                      title="View Order Details"
                                    >
                                      <Eye size={13} />
                                    </button>

                                    {/* Quotation conversion shortcut */}
                                    {activeKey === "quotations" && (
                                      <Link
                                        href={`/sales/create-order?quotation_id=${order.id}`}
                                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                                        title="Convert Quotation to Order"
                                      >
                                        <ArrowRightLeft size={13} />
                                      </Link>
                                    )}

                                    {/* Close Order Action Button (when activeKey is to_close) */}
                                    {activeKey === "to_close" && (
                                      <button
                                        onClick={() => {
                                          setSelectedCloseOrder(order);
                                          setIsCloseModalOpen(true);
                                        }}
                                        className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
                                        title="Close Order Record"
                                      >
                                        <Lock size={12} /> Close Order
                                      </button>
                                    )}
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

        {/* Pagination Footer */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} {activeConfig.label})
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <ViewOrderModal
        isOpen={isViewOpen}
        orderId={selectedOrderId}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {/* 🌟 Confirm Close Order Modal */}
      <ConfirmCloseOrderModal
        isOpen={isCloseModalOpen}
        orderId={selectedCloseOrder?.id || null}
        orderNumber={selectedCloseOrder?.order_number || null}
        onClose={() => {
          setIsCloseModalOpen(false);
          setSelectedCloseOrder(null);
        }}
        onSuccess={() => {
          setIsCloseModalOpen(false);
          setSelectedCloseOrder(null);
          fetchOrders(currentPage);
        }}
      />
    </div>
  );
}
