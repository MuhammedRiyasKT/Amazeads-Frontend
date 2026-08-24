"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    Lightbulb,
    XCircle,
    UserX,
    TrendingUp,
} from "lucide-react";
import VerticalBarChart from "@/components/charts/VerticalBarChart";
import {
    LogisticsKpiData,
    LogisticsOverviewFilters,
    KpiFilterPreset,
    getLogisticsKpiCards,
} from "../services/logisticsKpi.service";
import styles from "./LogisticsOverviewDashboard.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

// Excluded "specific_date" preset from controls
const PRESET_LABELS: Record<Exclude<KpiFilterPreset, "specific_date">, string> = {
    today: "Today",
    this_month: "This Month",
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
    if (clampedRate < 50) {
        ringColor = "#ef4444";
        label = "Low";
    } else if (clampedRate < 75) {
        ringColor = "#f59e0b";
        label = "Average";
    } else if (clampedRate < 90) {
        ringColor = "#6366f1";
        label = "Good";
    }

    return (
        <div className={styles.ringWrap}>
            <svg width="128" height="128" viewBox="0 0 128 128" className={styles.ringsvg}>
                {/* Track */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                />
                {/* Progress */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
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

// ─── Formatting Helpers ────────────────────────────────────────────────────────

function formatDateHelper(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function getActiveRangeLabel(
    preset: KpiFilterPreset,
    fromDate?: string,
    toDate?: string
): string {
    const now = new Date();
    const format = (d: Date) =>
        d.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    switch (preset) {
        case "today":
            return format(now);
        case "this_month": {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return `${format(firstDay)} - ${format(lastDay)}`;
        }
        case "custom_range":
            if (fromDate && toDate) {
                return `${formatDateHelper(fromDate)} - ${formatDateHelper(toDate)}`;
            }
            return "Custom Range";
        case "upto_today":
            return `Till ${format(now)}`;
        default:
            return format(now);
    }
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
                    <div
                        className={`${styles.skeletonBar} ${styles.skeletonBarLg}`}
                        style={{ width: 40 }}
                    />
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LogisticsOverviewDashboard() {
    // Establish today string representation (YYYY-MM-DD)
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
        today.getDate()
    )}`;

    // Filter State (Preset upto_today)
    const [preset, setPreset] = useState<KpiFilterPreset>("upto_today");
    const [fromDate, setFromDate] = useState(todayStr);
    const [toDate, setToDate] = useState(todayStr);

    // Data fetching States
    const [kpiData, setKpiData] = useState<LogisticsKpiData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const fetchKpi = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setIsLoading(true);
        setError(null);

        const filters: LogisticsOverviewFilters = {
            preset,
            fromDate,
            toDate,
        };

        try {
            const data = await getLogisticsKpiCards(filters);
            setKpiData(data);
        } catch (err: unknown) {
            if (
                err instanceof Error &&
                (err.name === "CanceledError" || err.name === "AbortError")
            ) {
                return;
            }
            setError("Unable to load logistics overview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [preset, fromDate, toDate]);

    useEffect(() => {
        fetchKpi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preset, fromDate, toDate]);

    // Extract not_accepted avoiding duplicates
    const notAccepted = kpiData
        ? kpiData.not_accepted_tasks ?? kpiData.notaccepted_tasks ?? 0
        : 0;

    const totalAssigned = kpiData?.total_assigned_tasks ?? 0;
    const completed = kpiData?.completed_tasks ?? 0;
    const completionRate =
        totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    // Insight message
    const insightMsg = (() => {
        if (!kpiData) return null;
        if (completionRate === 100 && totalAssigned > 0) {
            return "Great job! All assigned tasks are completed.";
        }
        if (kpiData.in_progress_tasks > 0) {
            return `${kpiData.in_progress_tasks} task${kpiData.in_progress_tasks > 1 ? "s" : ""
                } currently in progress.`;
        }
        if (kpiData.not_completed_tasks > 0) {
            return `${kpiData.not_completed_tasks} task${kpiData.not_completed_tasks > 1 ? "s" : ""
                } marked as not completed.`;
        }
        if (notAccepted > 0) {
            return `${notAccepted} task${notAccepted > 1 ? "s" : ""
                } pending acceptance.`;
        }
        if (totalAssigned === 0) {
            return "No tasks assigned in this period.";
        }
        return null;
    })();

    // Chart Mapping
    const chartData = kpiData
        ? [
            {
                name: "Assigned",
                value: kpiData.total_assigned_tasks,
                color: CHART_COLORS.assigned,
            },
            {
                name: "In Progress",
                value: kpiData.in_progress_tasks,
                color: CHART_COLORS.inProgress,
            },
            {
                name: "Completed",
                value: kpiData.completed_tasks,
                color: CHART_COLORS.completed,
            },
            {
                name: "Not Completed",
                value: kpiData.not_completed_tasks,
                color: CHART_COLORS.notCompleted,
            },
            {
                name: "Not Accepted",
                value: notAccepted,
                color: CHART_COLORS.notAccepted,
            },
        ]
        : [];

    const kpiCards = [
        {
            id: "total-assigned",
            label: "TOTAL ASSIGNED",
            value: kpiData?.total_assigned_tasks ?? 0,
            sub: "Tasks assigned",
            icon: <ClipboardList size={20} />,
            iconClass: styles.iconBlue,
            valueClass: styles.valBlue,
        },
        {
            id: "in-progress",
            label: "IN PROGRESS",
            value: kpiData?.in_progress_tasks ?? 0,
            sub: "Tasks in progress",
            icon: <Clock size={20} />,
            iconClass: styles.iconAmber,
            valueClass: styles.valAmber,
        },
        {
            id: "completed",
            label: "COMPLETED",
            value: kpiData?.completed_tasks ?? 0,
            sub: "Tasks completed",
            icon: <CheckCircle2 size={20} />,
            iconClass: styles.iconGreen,
            valueClass: styles.valGreen,
        },
        {
            id: "not-completed",
            label: "NOT COMPLETED",
            value: kpiData?.not_completed_tasks ?? 0,
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

    const breakdownItems = kpiData
        ? [
            {
                label: "Assigned",
                value: kpiData.total_assigned_tasks,
                dotClass: styles.dotBlue,
            },
            {
                label: "In Progress",
                value: kpiData.in_progress_tasks,
                dotClass: styles.dotAmber,
            },
            {
                label: "Completed",
                value: kpiData.completed_tasks,
                dotClass: styles.dotGreen,
            },
            {
                label: "Not Completed",
                value: kpiData.not_completed_tasks,
                dotClass: styles.dotRed,
            },
            {
                label: "Not Accepted",
                value: notAccepted,
                dotClass: styles.dotViolet,
            },
        ]
        : [];

    return (
        <div className={styles.page}>
            {/* ── Page Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Logistics Overview</h1>
                    <p className={styles.subtitle}>
                        Monitor logistics dispatch tasks, progress and completion.
                    </p>
                </div>

                <div className={styles.headerRight}>
                    {/* Active Range Info */}
                    <div className={styles.subtitle} style={{ marginRight: 8 }}>
                        {getActiveRangeLabel(preset, fromDate, toDate)}
                    </div>

                    {/* Preset Date Filter Tabs */}
                    <div className={styles.presetTabs}>
                        {(
                            Object.keys(PRESET_LABELS) as Exclude<
                                KpiFilterPreset,
                                "specific_date"
                            >[]
                        ).map((p) => (
                            <button
                                key={p}
                                className={`${styles.presetTab} ${preset === p ? styles.presetTabActive : ""
                                    }`}
                                onClick={() => setPreset(p)}
                            >
                                {PRESET_LABELS[p]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── custom_range inputs conditional display ── */}
            {preset === "custom_range" && (
                <div className={styles.dateBar}>
                    <div className={styles.dateRangeGroup}>
                        <div className={styles.dateInputGroup}>
                            <Calendar size={13} className={styles.inputIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <span className={styles.rangeSep}>to</span>
                        <div className={styles.dateInputGroup}>
                            <Calendar size={13} className={styles.inputIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Error displays ── */}
            {error && !isLoading && (
                <div className={styles.errorState}>
                    <AlertCircle size={18} className={styles.errorIcon} />
                    <span className={styles.errorMsg}>{error}</span>
                    <button className={styles.retryBtn} onClick={fetchKpi}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── KPI Cards block ── */}
            {isLoading ? (
                <KpiSkeleton />
            ) : !error ? (
                <div className={styles.kpiGrid}>
                    {kpiCards.map((card) => (
                        <div key={card.id} className={styles.kpiCard}>
                            <div className={styles.kpiTopRow}>
                                <span className={styles.kpiLabel}>{card.label}</span>
                                <div className={`${styles.kpiIcon} ${card.iconClass}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <strong className={`${styles.kpiValue} ${card.valueClass}`}>
                                {card.value}
                            </strong>
                            <span className={styles.kpiSub}>{card.sub}</span>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* ── Side-by-Side Charts Layout ── */}
            {!error && (
                <div className={styles.chartCard}>
                    <div className={styles.chartTwoCol}>
                        {/* LEFT: Task Status Overview */}
                        <div className={styles.chartLeft}>
                            <div className={styles.chartHeader}>
                                <div className={styles.chartTitleGroup}>
                                    <h2 className={styles.chartTitle}>Task Status Overview</h2>
                                    <span className={styles.chartSub}>
                                        Distribution of tasks by status
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <TrendingUp size={14} /> Overall Activity
                                </span>
                            </div>

                            <div className={styles.chartBody}>
                                {isLoading ? (
                                    <ChartSkeleton />
                                ) : (
                                    <VerticalBarChart
                                        data={chartData}
                                        emptyMessage="No tasks found for the selected period."
                                    />
                                )}
                            </div>

                            {/* Insight Box */}
                            {!isLoading && insightMsg && (
                                <div className={styles.insightBox}>
                                    <Lightbulb size={15} className={styles.insightIcon} />
                                    <p className={styles.insightText}>
                                        <strong>Status Insight:</strong>&nbsp; {insightMsg}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Circular Progress Completion rate */}
                        <div className={styles.chartRight}>
                            <span className={styles.rateLabel}>COMPLETION RATE</span>

                            {isLoading ? (
                                <div className={styles.rightSkeleton}>
                                    <div className={styles.skeletonCircleLg} />
                                </div>
                            ) : (
                                <>
                                    <CircularProgress rate={completionRate} />
                                    <span className={styles.rateDetail}>
                                        {completed} of {totalAssigned} tasks completed
                                    </span>

                                    <div className={styles.breakdownList}>
                                        {breakdownItems.map((item, idx) => (
                                            <div key={idx} className={styles.breakdownRow}>
                                                <span
                                                    className={`${styles.breakdownDot} ${item.dotClass}`}
                                                />
                                                <span className={styles.breakdownLabel}>
                                                    {item.label}
                                                </span>
                                                <span className={styles.breakdownValue}>
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
