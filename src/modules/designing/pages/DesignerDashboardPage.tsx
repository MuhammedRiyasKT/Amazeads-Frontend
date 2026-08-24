"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lightbulb,
  RefreshCw,
  XCircle,
  UserX,
  ChevronRight,
} from "lucide-react";
import VerticalBarChart from "@/components/charts/VerticalBarChart";
import {
  DesignerKpiData,
  DesignerKpiFilters,
  KpiFilterPreset,
  getDesignerKpiCards,
} from "../services/designerKpi.service";
import styles from "./DesignerDashboardPage.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_LABELS: Record<KpiFilterPreset, string> = {
  today: "Today",
  this_month: "This Month",
  specific_date: "Specific Date",
  custom_range: "Custom Range",
  upto_today: "Till Today",
};



const CHART_COLORS = {
  assigned: "#6366f1",
  inProgress: "#f59e0b",
  completed: "#10b981",
  notCompleted: "#ef4444",
  notAccepted: "#8b5cf6",
};

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function CircularProgress({ rate }: { rate: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedRate = Math.min(100, Math.max(0, rate));
  const offset = circumference - (clampedRate / 100) * circumference;

  let ringColor = "#10b981"; // green
  let label = "Excellent";
  if (clampedRate < 50) { ringColor = "#ef4444"; label = "Low"; }
  else if (clampedRate < 75) { ringColor = "#f59e0b"; label = "Average"; }
  else if (clampedRate < 90) { ringColor = "#6366f1"; label = "Good"; }

  return (
    <div className={styles.ringWrap}>
      <svg width="128" height="128" viewBox="0 0 128 128" className={styles.ringsvg}>
        {/* Track */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className={styles.ringCenter}>
        <span className={styles.ringPct} style={{ color: ringColor }}>
          {clampedRate}%
        </span>
        <span className={styles.ringLabel} style={{ color: ringColor }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className={styles.kpiGrid}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
            <div className={styles.skeletonCircle} />
          </div>
          <div className={`${styles.skeletonBar} ${styles.skeletonBarLg}`} style={{ width: 40 }} />
          <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className={styles.chartSkeleton}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={styles.chartSkeletonBar}
          style={{ height: `${25 + i * 13}%` }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DesignerDashboardPage() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [preset, setPreset] = useState<KpiFilterPreset>("upto_today");
  const [specificDate, setSpecificDate] = useState(todayStr);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  const [kpi, setKpi] = useState<DesignerKpiData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchKpi = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    const filters: DesignerKpiFilters = { preset, specificDate, fromDate, toDate, dateField: "assigned_on" };
    try {
      const data = await getDesignerKpiCards(filters);
      setKpi(data);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "CanceledError" || err.name === "AbortError")) return;
      setError("Unable to load designer overview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [preset, specificDate, fromDate, toDate]);

  useEffect(() => {
    fetchKpi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, specificDate, fromDate, toDate]);

  const notAccepted = kpi ? (kpi.not_accepted_tasks ?? kpi.notaccepted_tasks ?? 0) : 0;

  const chartData = kpi ? [
    { name: "Assigned",      value: kpi.total_assigned_tasks, color: CHART_COLORS.assigned },
    { name: "In Progress",   value: kpi.in_progress_tasks,    color: CHART_COLORS.inProgress },
    { name: "Completed",     value: kpi.completed_tasks,       color: CHART_COLORS.completed },
    { name: "Not Completed", value: kpi.not_completed_tasks,   color: CHART_COLORS.notCompleted },
    { name: "Not Accepted",  value: notAccepted,               color: CHART_COLORS.notAccepted },
  ] : [];

  const totalAssigned = kpi?.total_assigned_tasks ?? 0;
  const completed     = kpi?.completed_tasks ?? 0;
  const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

  // Insight message
  const insightMsg = (() => {
    if (!kpi) return null;
    if (completionRate === 100 && totalAssigned > 0) return "Great job! All assigned tasks are completed.";
    if (kpi.in_progress_tasks > 0) return `${kpi.in_progress_tasks} task${kpi.in_progress_tasks > 1 ? "s" : ""} currently in progress.`;
    if (kpi.not_completed_tasks > 0) return `${kpi.not_completed_tasks} task${kpi.not_completed_tasks > 1 ? "s" : ""} marked as not completed.`;
    if (notAccepted > 0) return `${notAccepted} task${notAccepted > 1 ? "s" : ""} pending acceptance.`;
    if (totalAssigned === 0) return "No tasks assigned in this period.";
    return null;
  })();

  const kpiCards = [
    {
      id: "total-assigned",
      label: "TOTAL ASSIGNED",
      value: kpi?.total_assigned_tasks ?? 0,
      sub: "Tasks assigned",
      icon: <ClipboardList size={20} />,
      iconClass: styles.iconBlue,
      valueClass: styles.valBlue,
    },
    {
      id: "in-progress",
      label: "IN PROGRESS",
      value: kpi?.in_progress_tasks ?? 0,
      sub: "Tasks in progress",
      icon: <Clock size={20} />,
      iconClass: styles.iconAmber,
      valueClass: styles.valAmber,
    },
    {
      id: "completed",
      label: "COMPLETED",
      value: kpi?.completed_tasks ?? 0,
      sub: "Tasks completed",
      icon: <CheckCircle2 size={20} />,
      iconClass: styles.iconGreen,
      valueClass: styles.valGreen,
    },
    {
      id: "not-completed",
      label: "NOT COMPLETED",
      value: kpi?.not_completed_tasks ?? 0,
      sub: "Tasks not completed",
      icon: <XCircle size={20} />,
      iconClass: styles.iconRed,
      valueClass: styles.valRed,
    },
    {
      id: "not-accepted",
      label: "NOT ACCEPTED",
      value: notAccepted,
      sub: "Tasks not accepted",
      icon: <UserX size={20} />,
      iconClass: styles.iconViolet,
      valueClass: styles.valViolet,
    },
  ];

  const breakdownItems = kpi ? [
    { label: "Assigned",      value: kpi.total_assigned_tasks, dotClass: styles.dotBlue },
    { label: "In Progress",   value: kpi.in_progress_tasks,    dotClass: styles.dotAmber },
    { label: "Completed",     value: kpi.completed_tasks,      dotClass: styles.dotGreen },
    { label: "Not Completed", value: kpi.not_completed_tasks,  dotClass: styles.dotRed },
    { label: "Not Accepted",  value: notAccepted,              dotClass: styles.dotViolet },
  ] : [];

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Designer Overview</h1>
          <p className={styles.subtitle}>Monitor assigned design tasks, progress and completion.</p>
        </div>

        <div className={styles.headerRight}>
          {/* Preset Filter Tabs */}
          <div className={styles.presetTabs}>
            {(Object.keys(PRESET_LABELS) as KpiFilterPreset[]).map((p) => (
              <button
                key={p}
                id={`designer-filter-${p}`}
                className={`${styles.presetTab} ${preset === p ? styles.presetTabActive : ""}`}
                onClick={() => setPreset(p)}
              >
                {PRESET_LABELS[p]}
              </button>
            ))}
          </div>

          <button
            id="designer-refresh-btn"
            className={styles.refreshBtn}
            onClick={fetchKpi}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? styles.spinning : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Inline date inputs (only when needed) ── */}
      {(preset === "specific_date" || preset === "custom_range") && (
        <div className={styles.dateBar}>
          {preset === "specific_date" && (
            <div className={styles.dateInputGroup}>
              <Calendar size={13} className={styles.inputIcon} />
              <input
                type="date"
                id="designer-specific-date"
                className={styles.dateInput}
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
              />
            </div>
          )}
          {preset === "custom_range" && (
            <div className={styles.dateRangeGroup}>
              <div className={styles.dateInputGroup}>
                <Calendar size={13} className={styles.inputIcon} />
                <input type="date" id="designer-from-date" className={styles.dateInput}
                  value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <span className={styles.rangeSep}>to</span>
              <div className={styles.dateInputGroup}>
                <Calendar size={13} className={styles.inputIcon} />
                <input type="date" id="designer-to-date" className={styles.dateInput}
                  value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && !isLoading && (
        <div className={styles.errorState}>
          <AlertCircle size={18} className={styles.errorIcon} />
          <span className={styles.errorMsg}>{error}</span>
          <button className={styles.retryBtn} onClick={fetchKpi}>Retry</button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {isLoading ? <KpiSkeleton /> : !error ? (
        <div className={styles.kpiGrid}>
          {kpiCards.map((card) => (
            <div key={card.id} className={styles.kpiCard}>
              {/* Top row: label + icon */}
              <div className={styles.kpiTopRow}>
                <span className={styles.kpiLabel}>{card.label}</span>
                <div className={`${styles.kpiIcon} ${card.iconClass}`}>{card.icon}</div>
              </div>
              {/* Value */}
              <strong className={`${styles.kpiValue} ${card.valueClass}`}>{card.value}</strong>
              {/* Sub */}
              <span className={styles.kpiSub}>{card.sub}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Chart + Right Panel ── */}
      {!error && (
        <div className={styles.chartCard}>
          {/* Two-column layout */}
          <div className={styles.chartTwoCol}>

            {/* LEFT */}
            <div className={styles.chartLeft}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitleGroup}>
                  <h2 className={styles.chartTitle}>Task Status Overview</h2>
                  <span className={styles.chartSub}>Distribution of tasks by current status</span>
                </div>
                <a href="#" className={styles.viewDetails}>
                  View details <ChevronRight size={13} />
                </a>
              </div>

              <div className={styles.chartBody}>
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <VerticalBarChart
                    data={chartData}
                    emptyMessage="No task data available for this period."
                  />
                )}
              </div>

              {/* Insight Box */}
              {!isLoading && insightMsg && (
                <div className={styles.insightBox}>
                  <Lightbulb size={15} className={styles.insightIcon} />
                  <p className={styles.insightText}>
                    <strong>Great job!</strong>&nbsp; {insightMsg.replace("Great job! ", "")}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className={styles.chartRight}>
              {isLoading ? (
                <div className={styles.rightSkeleton}>
                  <div className={styles.skeletonCircleLg} />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} style={{ width: "80%" }} />
                  ))}
                </div>
              ) : kpi ? (
                <>
                  <span className={styles.rateLabel}>COMPLETION RATE</span>
                  <CircularProgress rate={completionRate} />
                  <span className={styles.rateDetail}>
                    {completed} of {totalAssigned} tasks completed
                  </span>

                  <div className={styles.breakdownList}>
                    {breakdownItems.map(({ label, value, dotClass }) => (
                      <div key={label} className={styles.breakdownRow}>
                        <span className={`${styles.breakdownDot} ${dotClass}`} />
                        <span className={styles.breakdownLabel}>{label}</span>
                        <span className={styles.breakdownValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}