"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // റൂട്ടർ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { CalendarRange, CalendarCheck, ClipboardList, BarChart4, ArrowLeft } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment } from "../services/profile.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/ProfileComponents.module.css";

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([]);
  
  // ലോഗിൻ ചെയ്ത വിവരങ്ങൾ സൂക്ഷിക്കാൻ പുതിയ ഡൈനാമിക് സ്റ്റേറ്റുകൾ
  const [staffId, setStaffId] = useState<number>(5);
  const [staffName, setStaffName] = useState("User");
  const [roleName, setRoleName] = useState("Staff");
  const [userRole, setUserRole] = useState<string>("sales");

  // പേജ് ലോഡ് ചെയ്യുമ്പോൾ ലോക്കൽസ്റ്റോറേജിൽ നിന്നും ഡാറ്റ റിക്കവർ ചെയ്യുന്നു
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("staffId");
      const savedRole = localStorage.getItem("userRole");
      const savedProfileStr = localStorage.getItem("staffProfile");
      
      if (savedId) setStaffId(parseInt(savedId));
      if (savedRole) setUserRole(savedRole);
      if (savedProfileStr) {
        const profile = JSON.parse(savedProfileStr);
        setStaffName(profile.staff_name);
        setRoleName(profile.role_name);
      }
    }
  }, []);

  useEffect(() => {
    if (staffId && userRole) {
      getPersonalAssignments(staffId, userRole)
        .then((data) => setAssignments(data.items || []))
        .catch((err) => console.error("Error loading personal dashboard schedules:", err));
    }
  }, [staffId, userRole]);

  // എക്സിറ്റ് അടിച്ച് ഹോം ഡാഷബോർഡിലേക്ക് തിരികെ പോകാനുള്ള ഫംഗ്ഷൻ (പ്രധാന മാറ്റം)
  const handleExit = () => {
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

    const targetRoute = roleRoutes[userRole.toLowerCase()] || "/dashboard";
    router.push(targetRoute);
  };

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
        <div className="flex items-start gap-4"> {/* അലൈൻമെന്റിനായി ഫ്ലെക്സ് ഗ്യാപ്പ് നൽകി */}
          
          {/* 1. പ്രൊഫൈലിൽ നിന്നും തിരികെ ഡാഷ്ബോർഡിലേക്ക് പോകാനുള്ള എക്സിറ്റ് ബട്ടൺ */}
          <button
            onClick={handleExit}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
            title="Exit Profile"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>

          <div>
            <h1 className={styles.welcomeText}>Welcome back, {staffName} 👋</h1>
            <div className={styles.staffMetaRow}>
              <span className={styles.metaBadge}>EMP-10{staffId}</span>
              <span className={styles.metaBadge}>{roleName}</span>
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