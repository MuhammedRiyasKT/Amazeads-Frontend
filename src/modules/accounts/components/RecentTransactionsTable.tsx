"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import styles from "./AccountsComponents.module.css";

export default function RecentTransactionsTable() {
  const transactions = [
    { date: "24 Oct 2023, 10:30 AM", type: "Customer Payment", typeColor: styles.dotGreen, ref: "INV-9021", desc: "Vortex Industries", mode: "NEFT", amount: "+ ₹2,45,000", amountColor: styles.textGreen, status: "SUCCESS", statusClass: styles.badgeSuccess },
    { date: "24 Oct 2023, 11:15 AM", type: "Expense Added", typeColor: styles.dotRed, ref: "EXP-1045", desc: "Diesel Expense", mode: "Cash", amount: "- ₹3,200", amountColor: styles.textRed, status: "POSTED", statusClass: styles.badgePosted },
  ];

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>Recent Transactions</span>
        <a href="#" className={styles.seeAllLink}>View All</a>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "130px" }}>DATE & TIME</TableHead>
              <TableHead style={{ width: "140px" }}>TYPE</TableHead>
              <TableHead style={{ width: "90px" }}>REF NO.</TableHead>
              <TableHead>CUSTOMER / DESCRIPTION</TableHead>
              <TableHead style={{ width: "80px" }}>MODE</TableHead>
              <TableHead style={{ width: "110px", textAlign: "right" }}>AMOUNT</TableHead>
              <TableHead style={{ width: "100px", textAlign: "center" }}>STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.ref}>
                <TableCell style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: "1.3" }}>{t.date}</TableCell>
                <TableCell>
                  <div className={styles.typeCell}>
                    <span className={`${styles.dot} ${t.typeColor}`} />
                    <span>{t.type}</span>
                  </div>
                </TableCell>
                <TableCell style={{ color: "#1e56a0", fontWeight: 600 }}>{t.ref}</TableCell>
                <TableCell style={{ fontWeight: 700, color: "#0f172a" }}>{t.desc}</TableCell>
                <TableCell>{t.mode}</TableCell>
                <td style={{ textAlign: "right" }} className={`px-4 py-3 font-bold ${t.amountColor}`}>{t.amount}</td>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <span className={`${styles.badge} ${t.statusClass}`}>{t.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}