"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { getRoles, Role, CreateStaffPayload } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateStaffPayload) => void;
}

export default function AddStaffModal({ isOpen, onClose, onSave }: AddStaffModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [roleId, setRoleId] = useState<number>(1);

  // മോഡൽ തുറക്കുമ്പോൾ ബാക്ക്-എൻഡിൽ നിന്നും റോളുകൾ ഫെച്ച് ചെയ്യുന്നു
  useEffect(() => {
    if (isOpen) {
      getRoles()
        .then((data) => setRoles(data))
        .catch((err) => console.error("Error fetching roles:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      staff_name: staffName,
      email,
      password,
      address,
      role_id: roleId,
      image_url: "http://example.com/image.jpg", // ഡിഫോൾട്ട് ഇമേജ് പാത്ത്
    });

    // ഫോം റീസെറ്റ് ചെയ്യുന്നു
    setStaffName("");
    setEmail("");
    setPassword("");
    setAddress("");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Staff</h2>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={styles.modalInput} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ROLE / DESIGNATION</label>
            <select value={roleId} onChange={(e) => setRoleId(parseInt(e.target.value))} className={styles.modalSelect}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ADDRESS</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Address" className={styles.modalInput} />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Add Staff</Button>
          </div>
        </form>
      </div>
    </div>
  );
}