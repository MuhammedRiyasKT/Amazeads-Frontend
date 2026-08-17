"use client";

import React from "react";
import Link from "next/link";
import { Eye, Edit2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import styles from "./OrderListComponents.module.css";

interface OrderTableProps {
  orders: OrderItemResponse[];
  isLoading: boolean;
  onViewClick: (id: number) => void;
  // 🌟 Pagination Props
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

export default function OrderTable({ 
  orders, 
  isLoading, 
  onViewClick,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange
}: OrderTableProps) {
  
  const formatDateStyle = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusStyle = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":   return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
      case "in progress": return { bg: "#fefce8", color: "#92400e", border: "#fde68a" };
      case "packed":      return { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };
      case "in transit":  return { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" };
      case "delivered":   return { bg: "#f0fdf4", color: "#065f46", border: "#6ee7b7" };
      case "closed":      return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
      case "cancelled":   return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
      default:            return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    }
  };

  return (
    <div className={styles.tableCard}>
      {/* 🌟 1. Vertical Scrollable Body Container with Sticky Header */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "75px" }}>ORDER ID</th>
              <th style={{ width: "85px" }}>DATE</th>
              <th style={{ width: "130px" }}>CUSTOMER</th>
              <th>PRODUCT</th>
              <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
              <th style={{ width: "95px" }}>TOTAL (₹)</th>
              <th style={{ width: "100px" }}>PAID AMOUNT</th>
              <th style={{ width: "100px" }}>DUE AMOUNT</th>
              <th style={{ width: "100px", textAlign: "center" }}>ORDER STATUS</th>
              <th style={{ width: "70px", textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>Loading active orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>No order records found.</td></tr>
            ) : (
              orders.map((order) => {
                const isProject = order.order_number !== null;

                // എല്ലാ പ്രൊഡക്റ്റുകളും എടുക്കുന്നു (No Limit)
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
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(order.order_date)}
                              </td>
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                {order.customer_name}
                              </td>
                            </>
                          )}

                          <td style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                            {proj ? proj.project_name : "—"}
                          </td>

                          <td style={{ textAlign: "center", color: "#64748b" }}>
                            {proj ? proj.quantity : "—"}
                          </td>

                          {isFirstRow && (
                            <>
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                ₹{order.final_amount.toLocaleString("en-IN")}
                              </td>
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap">
                                <span className={styles.paidBubble}>
                                  ₹{order.paid_amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap">
                                <span className={styles.dueBubble}>
                                  ₹{order.balance_amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                {(() => {
                                  const s = getStatusStyle(order.order_status);
                                  return (
                                    <span style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      background: s.bg,
                                      color: s.color,
                                      border: `1px solid ${s.border}`,
                                      textTransform: "capitalize",
                                      whiteSpace: "nowrap",
                                    }}>
                                      {order.order_status || "—"}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td rowSpan={projectsCount} className="align-middle">
                                <div className={styles.actionGroup}>
                                  <button onClick={() => onViewClick(order.id)} className={styles.actionBtn} title="View Details">
                                    <Eye size={13} />
                                  </button>
                                  {!isProject && (
                                    <Link href={`/sales/orders/edit/${order.id}`} passHref legacyBehavior>
                                      <button className={styles.actionBtn} title="Edit Order">
                                        <Edit2 size={13} />
                                      </button>
                                    </Link>
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

      {/* 🌟 2. Improved Pagination UI Footer (Pinned at Bottom outside scroll container) */}
      {totalPages > 1 && onPageChange && (
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>
            Showing page <span className={styles.highlightText}>{currentPage}</span> of <span className={styles.highlightText}>{totalPages}</span> ({totalCount} orders)
          </div>
          <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}