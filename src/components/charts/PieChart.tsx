"use client";

import React from "react";

interface PieChartDataItem {
    name: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartDataItem[];
    totalLabel?: string;
    centerValue?: string;
    emptyMessage?: string;
    size?: number;
    minHeight?: string;
}

export default function PieChart({
    data,
    totalLabel = "Total",
    centerValue,
    emptyMessage = "No data",
    size = 140,
    minHeight = "min-h-[220px]"
}: PieChartProps) {
    const totalObj = data.reduce((acc, curr) => acc + curr.value, 0);

    if (totalObj === 0) {
        return (
            <div className={`flex flex-col items-center justify-center h-full text-slate-400 text-xs font-semibold ${minHeight}`}>
                <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-30 mb-3">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                </svg>
                {emptyMessage}
            </div>
        );
    }

    // Calculate coordinates for SVG paths
    let accumulatedAngle = 0;
    const radius = 35;
    const strokeWidth = 10;
    const center = 50;

    const paths = data.map((item) => {
        if (item.value === 0) return null;
        const percentage = item.value / totalObj;
        const angle = percentage * 360;

        // Segment start
        const startAngle = accumulatedAngle;
        // Segment end
        const endAngle = accumulatedAngle + angle;
        accumulatedAngle += angle;

        // Convert angles to radians
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        // If segment is 100% of the circle, we render a full circle
        if (percentage >= 0.999) {
            return (
                <circle
                    key={item.name}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                />
            );
        }

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${x1} ${y1}`, // Move to starting coordinate
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}` // Draw ARC
        ].join(" ");

        return (
            <path
                key={item.name}
                d={pathData}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-90 cursor-pointer"
            >
                <title>{`${item.name}: ${item.value}`}</title>
            </path>
        );
    });

    return (
        <div className={`flex flex-col items-center justify-center relative w-full h-full ${minHeight}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" width={size} height={size} className="transform -rotate-90">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#f8fafc" strokeWidth={strokeWidth} />
                    {paths}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none select-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">
                        {totalLabel}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 leading-tight mt-0.5 max-w-[110px] truncate">
                        {centerValue !== undefined ? centerValue : totalObj}
                    </span>
                </div>
            </div>
        </div>
    );
}
