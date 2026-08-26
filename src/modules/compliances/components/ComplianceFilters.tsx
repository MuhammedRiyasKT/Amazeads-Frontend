"use client";

import React, { useState } from "react";
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { ComplianceListParams } from "../types/compliances.types";

interface SimpleStaff {
    id: number;
    staff_name: string;
}

interface ComplianceFiltersProps {
    filters: ComplianceListParams;
    onFilterChange: (newFilters: Partial<ComplianceListParams>) => void;
    onReset: () => void;
    staffs: SimpleStaff[];
}

export default function ComplianceFilters({
    filters,
    onFilterChange,
    onReset,
    staffs,
}: ComplianceFiltersProps) {
    const [showMore, setShowMore] = useState(false);

    const statuses = ["Pending", "In Progress", "Completed", "Overdue"];
    const priorities = ["Low", "Medium", "High", "Urgent"];
    const months = [
        { label: "January", value: "01" },
        { label: "February", value: "02" },
        { label: "March", value: "03" },
        { label: "April", value: "04" },
        { label: "May", value: "05" },
        { label: "June", value: "06" },
        { label: "July", value: "07" },
        { label: "August", value: "08" },
        { label: "September", value: "09" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 1 + i));

    // Handle standard input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    // Handle checkbox change
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        onFilterChange({ [name]: checked || undefined });
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            {/* Main filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                {/* Search */}
                <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="search"
                            value={filters.search || ""}
                            onChange={handleChange}
                            placeholder="Search compliance, type, staff..."
                            className="pl-9 h-10 w-full rounded-md border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Status
                    </label>
                    <select
                        name="status"
                        value={filters.status || ""}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Priority
                    </label>
                    <select
                        name="priority"
                        value={filters.priority || ""}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                    >
                        <option value="">All Priorities</option>
                        {priorities.map((pr) => (
                            <option key={pr} value={pr}>
                                {pr}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Compliance Type */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Type
                    </label>
                    <input
                        type="text"
                        name="compliance_type"
                        value={filters.compliance_type || ""}
                        onChange={handleChange}
                        placeholder="e.g. Tax, Audit"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                    />
                </div>

                {/* Action Controls */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs gap-1.5 focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <Filter size={14} />
                        <span>Filters</span>
                        {showMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        className="p-2.5 h-10 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-lg focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                        title="Reset Filters"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Advanced Drawer Filters */}
            {showMore && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                    {/* Assigned To */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Assigned To Staff
                        </label>
                        <select
                            name="assigned_to"
                            value={filters.assigned_to || ""}
                            onChange={(e) =>
                                onFilterChange({
                                    assigned_to: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-750"
                        >
                            <option value="">Any Staff</option>
                            {staffs.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.staff_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Assigned By */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Assigned By
                        </label>
                        <select
                            name="assigned_by"
                            value={filters.assigned_by || ""}
                            onChange={(e) =>
                                onFilterChange({
                                    assigned_by: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-750"
                        >
                            <option value="">Any Assigner</option>
                            {staffs.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.staff_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Specific Due Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Specific Due Date
                        </label>
                        <input
                            type="date"
                            name="due_date"
                            value={filters.due_date || ""}
                            onChange={handleChange}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-750"
                        />
                    </div>

                    {/* Months & Years (Dual filtering combination) */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Month & Year
                        </label>
                        <div className="flex gap-2">
                            <select
                                name="month"
                                value={filters.month || ""}
                                onChange={handleChange}
                                className="h-10 w-[60%] rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-750"
                            >
                                <option value="">Month</option>
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="year"
                                value={filters.year || ""}
                                onChange={handleChange}
                                className="h-10 w-[40%] rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-750"
                            >
                                <option value="">Year</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date range from */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            From Date
                        </label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date || ""}
                            onChange={handleChange}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-755"
                        />
                    </div>

                    {/* Date range to */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            To Date
                        </label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date || ""}
                            onChange={handleChange}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-755"
                        />
                    </div>

                    {/* Checkboxes parameters */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 flex flex-wrap gap-x-4 gap-y-3 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold text-xs">
                            <input
                                type="checkbox"
                                name="upto_today"
                                checked={!!filters.upto_today}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            Upto Today
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold text-xs">
                            <input
                                type="checkbox"
                                name="is_overdue"
                                checked={!!filters.is_overdue}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            Overdue Only
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold text-xs">
                            <input
                                type="checkbox"
                                name="not_completed"
                                checked={!!filters.not_completed}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            Not Completed
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
