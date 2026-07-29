"use client";

import React from "react";
import Link from "next/link";
import { Eye, Edit2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { OrderItemResponse } from "../types";
import styles from "./OrderListComponents.module.css";

interface OrderTableProps {
  orders: OrderItemResponse[];
  isLoading: boolean;
  onViewClick: (id: number) => void;
}

export default function OrderTable({ orders, isLoading, onViewClick }: OrderTableProps) {
  
  const formatDateStyle = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "100px" }}>ORDER ID</th>
              <th style={{ width: "120px" }}>DATE</th>
              <th style={{ width: "220px" }}>CUSTOMER</th>
              <th style={{ minWidth: "260px" }}>PRODUCT</th>
              <th style={{ width: "70px", textAlign: "center" }}>QTY</th>
              <th style={{ width: "130px" }}>TOTAL (₹)</th>
              <th style={{ width: "130px" }}>PAID AMOUNT</th>
              <th style={{ width: "130px" }}>DUE AMOUNT</th>
              <th style={{ width: "120px", textAlign: "center" }}>STATUS</th>
              <th style={{ width: "110px", textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>Loading active orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: "32px" }}>No order records found.</td></tr>
            ) : (
              orders.map((order) => {
                const isProject = order.order_number !== null;
                const rawCount = order.projects && order.projects.length > 0 ? order.projects.length : 1;
                const projectsCount = rawCount > 5 ? 5 : rawCount;

                return (
                  <React.Fragment key={order.id}>
                    {Array.from({ length: projectsCount }).map((_, pIdx) => {
                      const proj = order.projects?.[pIdx];
                      const isFirstRow = pIdx === 0;

                      return (
                        <tr key={`${order.id}-${pIdx}`}>
                          {isFirstRow && (
                            <>
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                {order.order_number ? `${order.order_number}` : "—"}
                              </td>
                              <td rowSpan={projectsCount} className="align-middle">
                                {formatDateStyle(order.order_date)}
                              </td>
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                {order.customer_name}
                              </td>
                            </>
                          )}

                          <td style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                            <div>{proj ? proj.project_name : "—"}</div>
                            {pIdx === 4 && rawCount > 5 && (
                              <div className="text-[10px] text-indigo-600 font-extrabold mt-1.5 uppercase">
                                + {rawCount - 5} more items...
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "center", color: "#64748b" }}>
                            {proj ? proj.quantity : "—"}
                          </td>

                          {isFirstRow && (
                            <>
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                ₹{order.final_amount.toLocaleString("en-IN")}
                              </td>
                              <td rowSpan={projectsCount} className="align-middle">
                                <span className={styles.paidBubble}>
                                  ₹{order.paid_amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td rowSpan={projectsCount} className="align-middle">
                                <span className={styles.dueBubble}>
                                  ₹{order.balance_amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                {isProject ? (
                                  <span className={`${styles.statusBadge} ${styles.badgeProject}`}>PROJECT</span>
                                ) : (
                                  <span className={`${styles.statusBadge} ${styles.badgeOrder}`}>ORDER</span>
                                )}
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
    </div>
  );
}