"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ListTodo,
  CalendarCheck,
  CalendarX,
  User,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  getProfileDashboardKpis,
  KPIMetrics,
} from "../services/profile.service";
import styles from "../components/ProfileComponents.module.css";

// Skeleton Loader Component
function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 w-full">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-36 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <div className="h-56 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-56 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function ProfileDashboardPage() {
  const { user, _hasHydrated } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [dailyKpis, setDailyKpis] = useState<KPIMetrics>({
    total_tasks: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  const [extraKpis, setExtraKpis] = useState<KPIMetrics>({
    total_tasks: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  const fetchKpis = async () => {
    if (!_hasHydrated || !user) return;

    setLoading(true);
    setError(null);

    try {
      // 🌟 Consumes service function (Zero API calls inside component)
      const data = await getProfileDashboardKpis(user.role_name, user.id);
      setDailyKpis(data.dailyKpi);
      setExtraKpis(data.extraKpi);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
      setError("Unable to load dashboard metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, user]);

  if (!_hasHydrated || (loading && !error)) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-[60vh] text-slate-500 font-semibold">
        Please sign in to view your profile dashboard.
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center p-8 bg-rose-50/50 border border-rose-200 rounded-2xl max-w-lg mx-auto mt-12 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">Sync Error</h3>
          <p className="text-xs text-slate-600 font-medium">{error}</p>
          <button
            onClick={fetchKpis}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate Combined Aggregated Counts
  const totalAll = (dailyKpis.total_tasks || 0) + (extraKpis.total_tasks || 0);
  const completedAll = (dailyKpis.completed || 0) + (extraKpis.completed || 0);
  const pendingAll = (dailyKpis.pending || 0) + (extraKpis.pending || 0);
  const overdueAll = (dailyKpis.overdue || 0) + (extraKpis.overdue || 0);

  // Status Percentages with zero division protection
  const completedPct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;
  const pendingPct = totalAll > 0 ? Math.round((pendingAll / totalAll) * 100) : 0;
  const overduePct = totalAll > 0 ? Math.round((overdueAll / totalAll) * 100) : 0;

  // Workload Type percentages
  const dailyTotal = dailyKpis.total_tasks || 0;
  const extraTotal = extraKpis.total_tasks || 0;
  const dailyPct = totalAll > 0 ? Math.round((dailyTotal / totalAll) * 100) : 0;
  const extraPct = totalAll > 0 ? Math.round((extraTotal / totalAll) * 100) : 0;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className={styles.container}>
      {/* 🌟 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 w-full">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-0.5">
            Profile Overview
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Good Morning, {user.staff_name} 👋
          </h1>
          <div className="mt-1">
            <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {user.role_name} Department
            </span>
          </div>
        </div>

        <div className="text-slate-500 font-bold text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          <span className="text-slate-400 font-medium">Date: </span>
          {formattedDate}
        </div>
      </div>

      {/* 🌟 2. MAIN OVERALL KPI SECTION (4 Large Prominent KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TOTAL TASKS
            </span>
            <strong className="text-2xl font-black text-slate-900 leading-none">
              {totalAll}
            </strong>
            <span className="text-[10px] font-bold text-slate-500 block pt-0.5">
              Daily + Flexible
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <ClipboardList size={22} />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              COMPLETED
            </span>
            <strong className="text-2xl font-black text-emerald-600 leading-none">
              {completedAll}
            </strong>
            <span className="text-[10px] font-bold text-emerald-600 block pt-0.5">
              {completedPct}% Success Rate
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              PENDING
            </span>
            <strong className="text-2xl font-black text-amber-600 leading-none">
              {pendingAll}
            </strong>
            <span className="text-[10px] font-bold text-amber-600 block pt-0.5">
              In Progress / Queue
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              OVERDUE
            </span>
            <strong className="text-2xl font-black text-rose-600 leading-none">
              {overdueAll}
            </strong>
            <span className="text-[10px] font-bold text-rose-600 block pt-0.5">
              Needs Attention
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Empty State Banner */}
      {totalAll === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-indigo-600 shrink-0" />
          <span>No task activity registered for today.</span>
        </div>
      )}

      {/* 🌟 3. VERTICAL GRAPH CHARTS GRID (LEFT: Task Status | RIGHT: Workload Distribution) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">

        {/* LEFT GRAPH PANEL: TASK STATUS OVERVIEW (Vertical Bars) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" />
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Task Status Overview
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Vertical Graph
            </span>
          </div>

          {/* Vertical Columns Representation */}
          <div className="flex items-end justify-around h-40 border-b border-slate-200 pb-2 px-4 gap-4 pt-2">
            {/* Completed Bar */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="text-[11px] font-black text-emerald-700">{completedAll}</span>
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="w-full bg-emerald-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(completedPct, 5)}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 mt-1">Completed</span>
              <span className="text-[9px] font-bold text-slate-400">{completedPct}%</span>
            </div>

            {/* Pending Bar */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="text-[11px] font-black text-amber-700">{pendingAll}</span>
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="w-full bg-amber-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(pendingPct, 5)}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 mt-1">Pending</span>
              <span className="text-[9px] font-bold text-slate-400">{pendingPct}%</span>
            </div>

            {/* Overdue Bar */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="text-[11px] font-black text-rose-700">{overdueAll}</span>
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="w-full bg-rose-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(overduePct, 5)}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 mt-1">Overdue</span>
              <span className="text-[9px] font-bold text-slate-400">{overduePct}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT GRAPH PANEL: WORKLOAD TYPE DISTRIBUTION (Vertical Bars) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-violet-600" />
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Workload Type Distribution
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Daily vs Flexible
            </span>
          </div>

          {/* Vertical Columns Representation */}
          <div className="flex items-end justify-around h-40 border-b border-slate-200 pb-2 px-8 gap-6 pt-2">
            {/* Daily Core Tasks Column */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="text-[11px] font-black text-indigo-700">{dailyTotal}</span>
              <div className="w-full max-w-[50px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="w-full bg-indigo-600 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(dailyPct, 5)}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 mt-1">Daily Core</span>
              <span className="text-[9px] font-bold text-slate-400">{dailyPct}%</span>
            </div>

            {/* Flexible Extra Tasks Column */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="text-[11px] font-black text-violet-700">{extraTotal}</span>
              <div className="w-full max-w-[50px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="w-full bg-violet-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(extraPct, 5)}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 mt-1">Flexible</span>
              <span className="text-[9px] font-bold text-slate-400">{extraPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 4. TASK DISTRIBUTION PANELS */}
      <div className="space-y-3 w-full">
        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 size={15} className="text-indigo-600" /> Category Breakdown
        </h2>

        {/* Side-by-Side Summary Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* DAILY TASKS PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <ClipboardList size={14} className="text-indigo-600" /> Daily Core Tasks
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Mandatory
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                <strong className="text-sm font-black text-slate-900">{dailyKpis.total_tasks}</strong>
              </div>
              <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Done</span>
                <strong className="text-sm font-black text-emerald-700">{dailyKpis.completed}</strong>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                <span className="text-[9px] uppercase font-bold text-amber-600 block">Pending</span>
                <strong className="text-sm font-black text-amber-700">{dailyKpis.pending}</strong>
              </div>
              <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                <span className="text-[9px] uppercase font-bold text-rose-600 block">Overdue</span>
                <strong className="text-sm font-black text-rose-700">{dailyKpis.overdue}</strong>
              </div>
            </div>
          </div>

          {/* FLEXIBLE TASKS PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <ListTodo size={14} className="text-violet-600" /> Flexible / Extra Tasks
              </h3>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                Flexible
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                <strong className="text-sm font-black text-slate-900">{extraKpis.total_tasks}</strong>
              </div>
              <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Done</span>
                <strong className="text-sm font-black text-emerald-700">{extraKpis.completed}</strong>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                <span className="text-[9px] uppercase font-bold text-amber-600 block">Pending</span>
                <strong className="text-sm font-black text-amber-700">{extraKpis.pending}</strong>
              </div>
              <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                <span className="text-[9px] uppercase font-bold text-rose-600 block">Overdue</span>
                <strong className="text-sm font-black text-rose-700">{extraKpis.overdue}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 5. QUICK ACTIONS */}
      <div className="space-y-2.5 w-full pt-2">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          Quick Actions
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/profile/report"
            className="bg-white border border-slate-200 hover:border-indigo-500 rounded-xl p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-2xs group"
          >
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ListTodo size={18} />
            </div>
            <div>
              <strong className="font-extrabold text-xs text-slate-900 block group-hover:text-indigo-600 transition-colors">
                My Tasks
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">Daily Report</span>
            </div>
          </Link>

          <Link
            href="/profile/attendance"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-2xs group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarCheck size={18} />
            </div>
            <div>
              <strong className="font-extrabold text-xs text-slate-900 block group-hover:text-emerald-600 transition-colors">
                Attendance
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">Log Check-In</span>
            </div>
          </Link>

          <Link
            href="/profile/leave"
            className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-2xs group"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CalendarX size={18} />
            </div>
            <div>
              <strong className="font-extrabold text-xs text-slate-900 block group-hover:text-amber-600 transition-colors">
                Leave
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">Apply Request</span>
            </div>
          </Link>

          <Link
            href="/profile"
            className="bg-white border border-slate-200 hover:border-indigo-500 rounded-xl p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-2xs group"
          >
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <User size={18} />
            </div>
            <div>
              <strong className="font-extrabold text-xs text-slate-900 block group-hover:text-indigo-600 transition-colors">
                Profile
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">View Info</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}