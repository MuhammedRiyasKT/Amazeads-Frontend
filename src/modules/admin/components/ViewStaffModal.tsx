"use client";

import React from "react";
import { X, Calendar, MapPin, Mail, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import { Staff } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export default function ViewStaffModal({ isOpen, onClose, staff }: ViewStaffModalProps) {
  if (!isOpen || !staff) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: "440px" }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Staff Details</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {/* പ്രൊഫൈൽ വ്യൂ കാർഡ് */}
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-20 h-20 bg-indigo-50 border-2 border-indigo-500 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
            {staff.staff_name ? staff.staff_name.substring(0, 2).toUpperCase() : "ST"}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{staff.staff_name}</h3>
            <span className={`${styles.badge} ${staff.account_status ? styles.badgeActive : styles.badgeInactive} mt-1`}>
              {staff.account_status ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 my-2" />

          {/* വിവരങ്ങൾ */}
          <div className="w-full flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Shield size={16} className="text-slate-400" />
              <span>Role: <strong className="text-slate-800">{staff.role_name}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail size={16} className="text-slate-400" />
              <span>Email: <strong className="text-slate-800">{staff.email}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin size={16} className="text-slate-400" />
              <span>Address: <strong className="text-slate-800">{staff.address}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              <span>Joined on: <strong className="text-slate-800">{staff.created_on?.substring(0, 10)}</strong></span>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}