"use client";

import React, { useEffect, useState } from "react";
import { Eye, XCircle, AlertCircle, Search, X, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import Pagination from "@/components/ui/Pagination";
import ViewOrderModal from "../components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "@/modules/project-manager/components/ProjectProgressTimelineDropdown";
import { deleteAdminOrders } from "../services/order.service";
import styles from "../components/OrderListComponents.module.css";

interface CancelledOrdersPageProps {
  role?: "sales" | "admin" | "project-manager" | "manager";
}

export default function CancelledOrdersPage({ role = "sales" }: CancelledOrdersPageProps) {
  const { selectedCategory } = useProjectManagerStore();
  const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Search across all text fields
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // View modal state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Timeline dropdown state
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  // Delete modal state (Admin only)
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCancelledOrders = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        page_size: 5,
        order_status: "Cancelled",
        category_id: activeCategoryId,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await api.get(`/${role}/orders`, { params });

      const data = response.data;
      const items = data.items || [];
      setOrders(items);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || items.length);
    } catch (err) {
      console.error("Error fetching cancelled orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders(currentPage);
  }, [currentPage, role, selectedCategory, debouncedSearch]);

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const handleDeleteOrders = async (orderIds: number[]) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminOrders(orderIds);
      alert(
        orderIds.length === 1
          ? "Cancelled order deleted successfully!"
          : `${orderIds.length} cancelled orders deleted successfully!`
      );
      setOrderToDelete(null);
      setIsBulkDeleteOpen(false);
      setSelectedOrderIds((prev) => prev.filter((id) => !orderIds.includes(id)));

      // If all items on current page were deleted and we're past page 1, step back
      if (orders.length === orderIds.length && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchCancelledOrders(currentPage);
      }
    } catch (err: any) {
      console.error("Error deleting cancelled order(s):", err);
      const detail = err?.response?.data?.detail;
      let errMsg = "Failed to delete order. Please try again.";
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d: any) => d?.msg || (typeof d === "string" ? d : JSON.stringify(d))).join(", ");
      } else if (detail && typeof detail === "object" && detail.msg) {
        errMsg = detail.msg;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }
      setDeleteError(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateStyle = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Cancel Orders</h1>
          <p className={styles.subtitle}>
            Historical register of all cancelled customer and production orders.
          </p>
        </div>

        {/* Total Cancelled Badge */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-rose-700 font-extrabold text-xs self-start sm:self-auto">
          <XCircle size={16} />
          <span>Total Cancelled: {totalCount}</span>
        </div>
      </div>

      {/* 🌟 Search Input Bar & Bulk Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex items-center min-w-[240px] sm:w-80">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 h-9 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {role === "admin" && selectedOrderIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setIsBulkDeleteOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedOrderIds.length})</span>
            </button>
          )}
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Total {totalCount} cancelled orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {role === "admin" && (
                  <th style={{ width: "36px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const ids = orders.map((o) => o.id);
                          setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...ids])));
                        } else {
                          const currentIds = orders.map((o) => o.id);
                          setSelectedOrderIds((prev) => prev.filter((id) => !currentIds.includes(id)));
                        }
                      }}
                      className="cursor-pointer rounded accent-indigo-600"
                      title="Select all on this page"
                    />
                  </th>
                )}
                <th style={{ width: "90px" }}>ORDER ID</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT</th>
                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "95px" }}>COMMIT DATE</th>
                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                <th style={{ width: "100px" }}>FINAL AMT</th>
                <th style={{ width: "110px" }}>CREATED BY</th>
                <th style={{ width: "90px", textAlign: "center" }}>ORDER STATUS</th>
                <th style={{ width: role === "admin" ? "80px" : "70px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={role === "admin" ? 11 : 10} style={{ textAlign: "center", padding: "24px" }} className="text-slate-500 font-semibold">
                    Loading cancelled orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 11 : 10} style={{ textAlign: "center", padding: "32px" }} className="text-slate-500 font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="text-slate-400" size={24} />
                      <span>No cancelled order records found.</span>
                    </div>
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
                            {role === "admin" && isFirstRow && (
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                <input
                                  type="checkbox"
                                  checked={selectedOrderIds.includes(order.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOrderIds((prev) => [...prev, order.id]);
                                    } else {
                                      setSelectedOrderIds((prev) => prev.filter((id) => id !== order.id));
                                    }
                                  }}
                                  className="cursor-pointer rounded accent-indigo-600"
                                />
                              </td>
                            )}

                            {isFirstRow && (
                              <>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                  {order.order_number ? (String(order.order_number).startsWith("#") ? order.order_number : `#${order.order_number}`) : "—"}
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
                                  role={role}
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
                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                  ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle capitalize whitespace-nowrap text-xs text-slate-700">
                                  {order.created_by_name || order.created_by || "—"}
                                </td>
                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle font-bold text-slate-700">
                                  <span className="px-2.5 py-1 text-[10px] rounded-lg bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider font-extrabold inline-block">
                                    {order.order_status || "Cancel"}
                                  </span>
                                </td>

                                {/* ACTION COLUMN */}
                                <td rowSpan={projectsCount} className="align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleViewClick(order.id)}
                                      className={styles.actionBtn}
                                      title="View Order Details"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    {role === "admin" && (
                                      <button
                                        onClick={() => {
                                          setDeleteError(null);
                                          setOrderToDelete(order);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
                                        title="Delete Cancelled Order"
                                      >
                                        <Trash2 size={13} />
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
        role={role}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {/* Delete Confirmation Modal (Admin only) */}
      {(orderToDelete || isBulkDeleteOpen) && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setOrderToDelete(null);
                    setIsBulkDeleteOpen(false);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isBulkDeleteOpen
                  ? `Delete ${selectedOrderIds.length} Cancelled Orders`
                  : "Delete Cancelled Order"}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {isBulkDeleteOpen ? (
                  <>
                    Are you sure you want to permanently delete{" "}
                    <strong className="text-slate-800">{selectedOrderIds.length} selected cancelled orders</strong>?
                    This will remove all associated projects, tasks, and image records. This action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete{" "}
                    <strong className="text-slate-800">
                      {orderToDelete?.order_number ? `#${orderToDelete.order_number}` : `Order #${orderToDelete?.id}`}
                    </strong>
                    {orderToDelete?.customer_name && ` (${orderToDelete.customer_name})`}?
                    This will remove all associated projects, tasks, and image records. This action cannot be undone.
                  </>
                )}
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrderToDelete(null);
                  setIsBulkDeleteOpen(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const idsToDelete = isBulkDeleteOpen
                    ? selectedOrderIds
                    : orderToDelete
                    ? [orderToDelete.id]
                    : [];
                  if (idsToDelete.length > 0) {
                    handleDeleteOrders(idsToDelete);
                  }
                }}
                disabled={isDeleting}
                className="px-4.5 h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
