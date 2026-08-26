"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface SimpleStaff {
    id: number;
    staff_name: string;
}

interface ComplianceFormProps {
    initialData?: Compliance | null;
    staffs: SimpleStaff[];
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function ComplianceForm({
    initialData,
    staffs,
    onClose,
    onSubmit,
}: ComplianceFormProps) {
    const [formData, setFormData] = useState({
        compliance_name: "",
        compliance_type: "",
        description: "",
        due_date: "",
        reminder_date: "",
        assigned_to: "",
        status: "Pending",
        priority: "Medium",
        remarks: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                compliance_name: initialData.compliance_name || "",
                compliance_type: initialData.compliance_type || "",
                description: initialData.description || "",
                due_date: initialData.due_date ? initialData.due_date.split("T")[0] : "",
                reminder_date: initialData.reminder_date ? initialData.reminder_date.split("T")[0] : "",
                assigned_to: String(initialData.assigned_to) || "",
                status: initialData.status || "Pending",
                priority: initialData.priority || "Medium",
                remarks: initialData.remarks || "",
            });
        } else {
            setFormData({
                compliance_name: "",
                compliance_type: "",
                description: "",
                due_date: "",
                reminder_date: "",
                assigned_to: "",
                status: "Pending",
                priority: "Medium",
                remarks: "",
            });
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.compliance_name.trim()) {
            newErrors.compliance_name = "Compliance Name is required";
        }
        if (!formData.compliance_type.trim()) {
            newErrors.compliance_type = "Compliance Type is required";
        }
        if (!formData.due_date) {
            newErrors.due_date = "Due Date is required";
        }
        if (!formData.assigned_to) {
            newErrors.assigned_to = "Assignee is required";
        }
        if (!formData.status) {
            newErrors.status = "Status is required";
        }
        if (!formData.priority) {
            newErrors.priority = "Priority is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                compliance_name: formData.compliance_name,
                compliance_type: formData.compliance_type,
                description: formData.description,
                due_date: formData.due_date,
                reminder_date: formData.reminder_date || undefined,
                assigned_to: Number(formData.assigned_to),
                status: formData.status,
                priority: formData.priority,
                remarks: formData.remarks,
            };

            if (initialData) {
                // If updating, matching PUT specification which includes completed fields or allows them
                payload.completed_on = initialData.completed_on;
                payload.completed_by = initialData.completed_by;
            }

            await onSubmit(payload);
        } catch (err) {
            console.error("Form submit error", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statuses = ["Pending", "In Progress", "Completed", "Overdue"];
    const priorities = ["Low", "Medium", "High", "Urgent"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800">
                        {initialData ? "Edit Compliance" : "Add Compliance"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Compliance Name */}
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Compliance Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="compliance_name"
                                value={formData.compliance_name}
                                onChange={handleChange}
                                placeholder="e.g. GST Monthly Return"
                                className={`h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold ${errors.compliance_name ? "border-red-400" : "border-slate-205"
                                    }`}
                            />
                            {errors.compliance_name && (
                                <p className="text-xs text-red-500 font-medium">{errors.compliance_name}</p>
                            )}
                        </div>

                        {/* Compliance Type */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Compliance Type <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="compliance_type"
                                value={formData.compliance_type}
                                onChange={handleChange}
                                placeholder="e.g. Tax, Audit, Safety"
                                className={`h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold ${errors.compliance_type ? "border-red-400" : "border-slate-205"
                                    }`}
                            />
                            {errors.compliance_type && (
                                <p className="text-xs text-red-500 font-medium">{errors.compliance_type}</p>
                            )}
                        </div>

                        {/* Assigned To */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Assigned To Staff <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                className={`h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700 ${errors.assigned_to ? "border-red-400" : "border-slate-205"
                                    }`}
                            >
                                <option value="">Select Staff</option>
                                {staffs.map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.staff_name}
                                    </option>
                                ))}
                            </select>
                            {errors.assigned_to && (
                                <p className="text-xs text-red-500 font-medium">{errors.assigned_to}</p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className={`h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700 ${errors.due_date ? "border-red-400" : "border-slate-205"
                                    }`}
                            />
                            {errors.due_date && (
                                <p className="text-xs text-red-500 font-medium">{errors.due_date}</p>
                            )}
                        </div>

                        {/* Reminder Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Reminder Date
                            </label>
                            <input
                                type="date"
                                name="reminder_date"
                                value={formData.reminder_date}
                                onChange={handleChange}
                                className="h-10 w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="h-10 w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                            >
                                {statuses.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="h-10 w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                            >
                                {priorities.map((pr) => (
                                    <option key={pr} value={pr}>
                                        {pr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Details of compliance..."
                                className="w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-655 uppercase tracking-wide block">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                rows={2}
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Additional instructions..."
                                className="w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                            <span>{initialData ? "Save Changes" : "Create Compliance"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
