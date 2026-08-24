"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    Printer,
    Sparkles,
    Flame,
    Camera,
    XCircle,
    UserX,
    TrendingUp,
} from "lucide-react";
import VerticalBarChart from "@/components/charts/VerticalBarChart";
import {
    PrintingKpiData,
    SubDepartmentKpiData,
    PrintingOverviewFilters,
    KpiFilterPreset,
    getPrintingKpiCards,
    getPrintingSubDepartmentKpiCards,
} from "../services/printingKpi.service";
import styles from "./PrintingOverviewDashboard.module.css";

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

interface PrintingOverviewDashboardProps {
    subDeptId?: number;
    categoryName?: string;
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

// Single KPI Card skeleton
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

// LHS Status Chart skeleton
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

// RHS Sub-Department performance grouped bars skeleton
function SubDeptSkeletonList() {
    return (
        <div className={styles.subDeptSkeleton}>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.subDeptSkeletonGroup}>
                    <div className={styles.subDeptSkeletonBar} style={{ height: "30%" }} />
                    <div className={styles.subDeptSkeletonBar} style={{ height: "70%" }} />
                    <div className={styles.subDeptSkeletonBar} style={{ height: "45%" }} />
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrintingOverviewDashboard({
    subDeptId,
    categoryName,
}: PrintingOverviewDashboardProps) {
    const router = useRouter();

    // Establish today string representation (YYYY-MM-DD)
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
        today.getDate()
    )}`;

    // Filter State (Preset today, this_month, custom_range, upto_today)
    const [preset, setPreset] = useState<KpiFilterPreset>("upto_today");
    const [fromDate, setFromDate] = useState(todayStr);
    const [toDate, setToDate] = useState(todayStr);

    // Data fetching States
    const [kpiCardsData, setKpiCardsData] = useState<PrintingKpiData | null>(null);
    const [subDeptsData, setSubDeptsData] = useState<Record<
        string,
        SubDepartmentKpiData
    > | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorCards, setErrorCards] = useState<string | null>(null);
    const [errorSubDepts, setErrorSubDepts] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setIsLoading(true);
        setErrorCards(null);
        setErrorSubDepts(null);

        const filters: PrintingOverviewFilters = {
            preset,
            fromDate,
            toDate,
        };

        // If subDeptId is passed to this dashboard, it shows only the selected sub-department's data.
        if (subDeptId) {
            try {
                const subDeptKpis = await getPrintingSubDepartmentKpiCards(filters);
                setSubDeptsData(subDeptKpis);

                const selectedSubDeptData = Object.values(subDeptKpis).find(
                    (sd) => sd.sub_department_id === subDeptId
                );

                if (selectedSubDeptData) {
                    setKpiCardsData({
                        total_assigned_tasks: selectedSubDeptData.total_assigned_tasks,
                        in_progress_tasks: selectedSubDeptData.in_progress_tasks,
                        completed_tasks: selectedSubDeptData.completed_tasks,
                        not_completed_tasks: selectedSubDeptData.not_completed_tasks,
                        not_accepted_tasks: selectedSubDeptData.not_accepted_tasks,
                        notaccepted_tasks: selectedSubDeptData.notaccepted_tasks,
                    });
                } else {
                    setKpiCardsData({
                        total_assigned_tasks: 0,
                        in_progress_tasks: 0,
                        completed_tasks: 0,
                        not_completed_tasks: 0,
                        not_accepted_tasks: 0,
                        notaccepted_tasks: 0,
                    });
                }
            } catch (err: unknown) {
                if (
                    err instanceof Error &&
                    (err.name === "CanceledError" || err.name === "AbortError")
                )
                    return;
                setErrorCards("Unable to load category KPI data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Fetch both for the overall printing overview
            try {
                const cardsPromise = getPrintingKpiCards(filters)
                    .then((res) => setKpiCardsData(res))
                    .catch(() => setErrorCards("Unable to load printing KPI cards."));

                const subDeptsPromise = getPrintingSubDepartmentKpiCards(filters)
                    .then((res) => setSubDeptsData(res))
                    .catch(() => setErrorSubDepts("Unable to load sub-department data."));

                await Promise.all([cardsPromise, subDeptsPromise]);
            } catch (err: unknown) {
                // Handled individually above
            } finally {
                setIsLoading(false);
            }
        }
    }, [preset, fromDate, toDate, subDeptId]);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preset, fromDate, toDate, subDeptId]);

    // Determine Sub-Department dynamic title if in category-specific mode
    const resolvedCategoryTitle = (() => {
        if (!subDeptId) return "Printing Overview";
        if (subDeptsData) {
            const match = Object.values(subDeptsData).find(
                (sd) => sd.sub_department_id === subDeptId
            );
            if (match) return `${match.sub_department_name} Overview`;
        }
        return categoryName ? `${categoryName} Overview` : "Category Overview";
    })();

    const subDeptDescription = (() => {
        if (!subDeptId) {
            return "Monitor printing tasks, production progress and sub-department performance.";
        }
        return `Monitor printing tasks, production progress and performance for ${resolvedCategoryTitle.replace(
            " Overview",
            ""
        )}.`;
    })();

    // Extract not_accepted avoiding duplicates
    const notAccepted = kpiCardsData
        ? kpiCardsData.not_accepted_tasks ?? kpiCardsData.notaccepted_tasks ?? 0
        : 0;

    // Chart Mapping
    const chartData = kpiCardsData
        ? [
            {
                name: "Assigned",
                value: kpiCardsData.total_assigned_tasks,
                color: CHART_COLORS.assigned,
            },
            {
                name: "In Progress",
                value: kpiCardsData.in_progress_tasks,
                color: CHART_COLORS.inProgress,
            },
            {
                name: "Completed",
                value: kpiCardsData.completed_tasks,
                color: CHART_COLORS.completed,
            },
            {
                name: "Not Completed",
                value: kpiCardsData.not_completed_tasks,
                color: CHART_COLORS.notCompleted,
            },
            {
                name: "Not Accepted",
                value: notAccepted,
                color: CHART_COLORS.notAccepted,
            },
        ]
        : [];

    const totalValues = kpiCardsData
        ? kpiCardsData.total_assigned_tasks +
        kpiCardsData.in_progress_tasks +
        kpiCardsData.completed_tasks +
        kpiCardsData.not_completed_tasks +
        notAccepted
        : 0;

    const kpiCards = [
        {
            id: "total-assigned",
            label: "Assigned Tasks",
            value: kpiCardsData?.total_assigned_tasks ?? 0,
            sub: "Assigned to department",
            icon: <ClipboardList size={20} />,
            iconClass: styles.iconBlue,
            valueClass: styles.valBlue,
        },
        {
            id: "in-progress",
            label: "In Progress",
            value: kpiCardsData?.in_progress_tasks ?? 0,
            sub: "Tasks currently in progress",
            icon: <Clock size={20} />,
            iconClass: styles.iconAmber,
            valueClass: styles.valAmber,
        },
        {
            id: "completed",
            label: "Completed",
            value: kpiCardsData?.completed_tasks ?? 0,
            sub: "Tasks completed",
            icon: <CheckCircle2 size={20} />,
            iconClass: styles.iconGreen,
            valueClass: styles.valGreen,
        },
        {
            id: "not-completed",
            label: "Not Completed",
            value: kpiCardsData?.not_completed_tasks ?? 0,
            sub: "Tasks not completed",
            icon: <XCircle size={20} />,
            iconClass: styles.iconRed,
            valueClass: styles.valRed,
        },
        {
            id: "not-accepted",
            label: "Not Accepted",
            value: notAccepted,
            sub: "Tasks not accepted",
            icon: <UserX size={20} />,
            iconClass: styles.iconViolet,
            valueClass: styles.valViolet,
        },
    ];

    // Helper for sub-dept representation icons & routes
    const getSubDeptMeta = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("uv")) {
            return {
                icon: Sparkles,
                path: `/printing/uvprint`,
                iconTheme: "bg-purple-100 text-purple-700",
            };
        }
        if (lowerName.includes("photo")) {
            return {
                icon: Camera,
                path: `/printing/photo-print`,
                iconTheme: "bg-blue-100 text-blue-700",
            };
        }
        if (lowerName.includes("laser")) {
            return {
                icon: Flame,
                path: `/printing/laser-print`,
                iconTheme: "bg-rose-100 text-rose-750",
            };
        }
        return {
            icon: Printer,
            path: `/printing/tasks`,
            iconTheme: "bg-indigo-100 text-indigo-700",
        };
    };

    const handleSubDeptClick = (name: string) => {
        const meta = getSubDeptMeta(name);
        router.push(meta.path);
    };

    // Determine dynamic scale for sub-department performance chart
    const maxSubDeptVal = Math.max(
        ...Object.values(subDeptsData || {}).map((sd) =>
            Math.max(
                sd.total_assigned_tasks ?? 0,
                sd.in_progress_tasks ?? 0,
                sd.completed_tasks ?? 0,
                1
            )
        ),
        1
    );

    return (
        <div className={styles.page}>
            {/* ── Page Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Link
                            href="/printing"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                        >
                            <ArrowLeft size={13} /> Back to Category
                        </Link>
                    </div>
                    <h1 className={styles.title}>{resolvedCategoryTitle}</h1>
                    <p className={styles.subtitle}>{subDeptDescription}</p>
                </div>

                <div className={styles.headerRight}>
                    {/* Active Range Badge */}
                    <div className={styles.filterRangeInfo}>
                        {getActiveRangeLabel(preset, fromDate, toDate)}
                    </div>

                    {/* Preset Date Filter Tabs (Specific Date and Refresh Button removed) */}
                    <div className={styles.presetTabs}>
                        {(Object.keys(PRESET_LABELS) as Exclude<KpiFilterPreset, "specific_date">[]).map(
                            (p) => (
                                <button
                                    key={p}
                                    className={`${styles.presetTab} ${preset === p ? styles.presetTabActive : ""
                                        }`}
                                    onClick={() => setPreset(p)}
                                >
                                    {PRESET_LABELS[p]}
                                </button>
                            )
                        )}
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
            {errorCards && !isLoading && (
                <div className={styles.errorState}>
                    <AlertCircle size={18} className={styles.errorIcon} />
                    <span className={styles.errorMsg}>{errorCards}</span>
                    <button className={styles.retryBtn} onClick={fetchDashboardData}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── KPI Cards block ── */}
            {isLoading ? (
                <KpiSkeleton />
            ) : !errorCards ? (
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
            {!errorCards && (
                <div className={styles.chartsGrid}>
                    {/* LEFT: Task Status Overview */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <div className={styles.chartTitleGroup}>
                                <h2 className={styles.chartTitle}>Task Status Overview</h2>
                                <span className={styles.chartSub}>
                                    Distribution of tasks by status
                                </span>
                            </div>
                            {!subDeptId && (
                                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <TrendingUp size={14} /> Overall Activity
                                </span>
                            )}
                        </div>

                        <div className={styles.chartBody}>
                            {isLoading ? (
                                <ChartSkeleton />
                            ) : totalValues === 0 ? (
                                <div className={styles.emptyState}>
                                    <Printer size={32} className={styles.emptyIcon} />
                                    <span>No printing tasks found for the selected period.</span>
                                </div>
                            ) : (
                                <VerticalBarChart
                                    data={chartData}
                                    emptyMessage="No printing tasks found for the selected period."
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Sub-Department Performance Grouped Chart (Only for Overall View) */}
                    {!subDeptId && (
                        <div className={styles.subDeptCard}>
                            <div className={styles.chartHeader}>
                                <div className={styles.chartTitleGroup}>
                                    <h2 className={styles.subDeptTitle}>Sub-Department Performance</h2>
                                    <span className={styles.chartSub}>
                                        Aggregated tasks by production unit
                                    </span>
                                </div>
                            </div>

                            <div className={styles.subDeptChartBody}>
                                {isLoading ? (
                                    <SubDeptSkeletonList />
                                ) : errorSubDepts ? (
                                    <div className={styles.errorState}>
                                        <AlertCircle size={18} className={styles.errorIcon} />
                                        <span className={styles.errorMsg}>{errorSubDepts}</span>
                                        <button className={styles.retryBtn} onClick={fetchDashboardData}>
                                            Retry
                                        </button>
                                    </div>
                                ) : subDeptsData ? (
                                    <div className={styles.groupedChartContainer}>
                                        <div className={styles.groupsRow}>
                                            {Object.values(subDeptsData).map((subDept) => {
                                                const valAssigned = subDept.total_assigned_tasks ?? 0;
                                                const valInProgress = subDept.in_progress_tasks ?? 0;
                                                const valCompleted = subDept.completed_tasks ?? 0;

                                                // Calculate percentage heights (scale relative to maxSubDeptVal)
                                                const hAssigned = `${(valAssigned / maxSubDeptVal) * 110}px`;
                                                const hInProgress = `${(valInProgress / maxSubDeptVal) * 110}px`;
                                                const hCompleted = `${(valCompleted / maxSubDeptVal) * 110}px`;

                                                // Simplify display name for photo print (Photo)
                                                const displayName = subDept.sub_department_name
                                                    .replace(" Print", "")
                                                    .replace(" print", "");

                                                return (
                                                    <div
                                                        key={subDept.sub_department_id}
                                                        onClick={() => handleSubDeptClick(subDept.sub_department_name)}
                                                        className={styles.chartGroupCol}
                                                        title={`${subDept.sub_department_name}: Assigned ${valAssigned}, In Progress ${valInProgress}, Completed ${valCompleted}`}
                                                    >
                                                        <div className={styles.groupBarsArea}>
                                                            {/* Assigned Bar */}
                                                            <div className={styles.barOuter} style={{ height: hAssigned }}>
                                                                {valAssigned > 0 && (
                                                                    <span className={styles.barLabel}>{valAssigned}</span>
                                                                )}
                                                                <div className={`${styles.barInner} ${styles.barAssigned}`} />
                                                            </div>

                                                            {/* In Progress Bar */}
                                                            <div className={styles.barOuter} style={{ height: hInProgress }}>
                                                                {valInProgress > 0 && (
                                                                    <span className={styles.barLabel}>{valInProgress}</span>
                                                                )}
                                                                <div className={`${styles.barInner} ${styles.barInProgress}`} />
                                                            </div>

                                                            {/* Completed Bar */}
                                                            <div className={styles.barOuter} style={{ height: hCompleted }}>
                                                                {valCompleted > 0 && (
                                                                    <span className={styles.barLabel}>{valCompleted}</span>
                                                                )}
                                                                <div className={`${styles.barInner} ${styles.barCompleted}`} />
                                                            </div>
                                                        </div>

                                                        <span className={styles.groupLabel}>{displayName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Grouped Legend */}
                                        <div className={styles.legendRow}>
                                            <div className={styles.legendItem}>
                                                <span className={`${styles.legendDot} bg-[#6366f1]`} />
                                                <span>Assigned</span>
                                            </div>
                                            <div className={styles.legendItem}>
                                                <span className={`${styles.legendDot} bg-[#f59e0b]`} />
                                                <span>In Progress</span>
                                            </div>
                                            <div className={styles.legendItem}>
                                                <span className={`${styles.legendDot} bg-[#10b981]`} />
                                                <span>Completed</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Printer size={32} className={styles.emptyIcon} />
                                        <span>No sub-department data found.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
