"use client";

import React from "react";

interface VerticalBarChartDataItem {
    name: string;
    value: number;
    color?: string;
}

interface VerticalBarChartProps {
    data: VerticalBarChartDataItem[];
    emptyMessage?: string;
}

export default function VerticalBarChart({
    data,
    emptyMessage = "No data available"
}: VerticalBarChartProps) {
    const maxVal = Math.max(...data.map((item) => item.value), 0);
    const totalVal = data.reduce((sum, item) => sum + item.value, 0);

    if (totalVal === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-slate-400 text-xs font-semibold select-none">
                <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-25 mb-2">
                    <rect x="5" y="45" width="10" height="10" fill="#cbd5e1" rx="1" />
                    <rect x="20" y="30" width="10" height="25" fill="#cbd5e1" rx="1" />
                    <rect x="35" y="15" width="10" height="40" fill="#cbd5e1" rx="1" />
                    <line x1="0" y1="55" x2="60" y2="55" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                {emptyMessage}
            </div>
        );
    }

    // Chart Dimensions
    const width = 450;
    const height = 160;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Grid details
    const gridYValues = [0, 0.5, 1]; // represent bottom, middle, top grid lines

    return (
        <div className="w-full h-full min-h-[160px] flex items-center justify-center">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full select-none overflow-visible"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Horizontal Grid lines */}
                {gridYValues.map((ratio, index) => {
                    const y = height - paddingBottom - ratio * chartHeight;
                    const gridVal = Math.round(ratio * maxVal);
                    return (
                        <g key={index} className="opacity-60">
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={width - paddingRight}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                            />
                            {/* Grid labels on the left */}
                            <text
                                x={paddingLeft - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                className="text-[9px] font-bold fill-slate-400 font-sans"
                            >
                                {gridVal}
                            </text>
                        </g>
                    );
                })}

                {/* Bars & Labels */}
                {data.map((item, index) => {
                    const numCategories = data.length;
                    const slotWidth = chartWidth / numCategories;
                    const barWidth = Math.min(22, slotWidth * 0.5); // restrict max bar width
                    const xCenter = paddingLeft + (index + 0.5) * slotWidth;
                    const x = xCenter - barWidth / 2;

                    const barHeight = maxVal > 0 ? (item.value / maxVal) * chartHeight : 0;
                    const y = height - paddingBottom - barHeight;
                    const color = item.color || "#4f46e5";

                    return (
                        <g key={item.name} className="group">
                            {/* SVG Title for native hover tooltip */}
                            <title>{`${item.name}: ${item.value}`}</title>

                            {/* Bar Column Rect */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 1.5)} // draw at least a sliver if value > 0
                                fill={color}
                                rx="3"
                                ry="3"
                                className="transition-all duration-300 hover:opacity-85 cursor-pointer origin-bottom"
                            />

                            {/* Value label on top of the bar */}
                            {item.value > 0 && (
                                <text
                                    x={xCenter}
                                    y={y - 5}
                                    textAnchor="middle"
                                    className="text-[9px] font-black fill-slate-700 font-sans transition-all duration-300"
                                >
                                    {item.value}
                                </text>
                            )}

                            {/* Category X-axis label */}
                            <text
                                x={xCenter}
                                y={height - paddingBottom + 15}
                                textAnchor="middle"
                                className="text-[9px] font-bold fill-slate-450 font-sans"
                            >
                                {item.name}
                            </text>
                        </g>
                    );
                })}

                {/* Basline axis */}
                <line
                    x1={paddingLeft}
                    y1={height - paddingBottom}
                    x2={width - paddingRight}
                    y2={height - paddingBottom}
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                />
            </svg>
        </div>
    );
}
