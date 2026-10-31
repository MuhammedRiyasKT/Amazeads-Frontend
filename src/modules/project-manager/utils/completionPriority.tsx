import React from "react";

export interface PriorityInfo {
  label: string;
  subLabel?: string;
  level: "urgent" | "high" | "medium" | "normal";
  bgClass: string;
  dotClass: string;
}

/**
 * Calculates priority based on target completion date or explicit priority.
 * - Today or past: Urgent / Overdue (Red)
 * - Tomorrow: High (Amber)
 * - Within 2-3 days: Medium (Blue)
 * - Beyond 3 days: Normal (Emerald)
 */
export function getPriorityInfo(
  completionDateStr?: string | null,
  explicitPriority?: string | null
): PriorityInfo {
  if (explicitPriority) {
    const ep = explicitPriority.toLowerCase();
    if (ep === "urgent" || ep === "high") {
      return {
        label: "Urgent",
        level: "urgent",
        bgClass: "bg-red-50 text-red-700 border-red-200",
        dotClass: "bg-red-500 animate-pulse",
      };
    }
    if (ep === "medium") {
      return {
        label: "Medium",
        level: "medium",
        bgClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      };
    }
    if (ep === "low" || ep === "normal") {
      return {
        label: "Normal",
        level: "normal",
        bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    }
  }

  if (!completionDateStr) {
    return {
      label: "Normal",
      subLabel: "No date",
      level: "normal",
      bgClass: "bg-slate-50 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compDate = new Date(completionDateStr);
    if (isNaN(compDate.getTime())) {
      return {
        label: "Normal",
        level: "normal",
        bgClass: "bg-slate-50 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
    }
    compDate.setHours(0, 0, 0, 0);

    const diffTime = compDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Overdue",
        subLabel: `${Math.abs(diffDays)}d over`,
        level: "urgent",
        bgClass: "bg-rose-50 text-rose-700 border-rose-200",
        dotClass: "bg-rose-500 animate-pulse",
      };
    } else if (diffDays === 0) {
      return {
        label: "Urgent",
        subLabel: "Today",
        level: "urgent",
        bgClass: "bg-red-50 text-red-700 border-red-200",
        dotClass: "bg-red-500",
      };
    } else if (diffDays === 1) {
      return {
        label: "High",
        subLabel: "Tomorrow",
        level: "high",
        bgClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      };
    } else if (diffDays <= 3) {
      return {
        label: "Medium",
        subLabel: `${diffDays}d left`,
        level: "medium",
        bgClass: "bg-blue-50 text-blue-700 border-blue-200",
        dotClass: "bg-blue-500",
      };
    } else {
      return {
        label: "Normal",
        subLabel: `${diffDays}d left`,
        level: "normal",
        bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    }
  } catch {
    return {
      label: "Normal",
      level: "normal",
      bgClass: "bg-slate-50 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    };
  }
}

/**
 * PriorityBadge component for rendering completion-date based priority pill
 */
export function PriorityBadge({
  completionDate,
  explicitPriority,
}: {
  completionDate?: string | null;
  explicitPriority?: string | null;
}) {
  const p = getPriorityInfo(completionDate, explicitPriority);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${p.bgClass} shadow-2xs whitespace-nowrap select-none`}
      title={p.subLabel ? `${p.label} (${p.subLabel})` : p.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dotClass}`} />
      <span>{p.label}</span>
      {p.subLabel && (
        <span className="text-[9px] opacity-75 font-semibold">({p.subLabel})</span>
      )}
    </span>
  );
}

/**
 * Sorts orders list placing unassigned (pending) orders first (sorted by completion_date ascending: urgent/earliest first),
 * followed by already assigned orders (which do not crowd the top).
 */
export function sortByCompletionDate<T = any>(
  items: T[],
  isAssignedFn?: (item: T) => boolean
): T[] {
  return [...items].sort((a: any, b: any) => {
    if (isAssignedFn) {
      const aAssigned = isAssignedFn(a);
      const bAssigned = isAssignedFn(b);
      // Unassigned (Pending) comes before Assigned
      if (!aAssigned && bAssigned) return -1;
      if (aAssigned && !bAssigned) return 1;
    }

    const getDateVal = (item: any) => {
      const d = item.completion_date || item.projects?.[0]?.completion_date;
      if (!d) return 9999999999999;
      const t = new Date(d).getTime();
      return isNaN(t) ? 9999999999999 : t;
    };
    return getDateVal(a) - getDateVal(b);
  });
}
