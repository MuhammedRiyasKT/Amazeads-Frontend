"use client";

import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination"; // നിങ്ങളുടെ കോമൺ പേജിനേഷൻ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Staff } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface StaffTableProps {
  staffs: Staff[];
  onDelete: (id: number) => void;
  onViewClick: (id: number) => void; 
  onEditClick: (staff: Staff) => void; 
  onToggleStatus: (id: number, currentStatus: boolean) => void; 
}

export default function StaffTable({ 
  staffs, 
  onDelete, 
  onViewClick, 
  onEditClick, 
  onToggleStatus 
}: StaffTableProps) {
  
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5; // ഒരു പേജിൽ പരമാവധി 5 ജീവനക്കാരെ കാണിക്കുന്നു

  // അഡ്മിൻ സെർച്ച് ബാറിൽ ടൈപ്പ് ചെയ്യുമ്പോൾ തനിയെ പേജ് ഒന്നിലേക്ക് റീസെറ്റ് ചെയ്യാനുള്ള ലോജിക്
  useEffect(() => {
    setCurrentPage(1);
  }, [staffs.length]);

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "ST";
  };

  // പേജിനേഷൻ കണക്കുകൂട്ടലുകൾ
  const totalCount = staffs.length;
  const startIndex = (currentPage - 1) * limit;
  const paginatedStaffs = staffs.slice(startIndex, startIndex + limit);

  return (
    <div>
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
            {paginatedStaffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No staff found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedStaffs.map((staff) => (
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
                      <span className={styles.emailSub}>{staff.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {staff.created_on ? staff.created_on.substring(0, 10) : "N/A"}
                  </TableCell>
                  <TableCell>
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

      {/* ഡൈനാമിക് പേജിനേഷൻ റോ ഇവിടെ നൽകുന്നു */}
      <div className={styles.paginationRow}>
        <div className={styles.resultsText}>
          Showing {totalCount > 0 ? startIndex + 1 : 0}-{Math.min(currentPage * limit, totalCount)} of {totalCount} Staff Members
        </div>
        <Pagination 
          total={totalCount} 
          limit={limit} 
          activePage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}