// src/modules/project-manager/components/EssentialKpiVerticalChart.tsx

"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export interface EssentialKpiData {
  total_not_completed_orders_count?: number;
  overdue_orders_count?: number;
  orders_due_today_count?: number;
  not_completed_orders_due_today_count?: number;
  orders_to_deliver_count?: number;
  orders_to_close_by_salesman_count?: number;
  pending_customer_approval_projects_count?: number;
}

interface EssentialKpiVerticalChartProps {
  data: EssentialKpiData | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMsg?: string;
  onRetry?: () => void;
  onSelectMetric?: (orderStatus: string, labelName: string) => void;
}

export default function EssentialKpiVerticalChart({
  data,
  isLoading = false,
  isError = false,
  errorMsg = "",
  onRetry,
  onSelectMetric,
}: EssentialKpiVerticalChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
        <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-64 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-2xs min-h-[350px] sm:min-h-[370px] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={20} />
        </div>
        <div className="text-xs font-bold text-slate-700">
          {errorMsg || "Failed to load Essential KPI metrics"}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            <RotateCcw size={13} /> Retry
          </button>
        )}
      </div>
    );
  }

  const metrics = [
    {
      name: "Not completed",
      orderStatus: "Not Completed",
      value: data?.total_not_completed_orders_count ?? 0,
      color: "#6366f1", // Purple
    },
    {
      name: "Overdue",
      orderStatus: "Overdue",
      value: data?.overdue_orders_count ?? 0,
      color: "#ef4444", // Red
    },
    {
      name: "Dispatch today",
      orderStatus: "Due Today",
      value: data?.orders_due_today_count ?? 0,
      color: "#f59e0b", // Amber
    },
    {
      name: "Dispatch today (pending)",
      orderStatus: "Due Today Pending",
      value: data?.not_completed_orders_due_today_count ?? 0,
      color: "#ea580c", // Orange
    },
    {
      name: "To deliver",
      orderStatus: "To Deliver",
      value: data?.orders_to_deliver_count ?? 0,
      color: "#10b981", // Emerald Green
    },
  ];

  const maxVal = Math.max(...metrics.map((m) => m.value), 5);
  const roundedMax = Math.ceil(maxVal / 2) * 2 || 18;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
      {/* Header */}
      <div className="space-y-0.5 border-b border-slate-100 pb-2">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Essential KPI metrics
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          Critical order status breakdown — click bar to view orders
        </p>
      </div>

      {/* SVG Vertical Bar Chart Wrapper — fills remaining card space */}
      <div className="w-full flex-1 relative">
        <svg viewBox="0 0 560 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
          {/* Y-Axis Gridlines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
            const y = 195 - ratio * 170;
            const gridVal = Math.round(ratio * roundedMax);

            return (
              <g key={ratio} className="opacity-40">
                <line x1="34" y1={y} x2="545" y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                <text x="26" y={y + 4} textAnchor="end" className="text-[12px] font-extrabold fill-slate-500">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Render Vertical Column Bars */}
          {metrics.map((item, index) => {
            const x = 60 + index * 95;
            const barHeight = roundedMax > 0 ? (item.value / roundedMax) * 170 : 0;
            const y = 195 - barHeight;

            return (
              <g
                key={item.name}
                className="group cursor-pointer"
                onClick={() => {
                  if (onSelectMetric) {
                    onSelectMetric(item.orderStatus, item.name);
                  }
                }}
              >
                <title>{`Click to view ${item.name} orders (${item.value})`}</title>
                <rect
                  x={x}
                  y={y}
                  width={40}
                  height={Math.max(barHeight, 2)}
                  fill={item.color}
                  rx="5"
                  className="transition-all duration-300 group-hover:opacity-80"
                />

                {/* Count Badge over Column */}
                {item.value > 0 && (
                  <text
                    x={x + 20}
                    y={y - 7}
                    textAnchor="middle"
                    className="text-[15px] font-black fill-slate-900 group-hover:fill-indigo-600 transition-colors"
                  >
                    {item.value}
                  </text>
                )}

                {/* Rotated X Label */}
                <text
                  x={x + 20}
                  y="212"
                  transform={`rotate(-28, ${x + 20}, 212)`}
                  textAnchor="end"
                  className="text-[11.5px] font-extrabold fill-slate-700 group-hover:fill-indigo-600 transition-colors"
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          <line x1="34" y1="195" x2="545" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}