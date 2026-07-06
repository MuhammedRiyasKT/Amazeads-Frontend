"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { getRoles, Role, CreateStaffPayload, Staff } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateStaffPayload) => void;
  onUpdate: (id: number, payload: Partial<CreateStaffPayload>, updatedStatus?: boolean) => void; // Status പാരാമീറ്റർ ചേർത്തു
  editStaff: Staff | null;
}

export default function StaffFormModal({ isOpen, onClose, onSave, onUpdate, editStaff }: StaffFormModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [roleId, setRoleId] = useState<number>(1);
  const [accountStatus, setAccountStatus] = useState<boolean>(true); // സ്റ്റാറ്റസ് സ്റ്റേറ്റ്

  const isEditMode = editStaff !== null;

  useEffect(() => {
    if (isOpen) {
      getRoles()
        .then((data) => {
          setRoles(data);
          
          if (isEditMode && editStaff) {
            setStaffName(editStaff.staff_name);
            setEmail(editStaff.email);
            setAddress(editStaff.address);
            setAccountStatus(editStaff.account_status); // നിലവിലുള്ള സ്റ്റാറ്റസ് സെറ്റ് ചെയ്യുന്നു
            
            const matchedRole = data.find((r) => r.role_name.toLowerCase() === editStaff.role_name.toLowerCase());
            if (matchedRole) setRoleId(matchedRole.id);
          } else {
            setStaffName("");
            setEmail("");
            setPassword("");
            setAddress("");
            setAccountStatus(true);
            if (data.length > 0) setRoleId(data[0].id);
          }
        })
        .catch((err) => console.error("Error fetching roles:", err));
    }
  }, [isOpen, editStaff, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editStaff) {
      // എഡിറ്റ് ചെയ്യുമ്പോൾ റോൾ ഐഡി അയക്കുന്നില്ല, പകരം പേര്, അഡ്രസ് എന്നിവയും പുതിയ സ്റ്റാറ്റസും അയക്കുന്നു
      onUpdate(editStaff.id, {
        staff_name: staffName,
        email,
        address,
        image_url: editStaff.image_url,
      }, accountStatus);
    } else {
      onSave({
        staff_name: staffName,
        email,
        password,
        address,
        role_id: roleId,
        image_url: "http://example.com/image.jpg",
      });
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEditMode ? "Edit Staff Details" : "Add New Staff"}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>STAFF NAME</label>
            <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required placeholder="Staff Name" className={styles.modalInput} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email Address" className={styles.modalInput} />
          </div>

          {!isEditMode && (
            <div className={styles.formGroup}>
              <label className={styles.label}>PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={styles.modalInput} />
            </div>
          )}

          {/* ക്രിയേറ്റ് ചെയ്യുമ്പോൾ മാത്രം റോൾ മാറ്റാൻ അനുവദിക്കുന്നു */}
          {!isEditMode && (
            <div className={styles.formGroup}>
              <label className={styles.label}>ROLE / DESIGNATION</label>
              <select value={roleId} onChange={(e) => setRoleId(parseInt(e.target.value))} className={styles.modalSelect}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.role_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* എഡിറ്റ് ചെയ്യുമ്പോൾ മാത്രം അക്കൗണ്ട് സ്റ്റാറ്റസ് മാറ്റാൻ അനുവദിക്കുന്നു (പ്രധാന മാറ്റം) */}
          {isEditMode && (
            <div className={styles.formGroup}>
              <label className={styles.label}>ACCOUNT STATUS</label>
              <select 
                value={accountStatus ? "true" : "false"} 
                onChange={(e) => setAccountStatus(e.target.value === "true")} 
                className={styles.modalSelect}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>ADDRESS</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Address" className={styles.modalInput} />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">{isEditMode ? "Update Details" : "Add Staff"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}