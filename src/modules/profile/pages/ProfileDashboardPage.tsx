"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, CalendarCheck, ClipboardList, BarChart4, ArrowLeft } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment } from "../services/profile.service";
import { useAuthStore } from "@/store/authStore"; // Zustand സ്റ്റോർ ഇമ്പോർട്ട് ചെയ്യുന്നു
import styles from "../components/ProfileComponents.module.css";

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([]);

  // Zustand സ്റ്റോറിൽ നിന്നും ഡാറ്റകൾ ഡയറക്ട് ആയി എടുക്കുന്നു (മാനുവൽ ലോക്കൽസ്റ്റോറേജ് റീഡിങ് പൂർണ്ണമായി ഒഴിവാക്കി)
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && user) {
      getPersonalAssignments(user.id, user.role_name) // സ്റ്റോറിലെ ഡൈനാമിക് ഐഡിയും റോളും ഉപയോഗിക്കുന്നു (പ്രധാന മാറ്റം)
        .then((data) => setAssignments(data.items || []))
        .catch((err) => console.error("Error loading personal dashboard schedules:", err));
    }
  }, [_hasHydrated, user]);

  const handleExit = () => {
    if (!user) return;
    const roleRoutes: Record<string, string> = {
      admin: "/admin",
      sales: "/sales",
      "project manager": "/project-manager",
      manager: "/manager",
      designer: "/projects",
      printing: "/printing",
      logistics: "/logistics",
      hr: "/hr",
      accounts: "/accounts",
    };

    const targetRoute = roleRoutes[user.role_name.toLowerCase()] || "/dashboard";
    router.push(targetRoute);
  };

  // ജസ്റ്റാന്റ് ലോക്കൽസ്റ്റോറേജ് ഹൈഡ്രേഷൻ പൂർത്തിയാകുന്നത് വരെ പ്രൊട്ടക്റ്റ് ചെയ്യുന്നു (Next.js Hydration Guard)
  if (!_hasHydrated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  const getPriorityBadge = (p: number) => {
    if (p === 3) return <span className={`${styles.badge} ${styles.priorityHigh}`}>High</span>;
    if (p === 2) return <span className={`${styles.badge} ${styles.priorityMedium}`}>Medium</span>;
    return <span className={`${styles.badge} ${styles.priorityLow}`}>Low</span>;
  };

  const getDayLabel = (dayNum: number) => {
    const days = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[dayNum] || "";
  };

  return (
    <div className={styles.container}>
      {/* Welcome & check-in header row */}
      <div className={styles.welcomeRow}>
        <div className="flex items-start gap-4">
          <button
            onClick={handleExit}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
            title="Exit Profile"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>

          <div>
            <h1 className={styles.welcomeText}>Welcome back, {user.staff_name} 👋</h1>
            <div className={styles.staffMetaRow}>
              <span className={styles.metaBadge}>EMP-10{user.id}</span>
              <span className={styles.metaBadge}>{user.role_name}</span>
            </div>
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

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Attendance %</span>
            <strong className={styles.kpiValue}>98.2%</strong>
            <span className={styles.kpiSubtextUp}>↑ 1.2% from last month</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}>
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Today's Tasks</span>
            <strong className={styles.kpiValue}>5 Pending</strong>
            <span className={styles.kpiSubtextMuted}>2 Due by end of day</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconTeal}`}>
            <ClipboardList size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Leave Balance</span>
            <strong className={styles.kpiValue}>12 Days</strong>
            <span className={styles.kpiSubtextMuted}>Valid until Dec 2024</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}>
            <CalendarRange size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Performance</span>
            <strong className={styles.kpiValue}>94/100</strong>
            <span className={styles.kpiSubtextUp}>Exceptional Performance</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconMuted}`}>
            <BarChart4 size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}