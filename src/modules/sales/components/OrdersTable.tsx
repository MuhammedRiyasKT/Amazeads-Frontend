"use client";

import React from "react";
import { Eye, Edit, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Order } from "../types";
import styles from "./OrdersComponents.module.css";

interface OrdersTableProps {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  activeTabTitle: string;
}

export default function OrdersTable({
  orders,
  totalCount,
  currentPage,
  limit,
  onPageChange,
  activeTabTitle,
}: OrdersTableProps) {
  return (
    <div>
      <div className={styles.tableHeader}>
        <span className={styles.tableTitle}>{activeTabTitle.toUpperCase()}</span>
        <span className={styles.tableCount}>{totalCount}</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "12%" }}>ORDER ID</TableHead>
              <TableHead style={{ width: "12%" }}>DATE</TableHead>
              <TableHead style={{ width: "16%" }}>CUSTOMER</TableHead>
              <TableHead style={{ width: "32%" }}>PRODUCT</TableHead>
              <TableHead style={{ width: "80px", textAlign: "center" }}>QTY</TableHead>
              <TableHead style={{ width: "130px" }}>TOTAL (₹)</TableHead>
              <TableHead style={{ width: "150px" }}>PAYMENT</TableHead> {/* പേയ്മെന്റ് കോളം വീതി കൂട്ടി */}
              <TableHead style={{ width: "120px" }}>STATUS</TableHead>
              <TableHead style={{ width: "120px", textAlign: "center" }}>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const firstItem = order.items[0];
                const restItems = order.items.slice(1);
                const rowSpan = order.items.length;

                return (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell rowSpan={rowSpan} style={{ color: order.orderId ? "#7048e8" : "inherit", fontWeight: order.orderId ? 700 : "normal" }}>
                        {order.orderId || ""}
                      </TableCell>
                      <TableCell rowSpan={rowSpan}>{order.date}</TableCell>
                      <TableCell rowSpan={rowSpan} className={styles.customerBold}>{order.customerName}</TableCell>
                      
                      <TableCell>{firstItem.productName}</TableCell>
                      <TableCell style={{ textAlign: "center" }}>{firstItem.qty}</TableCell>
                      
                      <TableCell rowSpan={rowSpan} style={{ fontWeight: 700 }}>
                        ₹{order.total.toLocaleString("en-IN")}.00
                      </TableCell>

                      {/* പേയ്മെന്റ് ഡിസ്പ്ലേ ലോജിക് */}
                      <TableCell rowSpan={rowSpan}>
                        {order.paymentStatus === "PAID" ? (
                          <span className={`${styles.badge} ${styles.badgePaid}`}>PAID</span>
                        ) : (
                          <div className={styles.paymentDetailColumn}>
                            {/* പെയ്ഡ് എമൗണ്ട് ഉണ്ടെങ്കിൽ മാത്രം കാണിക്കുന്നു */}
                            {order.paidAmount !== undefined && order.paidAmount > 0 && (
                              <span className={styles.badgePaidSplit}>
                                Paid: ₹{order.paidAmount.toLocaleString("en-IN")}
                              </span>
                            )}
                            {/* ഡ്യൂ എമൗണ്ട് ഉണ്ടെങ്കിൽ മാത്രം കാണിക്കുന്നു */}
                            {order.dueAmount !== undefined && order.dueAmount > 0 && (
                              <span className={styles.badgeDueSplit}>
                                Due: ₹{order.dueAmount.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className={`${styles.badge} ${firstItem.status === "ORDER" ? styles.badgeOrder : styles.badgeProject}`}>
                          {firstItem.status}
                        </span>
                      </TableCell>
                      <TableCell rowSpan={rowSpan}>
                        <div className={styles.actionGroup}>
                          <Button variant="ghost" size="sm" className={styles.actionIconBtn}>
                            <Eye size={15} />
                          </Button>
                          <Button variant="ghost" size="sm" className={styles.actionIconBtn}>
                            <Edit size={15} />
                          </Button>
                          <Button variant="ghost" size="sm" className={styles.actionIconBtn}>
                            <Download size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {restItems.map((item, index) => (
                      <TableRow key={`${order.id}-item-${index}`}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell style={{ textAlign: "center" }}>{item.qty}</TableCell>
                        <TableCell>
                          <span className={`${styles.badge} ${item.status === "ORDER" ? styles.badgeOrder : styles.badgeProject}`}>
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className={styles.paginationRow}>
        <div className={styles.resultsText}>
          Showing {orders.length > 0 ? (currentPage - 1) * limit + 1 : 0}–
          {Math.min(currentPage * limit, totalCount)} of {totalCount} results
        </div>
        <Pagination total={totalCount} limit={limit} activePage={currentPage} onPageChange={onPageChange} />
      </div>
    </div>
  );
}