"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Staff } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface StaffTableProps {
  staffs: Staff[];
  onDelete: (id: number) => void;
  onViewClick: (id: number) => void; // കണ്ണ് ഐക്കണിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ
  onEditClick: (staff: Staff) => void; // പെൻസിൽ ഐക്കണിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ
  onToggleStatus: (id: number, currentStatus: boolean) => void; // സ്റ്റാറ്റസ് മാറ്റാൻ
}

export default function StaffTable({ 
  staffs, 
  onDelete, 
  onViewClick, 
  onEditClick, 
  onToggleStatus 
}: StaffTableProps) {
  
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "ST";
  };

  return (
    <div className={styles.tableContainer}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "240px" }}>STAFF DETAILS</TableHead>
            <TableHead>ROLE / DESIGNATION</TableHead>
            <TableHead style={{ width: "220px" }}>CONTACT</TableHead>
            <TableHead style={{ width: "130px" }}>JOIN DATE</TableHead>
            <TableHead style={{ width: "130px" }}>STATUS</TableHead>
            <TableHead style={{ width: "130px", textAlign: "center" }}>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                No staff found.
              </TableCell>
            </TableRow>
          ) : (
            staffs.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className={styles.staffCell}>
                    <div className={`${styles.avatar} ${styles.avatarInitials}`}>
                      {getInitials(staff.staff_name)}
                    </div>
                    <div>
                      <div className={styles.staffName}>{staff.staff_name}</div>
                      <div className={styles.staffId}>STF-00{staff.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{staff.role_name}</TableCell>
                <TableCell>
                  <div className={styles.contactCell}>
                    <span>+91 98765 43210</span>
                    <span className={styles.emailSub}>{staff.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {staff.created_on ? staff.created_on.substring(0, 10) : "N/A"}
                </TableCell>
                <TableCell>
                  {/* ബാഡ്ജിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ PATCH ലോജിക് വഴി സ്റ്റാറ്റസ് മാറുന്നു */}
                  <span 
                    onClick={() => onToggleStatus(staff.id, staff.account_status)} 
                    className={`${styles.badge} ${staff.account_status ? styles.badgeActive : styles.badgeInactive} cursor-pointer hover:opacity-80 transition-all`}
                  >
                    {staff.account_status ? "ACTIVE" : "INACTIVE"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className={styles.actionGroup}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={styles.actionIconBtn}
                      onClick={() => onViewClick(staff.id)}
                    >
                      <Eye size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={styles.actionIconBtn}
                      onClick={() => onEditClick(staff)}
                    >
                      <Edit size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={styles.actionIconBtn}
                      onClick={() => onDelete(staff.id)}
                    >
                      <Trash2 size={15} style={{ color: "#ef4444" }} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}