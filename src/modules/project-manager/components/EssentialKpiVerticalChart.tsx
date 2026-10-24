// src/modules/project-manager/components/EssentialKpiVerticalChart.tsx

"use client";

import React from "react";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";

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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm min-h-[350px] sm:min-h-[370px] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-5 w-44 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-60 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="w-full flex-1 bg-slate-50/40 rounded-2xl border border-slate-100/90 p-4 mt-3 min-h-[250px] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-rose-200/80 rounded-2xl p-6 text-center space-y-3 shadow-sm min-h-[350px] sm:min-h-[370px] flex flex-col items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={22} />
        </div>
        <div className="text-sm font-bold text-slate-800">
          {errorMsg || "Failed to load Essential KPI metrics"}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
      color: "#3b82f6", // Blue
    },
    {
      name: "Overdue",
      orderStatus: "Overdue",
      value: data?.overdue_orders_count ?? 0,
      color: "#f43f5e", // Rose
    },
    {
      name: "Dispatch today",
      orderStatus: "Due Today",
      value: data?.orders_due_today_count ?? 0,
      color: "#fbbf24", // Warm Yellow / Amber
    },
    {
      name: "Dispatch today (pending)",
      orderStatus: "Due Today Pending",
      value: data?.not_completed_orders_due_today_count ?? 0,
      color: "#f97316", // Orange
    },
    {
      name: "To deliver",
      orderStatus: "To Deliver",
      value: data?.orders_to_deliver_count ?? 0,
      color: "#10b981", // Emerald Green
    },
  ];

  const rawMax = Math.max(...metrics.map((m) => m.value), 5);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm min-h-[350px] sm:min-h-[370px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
            <TrendingUp size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-[19px] font-extrabold text-slate-900 tracking-tight leading-snug">
              Essential KPI metrics
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Critical order status breakdown — click bar to view orders
            </p>
          </div>
        </div>
      </div>

      {/* SVG Vertical Bar Chart Inner Framed Box */}
      <div className="w-full flex-1 bg-slate-50/40 rounded-2xl border border-slate-100/90 p-3 sm:p-4 mt-3 relative min-h-[250px] flex items-center">
        <svg viewBox="0 0 650 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
          {/* Y-Axis Gridlines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
            const y = 200 - ratio * 160;
            const gridVal = Math.round(ratio * rawMax);

            return (
              <g key={ratio}>
                <line x1="44" y1={y} x2="635" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="36" y={y + 4} textAnchor="end" className="text-[12px] font-bold fill-slate-500">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Render Vertical Column Bars */}
          {metrics.map((item, index) => {
            const slotWidth = 115.2;
            const slotCenter = 54 + (index + 0.5) * slotWidth;
            const barWidth = 56;
            const x = slotCenter - barWidth / 2;
            const barHeight = item.value > 0 && rawMax > 0
              ? Math.max((item.value / rawMax) * 160, 4)
              : 4;
            const y = 200 - barHeight;

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
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx={item.value > 0 ? "6" : "2"}
                  className="transition-all duration-300 group-hover:opacity-85"
                />

                {/* Count Badge over Column */}
                <text
                  x={slotCenter}
                  y={item.value > 0 ? y - 8 : 190}
                  textAnchor="middle"
                  className="text-[13.5px] font-black fill-slate-900"
                >
                  {item.value}
                </text>

                {/* X Labels */}
                {item.name === "Dispatch today (pending)" ? (
                  <>
                    <text
                      x={slotCenter}
                      y="224"
                      textAnchor="middle"
                      className="text-[12px] font-bold fill-slate-700 group-hover:fill-emerald-600 transition-colors"
                    >
                      Dispatch today
                    </text>
                    <text
                      x={slotCenter}
                      y="240"
                      textAnchor="middle"
                      className="text-[11.5px] font-bold fill-slate-700 group-hover:fill-emerald-600 transition-colors"
                    >
                      (pending)
                    </text>
                  </>
                ) : (
                  <text
                    x={slotCenter}
                    y="228"
                    textAnchor="middle"
                    className="text-[12px] font-bold fill-slate-700 group-hover:fill-emerald-600 transition-colors"
                  >
                    {item.name}
                  </text>
                )}
              </g>
            );
          })}

          <line x1="44" y1="200" x2="635" y2="200" stroke="#cbd5e1" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}