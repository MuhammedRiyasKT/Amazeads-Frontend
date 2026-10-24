"use client";

import React, { useState, useEffect } from "react";
import { X, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Staff, resetStaffPassword } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface ResetStaffPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess?: () => void;
}

export default function ResetStaffPasswordModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: ResetStaffPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset form when modal opens or staff changes
  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsLoading(false);
    }
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation password do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetStaffPassword(staff.id, {
        new_password: newPassword,
        password: newPassword,
      });

      setSuccessMsg(`Password for ${staff.staff_name} has been successfully reset!`);
      if (onSuccess) {
        onSuccess();
      }

      // Auto close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error("Error resetting staff password:", err);
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setErrorMsg(typeof backendMessage === "string" ? backendMessage : JSON.stringify(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: "460px" }}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Reset Password</h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Set a new login password for staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Staff Target Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {staff.staff_name ? staff.staff_name.substring(0, 2).toUpperCase() : "ST"}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 text-sm truncate">
                {staff.staff_name}
              </div>
              <div className="text-xs text-slate-500 font-medium truncate">
                {staff.email}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 uppercase">
              {staff.role_name}
            </span>
            <div className="text-[10px] font-bold text-slate-400 mt-1">
              STF-00{staff.id}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 font-semibold">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* New Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>NEW PASSWORD *</label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className={`${styles.modalInput} pr-10`}
                disabled={isLoading}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>CONFIRM NEW PASSWORD *</label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`${styles.modalInput} pr-10`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>Reset Password</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
