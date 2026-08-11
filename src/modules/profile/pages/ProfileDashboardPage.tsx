"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, CalendarCheck, ClipboardList, BarChart4 } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment } from "../services/profile.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/ProfileComponents.module.css";

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([]);

  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && user) {
      getPersonalAssignments(user.id, user.role_name)
        .then((data) => setAssignments(data.items || []))
        .catch((err) => console.error("Error loading personal dashboard schedules:", err));
    }
  }, [_hasHydrated, user]);

  if (!_hasHydrated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome & check-in header row */}
      <div className={styles.welcomeRow}>
        <div>
          <h1 className={styles.welcomeText}>Welcome back, {user.staff_name} 👋</h1>
          <div className={styles.staffMetaRow}>
            <span className={styles.metaBadge}>EMP-10{user.id}</span>
            <span className={styles.metaBadge}>{user.role_name}</span>
          </div>
        </div>

        <div className={styles.checkInCard}>
          <span className={styles.checkInStatus}>Checked In</span>
          <div className={styles.checkInTime}>
            09:05 AM <span className={styles.timeSub}>CHECK-IN TIME</span>
          </div>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className={styles.filterOptionsRow}>
        <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${styles.filterTabActive}`}>Today</button>
          <button className={styles.filterTab}>Week</button>
          <button className={styles.filterTab}>Month</button>
          <button className={styles.filterTab}>Year</button>
        </div>
      </div>

      {/* KPI Grid (4 Cards - Auto Fits) */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Attendance %</span>
            <strong className={styles.kpiValue}>98.2%</strong>
            <span className={styles.kpiSubtextUp}>↑ 1.2% from last month</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}>
            <CalendarCheck size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Today's Tasks</span>
            <strong className={styles.kpiValue}>5 Pending</strong>
            <span className={styles.kpiSubtextMuted}>2 Due by end of day</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconTeal}`}>
            <ClipboardList size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Leave Balance</span>
            <strong className={styles.kpiValue}>12 Days</strong>
            <span className={styles.kpiSubtextMuted}>Valid until Dec 2024</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}>
            <CalendarRange size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Performance</span>
            <strong className={styles.kpiValue}>94/100</strong>
            <span className={styles.kpiSubtextUp}>Exceptional Performance</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconMuted}`}>
            <BarChart4 size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}