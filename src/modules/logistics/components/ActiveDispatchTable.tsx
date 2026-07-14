"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import styles from "./LogisticsComponents.module.css";

export default function ActiveDispatchTable() {
  const shipments = [
    { id: "DSP-0021", client: "MANASSI STUDIO", method: "BlueDart", dest: "Mumbai, MH", status: "In Transit", statusClass: styles.statusProgress },
    { id: "DSP-0022", client: "Rajesh Kumar", method: "DHL Express", dest: "Bangalore, KA", status: "Delivered", statusClass: styles.statusCompleted },
    { id: "DSP-0023", client: "Sneha Varma", method: "DTDC Courier", dest: "Cochin, KL", status: "In Transit", statusClass: styles.statusProgress },
    { id: "DSP-0024", client: "Aman Rathore", method: "Direct Vehicle", dest: "Calicut, KL", status: "Pending Pickup", statusClass: styles.statusPending },
  ];

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>ACTIVE DISPATCH TRACKER</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "110px" }}>DISPATCH ID</TableHead>
              <TableHead style={{ width: "160px" }}>CLIENT / CUSTOMER</TableHead>
              <TableHead style={{ width: "120px" }}>CARRIER METHOD</TableHead>
              <TableHead>DESTINATION</TableHead>
              <TableHead style={{ width: "130px" }}>TRANSIT STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((ship) => (
              <TableRow key={ship.id}>
                <TableCell style={{ fontWeight: 700, color: "#1e56a0" }}>{ship.id}</TableCell>
                <TableCell style={{ fontWeight: 700, color: "#0f172a" }}>{ship.client}</TableCell>
                <TableCell>{ship.method}</TableCell>
                <TableCell>{ship.dest}</TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${ship.statusClass}`}>{ship.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}