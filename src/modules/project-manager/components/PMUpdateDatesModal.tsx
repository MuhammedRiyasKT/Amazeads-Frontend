// src/modules/project-manager/components/PMUpdateDatesModal.tsx

import React, { useEffect, useState } from "react";
import { X, Calendar, AlertCircle, Layers, Lock } from "lucide-react";
import {
  updateProjectDepartmentAssignments,
  getPMProjectStatusTimeline,
} from "../services/managerOrder.service";

interface DepartmentRoutingItem {
  department_id: number;
  name: string;
  label: string;
  is_assigned: boolean;
  task_assigned: boolean;
  staff_name?: string | null;
  status?: string | null;
}

const DEFAULT_DEPARTMENTS: DepartmentRoutingItem[] = [
  { department_id: 1, name: "designing", label: "Designing", is_assigned: false, task_assigned: false },
  { department_id: 2, name: "printing", label: "Printing", is_assigned: false, task_assigned: false },
  { department_id: 3, name: "production", label: "Production", is_assigned: false, task_assigned: false },
  { department_id: 4, name: "logistics", label: "Logistics", is_assigned: true, task_assigned: false },
];

interface PMUpdateDatesModalProps {
  isOpen: boolean;
  projectId: number | null;
  projectName?: string;
  orderNumber?: string;
  currentDesignDate: string | null;
  currentPrintingDate: string | null;
  commitDate: string | null;
  completionDate: string | null;
  initialDepartments?: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function PMUpdateDatesModal({
  isOpen,
  projectId,
  projectName,
  orderNumber,
  currentDesignDate,
  currentPrintingDate,
  commitDate,
  completionDate,
  initialDepartments,
  onClose,
  onSuccess,
}: PMUpdateDatesModalProps) {
  const [departments, setDepartments] = useState<DepartmentRoutingItem[]>(DEFAULT_DEPARTMENTS);
  const [designDate, setDesignDate] = useState("");
  const [printingDate, setPrintingDate] = useState("");
  const [errorDesign, setErrorDesign] = useState<string | null>(null);
  const [errorPrint, setErrorPrint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const formatDateStyle = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      setDesignDate(currentDesignDate ? currentDesignDate.split("T")[0] : "");
      setPrintingDate(currentPrintingDate ? currentPrintingDate.split("T")[0] : "");
      setErrorDesign(null);
      setErrorPrint(null);
      setGlobalError(null);

      // Initialize departments from initialDepartments if available
      const initial = DEFAULT_DEPARTMENTS.map((std) => {
        const found = initialDepartments?.find(
          (d: any) =>
            d.department_id === std.department_id ||
            d.id === std.department_id ||
            d.name?.toLowerCase() === std.name ||
            d.department_name?.toLowerCase() === std.name
        );
        const isTaskAssigned = Boolean(
          found?.task_assigned === true ||
          found?.is_task_assigned === true ||
          found?.final_status === true ||
          found?.status === "In Progress" ||
          found?.status === "Completed" ||
          found?.staff_name ||
          found?.assigned_to
        );
        const isLogistics = std.department_id === 4 || std.name === "logistics";
        const isAssigned = isTaskAssigned
          ? true
          : (found ? (isLogistics ? true : Boolean(found.is_assigned)) : std.is_assigned);

        return {
          ...std,
          is_assigned: isAssigned,
          task_assigned: isTaskAssigned,
          staff_name: found?.staff_name,
          status: found?.status,
        };
      });
      setDepartments(initial);

      // Fetch live project timeline to accurately check department assignment & task statuses
      setIsLoadingDepts(true);
      getPMProjectStatusTimeline(projectId)
        .then((data) => {
          const timelineDepts = data?.departments || [];
          setDepartments((prev) => {
            return DEFAULT_DEPARTMENTS.map((std) => {
              const tDept = timelineDepts.find(
                (d: any) =>
                  d.department_id === std.department_id ||
                  d.id === std.department_id ||
                  d.name?.toLowerCase() === std.name ||
                  d.department_name?.toLowerCase() === std.name
              );
              const prevDept = prev.find((d) => d.department_id === std.department_id);

              const isTaskAssigned = Boolean(
                tDept?.task_assigned === true ||
                tDept?.is_task_assigned === true ||
                tDept?.final_status === true ||
                tDept?.status === "In Progress" ||
                tDept?.status === "Completed" ||
                tDept?.staff_name ||
                tDept?.assigned_to
              );

              const isLogistics = std.department_id === 4 || std.name === "logistics";
              const isAssigned = isTaskAssigned
                ? true
                : isLogistics
                ? true
                : (tDept ? Boolean(tDept.is_assigned) : Boolean(prevDept?.is_assigned));

              return {
                ...std,
                is_assigned: isAssigned,
                task_assigned: isTaskAssigned,
                staff_name: tDept?.staff_name || prevDept?.staff_name,
                status: tDept?.status || prevDept?.status,
              };
            });
          });
        })
        .catch(console.error)
        .finally(() => setIsLoadingDepts(false));
    }
  }, [isOpen, projectId, currentDesignDate, currentPrintingDate, initialDepartments]);

  const handleDepartmentToggle = (deptId: number) => {
    if (deptId === 4) return;
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.department_id === deptId) {
          const isLogistics = d.department_id === 4 || d.name?.toLowerCase() === "logistics";
          if (isLogistics) return { ...d, is_assigned: true };
          if (d.task_assigned) {
            alert("Cannot modify this department because a task has already been assigned to it.");
            return d;
          }
          const nextAssigned = !d.is_assigned;
          const today = new Date().toISOString().split("T")[0];
          const fallbackDate = commitDate ? commitDate.split("T")[0] : today;

          if (deptId === 1 && nextAssigned && !designDate) {
            setDesignDate(currentDesignDate ? currentDesignDate.split("T")[0] : fallbackDate);
          }
          if (deptId === 2 && nextAssigned && !printingDate) {
            setPrintingDate(currentPrintingDate ? currentPrintingDate.split("T")[0] : fallbackDate);
          }
          return { ...d, is_assigned: nextAssigned };
        }
        return d;
      })
    );
  };

  const validateDesignDate = (dValStr: string) => {
    if (!dValStr) {
      setErrorDesign("Design target date is required");
      return false;
    }
    const dVal = new Date(dValStr).setHours(0, 0, 0, 0);

    if (commitDate) {
      const cVal = new Date(commitDate).setHours(0, 0, 0, 0);
      if (dVal < cVal) {
        setErrorDesign(`Design date cannot be earlier than Commit Date (${formatDateStyle(commitDate)})`);
        return false;
      }
    }

    if (completionDate) {
      const compVal = new Date(completionDate).setHours(0, 0, 0, 0);
      if (dVal > compVal) {
        setErrorDesign(`Design date cannot be later than Completion Date (${formatDateStyle(completionDate)})`);
        return false;
      }
    }

    setErrorDesign(null);
    return true;
  };

  const validatePrintingDate = (pValStr: string) => {
    if (!pValStr) {
      setErrorPrint("Printing target date is required");
      return false;
    }
    const pVal = new Date(pValStr).setHours(0, 0, 0, 0);

    if (commitDate) {
      const cVal = new Date(commitDate).setHours(0, 0, 0, 0);
      if (pVal < cVal) {
        setErrorPrint(`Printing date cannot be earlier than Commit Date (${formatDateStyle(commitDate)})`);
        return false;
      }
    }

    if (completionDate) {
      const compVal = new Date(completionDate).setHours(0, 0, 0, 0);
      if (pVal > compVal) {
        setErrorPrint(`Printing date cannot be later than Completion Date (${formatDateStyle(completionDate)})`);
        return false;
      }
    }

    setErrorPrint(null);
    return true;
  };

  if (!isOpen || !projectId) return null;

  const isDesigningSelected = departments.some((d) => d.department_id === 1 && d.is_assigned);
  const isPrintingSelected = departments.some((d) => d.department_id === 2 && d.is_assigned);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Ensure at least one department is selected
    const hasAnyDept = departments.some((d) => d.is_assigned);
    if (!hasAnyDept) {
      setGlobalError("Please select at least one Target Department for the project.");
      return;
    }

    // 2. Ensure task-assigned departments are not unchecked
    const hasInvalidLocked = departments.some((d) => d.task_assigned && !d.is_assigned);
    if (hasInvalidLocked) {
      setGlobalError("Departments with assigned tasks cannot be removed.");
      return;
    }

    if (isDesigningSelected) {
      if (!designDate) {
        setErrorDesign("Please select a Design Target Date");
        return;
      }
      if (!validateDesignDate(designDate)) return;
    }

    if (isPrintingSelected) {
      if (!printingDate) {
        setErrorPrint("Please select a Printing Target Date");
        return;
      }
      if (!validatePrintingDate(printingDate)) return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload: any = {
        departments: departments.map((d) => ({
          department_id: d.department_id,
          status: Boolean(d.is_assigned),
        })),
      };

      if (isDesigningSelected) {
        payload.design_date = designDate;
      }
      if (isPrintingSelected) {
        payload.printing_date = printingDate;
      }

      await updateProjectDepartmentAssignments(projectId, payload);

      onSuccess();
    } catch (err: any) {
      console.error("Error updating project dates and routing:", err);
      const detail = err?.response?.data?.detail;
      let errMsg = "Failed to update project routing and dates.";
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d: any) => d?.msg || (typeof d === "string" ? d : JSON.stringify(d))).join(", ");
      } else if (detail && typeof detail === "object" && detail.msg) {
        errMsg = detail.msg;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }
      setGlobalError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={18} />
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase leading-tight">
                Update Project Dates & Routing
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 max-w-[280px] truncate">
                {orderNumber && <span className="text-indigo-700 mr-1.5">Order #{orderNumber}</span>}
                {projectName && (
                  <>
                    Project: <span className="text-slate-800">{projectName}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Ranges Reminder */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Commit Date</span>
              <strong className="text-indigo-700 font-extrabold">{formatDateStyle(commitDate)}</strong>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Completion Date</span>
              <strong className="text-emerald-700 font-extrabold">{formatDateStyle(completionDate)}</strong>
            </div>
          </div>

          {globalError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2 text-[11px] font-semibold text-rose-600 items-start">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Target Departments (Workflow Routing) Section */}
          <div className="flex flex-col gap-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-slate-500 font-black tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-600" />
                <span>Target Departments (Routing) *</span>
              </label>
              {isLoadingDepts && (
                <span className="text-[10px] text-slate-400 italic">Checking status...</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {departments.map((dept) => {
                const isLogistics = dept.department_id === 4 || dept.name?.toLowerCase() === "logistics";
                const isLocked = dept.task_assigned || isLogistics;
                const isChecked = isLogistics ? true : dept.is_assigned;

                return (
                  <label
                    key={dept.department_id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all select-none ${
                      isLogistics
                        ? "bg-slate-100 border-slate-200 text-slate-700 font-bold cursor-not-allowed opacity-90"
                        : isLocked
                        ? "bg-slate-100 border-slate-200 text-slate-700 font-bold cursor-not-allowed"
                        : isChecked
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold cursor-pointer hover:bg-indigo-100/60"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                    }`}
                    title={
                      isLogistics
                        ? "Logistics is mandatory and cannot be unticked"
                        : isLocked
                        ? `Task has already been assigned for ${dept.label} (${dept.staff_name ? `Staff: ${dept.staff_name}` : "Assigned"}). It cannot be modified.`
                        : `Click to ${isChecked ? "uncheck" : "assign"} ${dept.label}`
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLocked}
                        onChange={() => {
                          if (!isLogistics) {
                            handleDepartmentToggle(dept.department_id);
                          }
                        }}
                        className={`rounded text-indigo-600 focus:ring-0 ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      />
                      <span className="capitalize">{dept.label}</span>
                    </div>
                    {isLogistics ? (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                        <Lock size={9} /> Default
                      </span>
                    ) : isLocked && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                        <Lock size={9} /> Assigned
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dynamic Dates Inputs */}
          {(isDesigningSelected || isPrintingSelected) && (
            <div className="space-y-3 pt-1">
              {isDesigningSelected && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-slate-500 font-black tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-600" />
                    <span>Design Target Date *</span>
                  </label>
                  <input
                    type="date"
                    value={designDate}
                    onChange={(e) => {
                      setDesignDate(e.target.value);
                      validateDesignDate(e.target.value);
                    }}
                    min={commitDate ? commitDate.substring(0, 10) : undefined}
                    max={completionDate ? completionDate.substring(0, 10) : undefined}
                    className={`w-full bg-white border ${
                      errorDesign ? "border-rose-300 focus:ring-rose-50" : "border-slate-200 focus:ring-indigo-50"
                    } rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500 cursor-pointer`}
                    required
                  />
                  {errorDesign && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errorDesign}</p>
                  )}
                </div>
              )}

              {isPrintingSelected && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-slate-500 font-black tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-600" />
                    <span>Printing Target Date *</span>
                  </label>
                  <input
                    type="date"
                    value={printingDate}
                    onChange={(e) => {
                      setPrintingDate(e.target.value);
                      validatePrintingDate(e.target.value);
                    }}
                    min={commitDate ? commitDate.substring(0, 10) : undefined}
                    max={completionDate ? completionDate.substring(0, 10) : undefined}
                    className={`w-full bg-white border ${
                      errorPrint ? "border-rose-300 focus:ring-rose-50" : "border-slate-200 focus:ring-indigo-50"
                    } rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500 cursor-pointer`}
                    required
                  />
                  {errorPrint && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errorPrint}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t flex justify-end gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !departments.some((d) => d.is_assigned) ||
                (isDesigningSelected && (!!errorDesign || !designDate)) ||
                (isPrintingSelected && (!!errorPrint || !printingDate))
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Routing & Dates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
