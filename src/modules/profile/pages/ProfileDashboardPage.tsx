"use client";

import React, { useEffect, useState } from "react";
import { CalendarRange, CalendarCheck, ClipboardList, BarChart4 } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment } from "../services/profile.service";
import styles from "../components/ProfileComponents.module.css";

export default function ProfileDashboardPage() {
  const [assignments, setAssignments] = useState<PersonalAssignment[]>([]);
  
  // ലോഗിൻ ചെയ്ത വിവരങ്ങൾ സൂക്ഷിക്കാൻ പുതിയ ഡൈനാമിക് സ്റ്റേറ്റുകൾ
  const [staffId, setStaffId] = useState<number>(5);
  const [staffName, setStaffName] = useState("User");
  const [roleName, setRoleName] = useState("Staff");
  const [userRole, setUserRole] = useState<string>("sales");

  // പേജ് ലോഡ് ചെയ്യുമ്പോൾ ലോക്കൽസ്റ്റോറേജിൽ നിന്നും ഡാറ്റ റിക്കവർ ചെയ്യുന്നു (Next.js state loss ഒഴിവാക്കാൻ)
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
      getPersonalAssignments(staffId, userRole) // റോൾ കൂടി എപിഐയിലേക്ക് അയക്കുന്നു
        .then((data) => setAssignments(data.items || []))
        .catch((err) => console.error("Error loading personal dashboard schedules:", err));
    }
  }, [staffId, userRole]);

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
        <div>
          <h1 className={styles.welcomeText}>Welcome back, {staffName} 👋</h1>
          <div className={styles.staffMetaRow}>
            <span className={styles.metaBadge}>EMP-10{staffId}</span>
            <span className={styles.metaBadge}>{roleName}</span>
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