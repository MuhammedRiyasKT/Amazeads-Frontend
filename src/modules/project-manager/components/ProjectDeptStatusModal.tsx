"use client";

import React, { useEffect, useState } from "react";
import { X, Check, Clock, User, Plus, ClipboardList } from "lucide-react";
import { getPMProjectStatusTimeline } from "../services/managerOrder.service";
import AssignMultiDeptTaskModal from "./AssignMultiDeptTaskModal";

interface ProjectDeptStatusModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  projectName?: string;
  orderNumber?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectDeptStatusModal({
  isOpen,
  orderId,
  projectId,
  projectName,
  orderNumber,
  onClose,
  onSuccess,
}: ProjectDeptStatusModalProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Nested assign modal state
  const [assignDeptId, setAssignDeptId] = useState<number | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const formatShortTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const mins = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      setIsLoading(true);
      getPMProjectStatusTimeline(projectId)
        .then((data) => setDepartments(data?.departments || []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, projectId]);

  if (!isOpen || !projectId) return null;

  // Only show departments that were enabled (is_assigned: true)
  const activeDepts = departments.filter((d) => d.is_assigned === true);

  const getNodeStyle = (dept: any) => {
    if (dept.final_status === true) return "bg-emerald-500 text-white";
    if (dept.status === "In Progress") return "bg-amber-500 text-white";
    if (dept.task_assigned === false) return "bg-slate-200 text-slate-400";
    return "bg-slate-300 text-slate-500";
  };

  const isDesigning = (d: any) => d.department_name === "designing";

  return (
    <>
      {/* Status Modal */}
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2400] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-indigo-600" size={18} />
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase leading-tight">
                  Department Assignment Status
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Order <strong className="text-indigo-700">#{orderNumber || orderId}</strong>
                  {projectName && <> — <span className="text-slate-700">{projectName}</span></>}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-slate-500 font-semibold">
                Loading department statuses...
              </div>
            ) : activeDepts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 italic">
                No departments have been enabled for this project.
              </div>
            ) : (
              <div className="flex items-start justify-around gap-2 w-full">
                {activeDepts.map((dept, idx) => {
                  const isLast = idx === activeDepts.length - 1;
                  const isFinal = dept.final_status === true;
                  const isUnassigned = dept.task_assigned === false;
                  const isInProgress = dept.status === "In Progress";
                  const assignedOn = formatShortTime(dept.assigned_on);
                  const completedOn = formatShortTime(dept.completed_on);

                  return (
                    <React.Fragment key={dept.department_id}>
                      {/* Department Card */}
                      <div className="flex flex-col items-center text-center flex-1 min-w-0">

                        {/* Circle Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${getNodeStyle(dept)}`}>
                          {isFinal ? (
                            <Check size={16} strokeWidth={3} />
                          ) : isInProgress ? (
                            <Clock size={15} />
                          ) : (
                            <X size={15} />
                          )}
                        </div>

                        {/* Dept Name */}
                        <h5 className="font-extrabold text-slate-800 text-[11px] mt-2 capitalize">
                          {dept.department_name}
                        </h5>

                        {/* Staff */}
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                          <User size={9} className="text-slate-400 shrink-0" />
                          <span className={`text-[10px] font-bold ${dept.staff_name ? "text-slate-700" : "text-slate-400 italic"}`}>
                            {dept.staff_name || "Not Assigned"}
                          </span>
                        </div>

                        {/* Assigned On */}
                        {assignedOn && (
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            Assigned: <strong className="text-slate-600">{assignedOn}</strong>
                          </span>
                        )}

                        {/* Completed On */}
                        {completedOn && (
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            Done: <strong className="text-slate-600">{completedOn}</strong>
                          </span>
                        )}

                        {/* Customer Design Approval — designing only */}
                        {isDesigning(dept) && (dept.status === "Completed" || dept.completed_on) && (
                          <div className="mt-1.5">
                            {dept.customer_design_approval === true ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-600">
                                <Check size={9} strokeWidth={3} /> Customer Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600">
                                <Clock size={9} /> Approval Pending
                              </span>
                            )}
                          </div>
                        )}

                        {/* Completed badge — non-designing */}
                        {!isDesigning(dept) && isFinal && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-600">
                              <Check size={9} strokeWidth={3} /> Completed
                            </span>
                          </div>
                        )}

                        {/* Assign Task Button — only for unassigned depts */}
                        {isUnassigned && (
                          <button
                            onClick={() => {
                              setAssignDeptId(dept.department_id);
                              setIsAssignOpen(true);
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-sm"
                          >
                            <Plus size={10} /> Assign Task
                          </button>
                        )}
                      </div>

                      {/* Connector */}
                      {!isLast && (
                        <div className={`w-6 h-[2px] mt-5 shrink-0 ${isFinal ? "bg-emerald-400" : "bg-slate-200"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-slate-50/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nested Assign Task Modal — opens on top */}
      <AssignMultiDeptTaskModal
        isOpen={isAssignOpen}
        orderId={orderId}
        projectId={projectId}
        defaultDepartmentId={assignDeptId}
        onClose={() => {
          setIsAssignOpen(false);
          setAssignDeptId(null);
        }}
        onSuccess={() => {
          setIsAssignOpen(false);
          setAssignDeptId(null);
          // Refresh dept statuses
          if (projectId) {
            setIsLoading(true);
            getPMProjectStatusTimeline(projectId)
              .then((data) => setDepartments(data?.departments || []))
              .catch(console.error)
              .finally(() => setIsLoading(false));
          }
          onSuccess();
        }}
      />
    </>
  );
}
