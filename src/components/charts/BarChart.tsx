"use client";

import React from "react";

interface BarChartDataItem {
    name: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: BarChartDataItem[];
    emptyMessage?: string;
}

export default function BarChart({
    data,
    emptyMessage = "No data available"
}: BarChartProps) {
    const maxVal = Math.max(...data.map((item) => item.value), 0);
    const totalVal = data.reduce((sum, item) => sum + item.value, 0);

    if (totalVal === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-slate-400 text-xs font-semibold">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center gap-3.5 w-full py-2">
            {data.map((item) => {
                // Calculate percentage relative to the maximum value in the dataset
                const percentage = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                const color = item.color || "#4f46e5"; // default Indigo-600

                return (
                    <div key={item.name} className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span className="truncate max-w-[220px]" title={item.name}>
                                {item.name}
                            </span>
                            <span className="text-slate-800 font-extrabold">{item.value}</span>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
