"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Search, RotateCcw, ChevronLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { ComplianceRole, Compliance, ComplianceKpi, ComplianceListParams } from "../types/compliances.types";
import {
    listCompliances,
    getComplianceKpi,
    createCompliance,
    updateCompliance,
    deleteCompliance,
    updateComplianceStatus,
} from "../services/compliances.service";
import { getStaffs, getManagerStaffs, Staff } from "../../admin/services/staff.service";

import ComplianceKpiCards from "./ComplianceKpiCards";
import ComplianceFilters from "./ComplianceFilters";
import ComplianceTable from "./ComplianceTable";
import ComplianceMobileCard from "./ComplianceMobileCard";
import ComplianceForm from "./ComplianceForm";
import ComplianceDetailsDrawer from "./ComplianceDetailsDrawer";
import ComplianceStatusDialog from "./ComplianceStatusDialog";
import DeleteComplianceDialog from "./DeleteComplianceDialog";

interface CompliancesPageProps {
    role: ComplianceRole;
}

export default function CompliancesPage({ role }: CompliancesPageProps) {
    const canCreate = role !== "accounts";
    const canDelete = role !== "accounts";

    // Main data states
    const [compliances, setCompliances] = useState<Compliance[]>([]);
    const [kpi, setKpi] = useState<ComplianceKpi | null>(null);
    const [staffs, setStaffs] = useState<Staff[]>([]);

    // Loading & Error States
    const [loading, setLoading] = useState(true);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Pagination & Filtering state
    const [filters, setFilters] = useState<ComplianceListParams>({
        page: 1,
        page_size: 5,
        search: "",
        status: "",
        priority: "",
        compliance_type: "",
        assigned_to: undefined,
        assigned_by: undefined,
        due_date: "",
        from_date: "",
        to_date: "",
        month: "",
        year: "",
        upto_today: undefined,
        is_overdue: undefined,
        not_completed: undefined,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 5,
        total_count: 0,
        total_pages: 1,
    });

    // Local state for search term (for debounce)
    const [searchVal, setSearchVal] = useState("");

    // Modal / Drawer visibility controls
    const [selectedCompliance, setSelectedCompliance] = useState<Compliance | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Auto-dismiss toast helper
    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    // Load Staff dropdown list based on role
    const loadStaffsList = useCallback(async () => {
        try {
            const data = role === "admin" ? await getStaffs() : await getManagerStaffs();
            setStaffs(data || []);
        } catch (err) {
            console.error("Failed to load staff list:", err);
        }
    }, [role]);

    useEffect(() => {
        loadStaffsList();
    }, [loadStaffsList]);

    // Fetch KPI statistics handler
    const fetchKpiStatistics = useCallback(async (currentFilters: ComplianceListParams) => {
        setKpiLoading(true);
        try {
            const data = await getComplianceKpi(role, currentFilters);
            setKpi(data);
        } catch (err) {
            console.error("Failed to fetch compliance KPIs:", err);
            // Suppress UI breakdown on KPI error
        } finally {
            setKpiLoading(false);
        }
    }, [role]);

    // Fetch Compliances list data handler
    const fetchCompliancesList = useCallback(async (currentFilters: ComplianceListParams) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await listCompliances(role, currentFilters);
            setCompliances(res.items || []);
            setPagination(
                res.pagination || {
                    page: currentFilters.page || 1,
                    page_size: currentFilters.page_size || 5,
                    total_count: (res.items || []).length,
                    total_pages: 1,
                }
            );
        } catch (err: any) {
            console.error("Failed to load compliance listing:", err);
            setErrorMsg("Unable to load compliances.");
        } finally {
            setLoading(false);
        }
    }, [role]);

    // Debounced search logic matching project search implementation
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                search: searchVal,
                page: 1, // Reset page on query search
            }));
        }, 450);

        return () => clearTimeout(delayDebounceFn);
    }, [searchVal]);

    // Combined fetch trigger on filters state change
    useEffect(() => {
        fetchCompliancesList(filters);
        fetchKpiStatistics(filters);
    }, [filters, fetchCompliancesList, fetchKpiStatistics]);

    // Refresh entire data
    const handleReload = () => {
        fetchCompliancesList(filters);
        fetchKpiStatistics(filters);
    };

    // Filter modifications handlers
    const handleFilterChange = (newFilters: Partial<ComplianceListParams>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1, // Reset page to 1 on any filter criteria changes
        }));
    };

    const handleResetFilters = () => {
        setSearchVal("");
        setFilters({
            page: 1,
            page_size: 5,
            search: "",
            status: "",
            priority: "",
            compliance_type: "",
            assigned_to: undefined,
            assigned_by: undefined,
            due_date: "",
            from_date: "",
            to_date: "",
            month: "",
            year: "",
            upto_today: undefined,
            is_overdue: undefined,
            not_completed: undefined,
        });
    };

    // Pagination page triggers
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.total_pages) return;
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    // Form submit handler (supports CREATE and UPDATE)
    const handleFormSubmit = async (payload: any) => {
        try {
            if (selectedCompliance) {
                // UPDATE (PUT)
                await updateCompliance(role, selectedCompliance.id, payload);
                setToastMsg({
                    type: "success",
                    text: `Compliance "${payload.compliance_name}" updated successfully.`,
                });
            } else {
                // CREATE (POST)
                await createCompliance(role, payload);
                setToastMsg({
                    type: "success",
                    text: `Compliance "${payload.compliance_name}" created successfully.`,
                });
            }
            setIsFormOpen(false);
            setSelectedCompliance(null);
            handleReload();
        } catch (err: any) {
            console.error("Failed to commit compliance form:", err);
            setToastMsg({
                type: "error",
                text: err?.response?.data?.message || "An error occurred while saving.",
            });
        }
    };

    // Quick status patch handler
    const handleSaveStatus = async (statusPayload: { status: string; remarks: string }) => {
        if (!selectedCompliance) return;
        try {
            await updateComplianceStatus(role, selectedCompliance.id, statusPayload);
            setToastMsg({
                type: "success",
                text: `Status for "${selectedCompliance.compliance_name}" changed to "${statusPayload.status}".`,
            });
            setIsStatusOpen(false);
            setSelectedCompliance(null);
            handleReload();
        } catch (err: any) {
            console.error(err);
            setToastMsg({
                type: "error",
                text: err?.response?.data?.message || "Failed to update status.",
            });
        }
    };

    // Delete handler
    const handleDeleteConfirm = async () => {
        if (!selectedCompliance) return;
        try {
            await deleteCompliance(role, selectedCompliance.id);
            setToastMsg({
                type: "success",
                text: `Compliance "${selectedCompliance.compliance_name}" deleted successfully.`,
            });
            setIsDeleteOpen(false);
            setSelectedCompliance(null);
            handleReload();
        } catch (err: any) {
            console.error(err);
            setToastMsg({
                type: "error",
                text: err?.response?.data?.message || "Failed to delete compliance.",
            });
        }
    };

    // Modal open helpers
    const handleActionView = (comp: Compliance) => {
        setSelectedCompliance(comp);
        setIsDetailsOpen(true);
    };

    const handleActionEdit = (comp: Compliance) => {
        setSelectedCompliance(comp);
        setIsFormOpen(true);
    };

    const handleActionStatusChange = (comp: Compliance) => {
        setSelectedCompliance(comp);
        setIsStatusOpen(true);
    };

    const handleActionDelete = (comp: Compliance) => {
        setSelectedCompliance(comp);
        setIsDeleteOpen(true);
    };

    const hasActiveFilters =
        filters.search !== "" ||
        filters.status !== "" ||
        filters.priority !== "" ||
        filters.compliance_type !== "" ||
        filters.assigned_to !== undefined ||
        filters.assigned_by !== undefined ||
        filters.due_date !== "" ||
        filters.from_date !== "" ||
        filters.to_date !== "" ||
        filters.month !== "" ||
        filters.year !== "" ||
        filters.upto_today !== undefined ||
        filters.is_overdue !== undefined ||
        filters.not_completed !== undefined;

    const startRecord = (pagination.page - 1) * pagination.page_size + 1;
    const endRecord = Math.min(pagination.page * pagination.page_size, pagination.total_count);

    return (
        <div className="flex flex-col gap-6 p-6 w-full font-sans text-slate-800">
            {/* Toast Alert Notification */}
            {toastMsg && (
                <div
                    className={`fixed top-5 right-5 z-[50]/3000 px-4 py-3 rounded-xl shadow-lg border text-xs font-black flex items-center gap-2 duration-200 animate-fadeIn ${toastMsg.type === "success"
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-rose-600 text-white border-rose-700"
                        }`}
                >
                    {toastMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{toastMsg.text}</span>
                </div>
            )}

            {/* Header Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compliances</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Track and manage statutory, tax, legal and operational compliance deadlines.
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => {
                            setSelectedCompliance(null);
                            setIsFormOpen(true);
                        }}
                        className="h-10 px-4.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Compliance</span>
                    </button>
                )}
            </div>

            {/* Statistics counters cards */}
            <ComplianceKpiCards kpi={kpi} isLoading={kpiLoading} />

            {/* Filters Area container */}
            <ComplianceFilters
                filters={{ ...filters, search: searchVal }}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                staffs={staffs}
            />

            {/* Filter toolbar text input catcher to bind debounce */}
            <div className="hidden">
                <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                />
            </div>

            {/* Content Area grid */}
            <div className="w-full">
                {loading ? (
                    /* Loading State: Skeletons */
                    <div className="space-y-3 bg-white p-6 rounded-xl border border-slate-250/70">
                        <div className="h-6 w-1/4 bg-slate-100 animate-pulse rounded-md" />
                        <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-md" />
                        <div className="space-y-2 pt-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-slate-100/70 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    </div>
                ) : errorMsg ? (
                    /* Error State */
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-800">{errorMsg}</h3>
                            <p className="text-xs text-slate-500 font-semibold">
                                An error occurred while loading the records. Please try again.
                            </p>
                        </div>
                        <button
                            onClick={handleReload}
                            className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : compliances.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                            <HelpCircle size={24} />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                            <h3 className="text-sm font-black text-slate-800">No compliances found</h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {hasActiveFilters
                                    ? "Try changing your filters or search terms to show matches."
                                    : canCreate
                                        ? "Track statutory deadlines and assignments by adding your first compliance record."
                                        : "There are no compliance records assigned to your profile."}
                            </p>
                        </div>
                        {hasActiveFilters ? (
                            <button
                                onClick={handleResetFilters}
                                className="px-4.5 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                            >
                                Clear Filters
                            </button>
                        ) : canCreate ? (
                            <button
                                onClick={() => {
                                    setSelectedCompliance(null);
                                    setIsFormOpen(true);
                                }}
                                className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                                <Plus size={14} />
                                <span>Add Compliance</span>
                            </button>
                        ) : null}
                    </div>
                ) : (
                    /* Responsive lists */
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block w-full">
                            <ComplianceTable
                                compliances={compliances}
                                onView={handleActionView}
                                onEdit={handleActionEdit}
                                onChangeStatus={handleActionStatusChange}
                                onDelete={canDelete ? handleActionDelete : undefined}
                            />
                        </div>

                        {/* Mobile Cards List View */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {compliances.map((comp) => (
                                <ComplianceMobileCard
                                    key={comp.id}
                                    comp={comp}
                                    onView={handleActionView}
                                    onEdit={handleActionEdit}
                                    onChangeStatus={handleActionStatusChange}
                                    onDelete={canDelete ? handleActionDelete : undefined}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-xs text-slate-500 font-semibold">
                            <span>
                                Showing {startRecord}–{endRecord} of {pagination.total_count} compliances
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-1 px-2 border border-slate-205 hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Previous</span>
                                </button>

                                <span className="px-3 py-1 font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-md">
                                    Page {pagination.page} of {pagination.total_pages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.total_pages}
                                    className="p-1 px-2 border border-slate-205 hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
                                    title="Next page"
                                >
                                    <span>Next</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Details drawer Overlay (view) */}
            {isDetailsOpen && (
                <ComplianceDetailsDrawer
                    compliance={selectedCompliance}
                    onClose={() => {
                        setIsDetailsOpen(false);
                        setSelectedCompliance(null);
                    }}
                />
            )}

            {/* Create / Edit Form modal dialog */}
            {isFormOpen && (
                <ComplianceForm
                    initialData={selectedCompliance}
                    staffs={staffs}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedCompliance(null);
                    }}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* Status Transition dialog */}
            {isStatusOpen && selectedCompliance && (
                <ComplianceStatusDialog
                    compliance={selectedCompliance}
                    onClose={() => {
                        setIsStatusOpen(false);
                        setSelectedCompliance(null);
                    }}
                    onConfirm={handleSaveStatus}
                />
            )}

            {/* Delete confirmation dialog */}
            {isDeleteOpen && selectedCompliance && (
                <DeleteComplianceDialog
                    compliance={selectedCompliance}
                    onClose={() => {
                        setIsDeleteOpen(false);
                        setSelectedCompliance(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
}
