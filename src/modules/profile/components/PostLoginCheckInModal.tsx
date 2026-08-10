// src/modules/profile/components/PostLoginCheckInModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { LogIn, X, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  getSharedAttendanceLog,
  sharedCheckIn,
} from "../services/personalAttendance.service";
import { SharedAttendanceStaff } from "../types/personalAttendance.types";

export default function PostLoginCheckInModal() {
  const { user, token, _hasHydrated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Today's formatted date string
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDisplayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  useEffect(() => {
    if (!_hasHydrated || !token || !user) return;

    const roleName = (user.role_name || "").toLowerCase();
    if (roleName === "admin" || roleName === "administrator") return;

    // Check if dismissed in this session for today
    const isDismissed = sessionStorage.getItem(`checkin_dismissed_${todayStr}`) === "true";
    if (isDismissed) return;

    // Check today's attendance status
    async function checkAttendanceStatus() {
      setIsLoading(true);
      try {
        const res = await getSharedAttendanceLog({ date: todayStr });
        const items = res.items || [];
        const firstItem = items[0];

        const isHoliday = Boolean(firstItem?.holiday_status || firstItem?.holiday_name);

        let todayRecord: SharedAttendanceStaff | undefined;
        if (firstItem && firstItem.staffs && firstItem.staffs.length > 0) {
          const matched = firstItem.staffs.find(
            (s) =>
              s.staff_id === user?.id ||
              (s.staff_name &&
                s.staff_name.toLowerCase().trim() ===
                  user?.staff_name?.toLowerCase().trim())
          );
          if (matched) {
            todayRecord = matched;
          } else if (firstItem.staffs.length === 1) {
            todayRecord = firstItem.staffs[0];
          }
        }

        const status = todayRecord?.status || firstItem?.status || "Absent";
        const checkIn = todayRecord?.check_in || firstItem?.check_in || null;

        const isLeave = status.toLowerCase().includes("leave");
        const hasCheckIn = Boolean(checkIn);

        // Show modal only if not checked in, not a holiday, and not on leave
        if (!hasCheckIn && !isHoliday && !isLeave) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Error checking attendance for post-login modal:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAttendanceStatus();
  }, [_hasHydrated, token, user, todayStr]);

  if (!isOpen) return null;

  // Handle Dismiss (Closing without checking in)
  const handleDismiss = () => {
    sessionStorage.setItem(`checkin_dismissed_${todayStr}`, "true");
    setIsOpen(false);
  };

  // Handle Check In Now
  const handleCheckInNow = async () => {
    setIsCheckingIn(true);
    const nowIso = new Date().toISOString();

    try {
      await sharedCheckIn(nowIso);
      setToastMsg({
        type: "success",
        text: "Check-in successful! Have a great work day.",
      });
      sessionStorage.setItem(`checkin_dismissed_${todayStr}`, "true");
      setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (err: any) {
      console.error("Post-login check-in error:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Check-in failed. Please try again.",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <>
      {/* Toast Notification inside overlay */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3500] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === "success"
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

      {/* Modal Backdrop Overlay */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[3000] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 flex flex-col gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Header with X Close Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Daily Check-In Reminder
              </span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Close without checking in"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Greeting & Status */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Clock size={28} />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-black text-slate-900 text-lg">
                Hello, {user?.staff_name || "Employee"}! 👋
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                You haven't checked in for today ({todayDisplayDate}) yet.
              </p>
            </div>

            <span className="px-3.5 py-1 text-xs font-extrabold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 mt-1">
              🔴 Not Checked In
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCheckInNow}
              disabled={isCheckingIn}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn size={18} />
              {isCheckingIn ? "Checking In..." : "CHECK IN NOW"}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Not Now (Remind Me Later)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
