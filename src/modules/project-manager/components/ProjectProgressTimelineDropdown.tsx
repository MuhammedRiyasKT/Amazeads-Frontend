"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, Clock, User } from "lucide-react";
import { getPMProjectStatusTimeline } from "../services/managerOrder.service";

interface ProjectProgressTimelineDropdownProps {
  projectId: number;
  onClose: () => void;
  position?: "top" | "bottom";
  role?: string;
}

export default function ProjectProgressTimelineDropdown({
  projectId,
  onClose,
  position = "bottom",
  role,
}: ProjectProgressTimelineDropdownProps) {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      getPMProjectStatusTimeline(projectId, role as any)
        .then(setTimelineData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [projectId, role]);

  // Calculate coordinates relative to viewport
  useEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 560;
      const dropdownHeight = 220;

      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - dropdownWidth - 16);
      }

      let top = position === "top" ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
      if (top + dropdownHeight > window.innerHeight - 16) {
        top = Math.max(16, rect.top - dropdownHeight - 6);
      }

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [position, timelineData]);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const activeDepartments = (timelineData?.departments || []).filter(
    (dept: any) => dept.is_assigned === true
  );

  const formatShortTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const mins = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${mins}`;
    } catch (e) {
      return dateStr;
    }
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-[560px] max-w-[calc(100vw-32px)] z-[9999] text-left animate-in fade-in slide-in-from-top-2"
      onClick={(e) => e.stopPropagation()}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        cursor: "default",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
            PRODUCTION STAGE TIMELINE
          </span>
          <h4 className="text-xs font-bold text-slate-700 mt-0.5">
            Project Timeline <strong className="text-indigo-600 font-extrabold">#{projectId}</strong>
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          title="Close Timeline"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-500 font-semibold">
          Loading timeline...
        </div>
      ) : !timelineData ? (
        <div className="py-6 text-center text-xs text-red-500 font-semibold">
          Failed to load timeline.
        </div>
      ) : activeDepartments.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          No assigned departments for this product.
        </div>
      ) : (
        <div className="flex items-start justify-between w-full relative px-1 py-1 gap-1 overflow-x-auto">
          {activeDepartments.map((dept: any, idx: number) => {
            const isLast = idx === activeDepartments.length - 1;
            const isFinalTrue = dept.final_status === true;
            const isInProgress = dept.status === "In Progress";
            const isDesigning = dept.department_name === "designing";
            const isDesigningApprovalPending =
              isDesigning &&
              (dept.status === "Completed" || dept.completed_on) &&
              !dept.customer_design_approval;

            const assignedOn = formatShortTime(dept.assigned_on);
            const completedOn = formatShortTime(dept.completed_on);

            return (
              <React.Fragment key={dept.department_id || idx}>
                {/* Step Column */}
                <div className="flex flex-col items-center text-center flex-1 relative z-10 min-w-[90px]">
                  {/* Circle Node */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 ${
                      isFinalTrue
                        ? "bg-emerald-500 text-white"
                        : isInProgress || isDesigningApprovalPending
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isFinalTrue ? (
                      <Check size={15} strokeWidth={3} />
                    ) : isInProgress || isDesigningApprovalPending ? (
                      <Clock size={14} />
                    ) : (
                      <X size={14} />
                    )}
                  </div>

                  {/* Department Name */}
                  <h5 className="font-extrabold text-slate-800 text-[10px] mt-1.5 capitalize leading-tight">
                    {dept.department_name}
                  </h5>

                  {/* Sub Department Name (Production & Printing) */}
                  {(dept.department_name === "production" || dept.department_name === "printing") &&
                    dept.sub_department_name && (
                      <span className="text-[8.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-0.5 capitalize leading-tight text-center">
                        {dept.sub_department_name}
                      </span>
                    )}

                  {/* Staff Name */}
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <User size={9} className="text-slate-400 shrink-0" />
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        dept.staff_name ? "text-slate-700" : "text-slate-400 italic"
                      }`}
                    >
                      {dept.staff_name || "Not Assigned"}
                    </span>
                  </div>

                  {/* Assigned On */}
                  {assignedOn && (
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 leading-tight">
                      Assigned: <strong className="text-slate-600">{assignedOn}</strong>
                    </span>
                  )}

                  {/* Completed On */}
                  {completedOn && (
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 leading-tight">
                      Done: <strong className="text-slate-600">{completedOn}</strong>
                    </span>
                  )}

                  {/* Customer Design Approval */}
                  {isDesigning && (dept.status === "Completed" || dept.completed_on) && (
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

                  {/* Completed badge */}
                  {!isDesigning && isFinalTrue && (
                    <div className="mt-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-600">
                        <Check size={9} strokeWidth={3} /> Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`w-5 h-[2px] mt-[18px] shrink-0 transition-all ${
                      isFinalTrue ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <span ref={anchorRef} className="inline-block w-0 h-0 pointer-events-none" />
      {mounted ? createPortal(dropdownContent, document.body) : null}
    </>
  );
}
