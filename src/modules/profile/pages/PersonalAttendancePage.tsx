// src/modules/profile/pages/PersonalAttendancePage.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  SharedAttendanceStaff,
  SharedAttendanceItem,
} from "../types/personalAttendance.types";
import {
  getSharedAttendanceLog,
  sharedCheckIn,
  sharedCheckOut,
} from "../services/personalAttendance.service";
import TodayAttendanceCard from "../components/TodayAttendanceCard";
import CheckOutConfirmModal from "../components/CheckOutConfirmModal";
import PersonalAttendanceHistory from "../components/PersonalAttendanceHistory";

export default function PersonalAttendancePage() {
  const router = useRouter();
  const { user, token, _hasHydrated } = useAuthStore();

  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [todayItem, setTodayItem] = useState<SharedAttendanceItem | null>(null);
  const [todayRecord, setTodayRecord] = useState<SharedAttendanceStaff | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Authentication guard redirect
  useEffect(() => {
    if (_hasHydrated && !token) {
      router.push("/login");
    }
  }, [_hasHydrated, token, router]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Fetch Today's Attendance Log
  const fetchTodayLog = async () => {
    if (!token) return;
    setIsLoadingToday(true);

    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const res = await getSharedAttendanceLog({ date: todayStr });
      const items = res.items || [];
      const firstItem = items[0] || null;
      setTodayItem(firstItem);

      if (firstItem && firstItem.staffs && firstItem.staffs.length > 0) {
        // Find current logged-in user's record
        let matched: SharedAttendanceStaff | undefined;
        if (user?.id) {
          matched = firstItem.staffs.find((s) => s.staff_id === user.id);
        }
        if (!matched && user?.staff_name) {
          matched = firstItem.staffs.find(
            (s) =>
              s.staff_name &&
              s.staff_name.toLowerCase().trim() ===
              user.staff_name.toLowerCase().trim()
          );
        }
        setTodayRecord(matched || firstItem.staffs[0]);
      } else if (firstItem && (firstItem.check_in || firstItem.status)) {
        setTodayRecord({
          status: firstItem.status || "Absent",
          check_in: firstItem.check_in,
          check_out: firstItem.check_out,
          working_minutes: firstItem.working_minutes,
          worked_hours: firstItem.worked_hours,
        });
      } else {
        setTodayRecord(null);
      }
    } catch (err: any) {
      console.error("Error fetching today's attendance:", err);
    } finally {
      setIsLoadingToday(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodayLog();
    }
  }, [token, refreshTrigger]);

  // Admin Check
  const roleName = (user?.role_name || "").toLowerCase();
  const isAdmin = roleName === "admin" || roleName === "administrator";

  // Check-In Handler
  const handleCheckIn = async () => {
    if (isAdmin || isActionLoading) return;

    setIsActionLoading(true);
    const nowIso = new Date().toISOString();

    try {
      await sharedCheckIn(nowIso);
      setToastMsg({
        type: "success",
        text: "Check-in successful! Have a great work day.",
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Check-in error:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Check-in failed. Please try again.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check-Out Handler (after confirmation)
  const handleCheckOutConfirm = async () => {
    if (isAdmin || isActionLoading) return;

    setIsActionLoading(true);
    const nowIso = new Date().toISOString();

    try {
      await sharedCheckOut(nowIso);
      setToastMsg({
        type: "success",
        text: "Check-out completed successfully!",
      });
      setIsConfirmModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Check-out error:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Check-out failed. Please try again.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!_hasHydrated || !token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${toastMsg.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-rose-600 text-white border-rose-700"
            }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toastMsg.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CalendarDays className="text-indigo-600" size={26} />
          Attendance
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Track your daily attendance
        </p>
      </div>

      {/* Today's Attendance Card */}
      <TodayAttendanceCard
        isAdmin={isAdmin}
        todayRecord={todayRecord}
        todayItem={todayItem}
        isLoading={isLoadingToday}
        isActionLoading={isActionLoading}
        onCheckIn={handleCheckIn}
        onCheckOutClick={() => setIsConfirmModalOpen(true)}
      />

      {/* Check Out Confirmation Modal */}
      <CheckOutConfirmModal
        isOpen={isConfirmModalOpen}
        isLoading={isActionLoading}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleCheckOutConfirm}
      />

      {/* Personal Attendance History */}
      <PersonalAttendanceHistory
        currentUserId={user?.id}
        currentStaffName={user?.staff_name}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
