"use client";

import React, { useEffect, useState } from "react";
import { X, Check, Clock } from "lucide-react";
import { getPMProjectStatusTimeline } from "../services/managerOrder.service";

interface ProjectProgressTimelineModalProps {
  isOpen: boolean;
  projectId: number | null;
  onClose: () => void;
}

export default function ProjectProgressTimelineModal({
  isOpen,
  projectId,
  onClose,
}: ProjectProgressTimelineModalProps) {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      setIsLoading(true);
      getPMProjectStatusTimeline(projectId)
        .then(setTimelineData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, projectId]);

  if (!isOpen || !projectId) return null;

  // 🌟 is_assigned: true ആയ ഡിപ്പാർട്ട്മെന്റുകളെ മാത്രം കാണിക്കുന്നു
  const activeDepartments = (timelineData?.departments || []).filter(
    (dept: any) => dept.is_assigned === true
  );

  // സമയം MM-DD HH:mm ഫോർമാറ്റിലേക്ക് മാറ്റുന്നു
  const formatShortTime = (dateStr: string) => {
    if (!dateStr) return "--:--";
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

  return (
    /* 🌟 items-center മാറ്റി items-start pt-28 നൽകിയതുകൊണ്ട്, ക്ലിക്ക് ചെയ്ത പ്രൊഡക്റ്റുകൾ വ്യക്തമായി പിന്നിൽ കാണാൻ സാധിക്കും */
    <div 
      className="fixed inset-0 bg-slate-900/10 flex justify-center items-start pt-28 px-4 z-[2500] animate-fade-in"
      onClick={onClose}
    >
      {/* 🌟 Floating Popover Card (Matching Image Screenshot 100%) */}
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 w-full max-w-lg relative animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // കാർഡിനുള്ളിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ ക്ലോസ് ആവാതിരിക്കാൻ
      >
        
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              PRODUCTION STAGE
            </span>
            <h4 className="text-xs font-bold text-slate-700 mt-0.5">
              Project Timeline <strong className="text-indigo-600 font-extrabold">#{projectId}</strong>
            </h4>
          </div>

          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-semibold">Loading timeline...</div>
        ) : !timelineData ? (
          <div className="py-8 text-center text-xs text-red-500 font-semibold">Failed to load timeline.</div>
        ) : activeDepartments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">No assigned departments for this product.</div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* 🌟 Horizontal Stepper Line (Image Match) */}
            <div className="flex items-start justify-between w-full relative px-2 py-2">
              {activeDepartments.map((dept: any, idx: number) => {
                const isLast = idx === activeDepartments.length - 1;
                const isFinalTrue = dept.final_status === true;
                const isDesigningApprovalPending = dept.department_name === "designing" && (dept.status === "Completed" || dept.completed_on) && !dept.customer_design_approval;

                return (
                  <React.Fragment key={dept.department_id || idx}>
                    
                    {/* Step Circle & Label */}
                    <div className="flex flex-col items-center text-center w-24 relative z-10">
                      
                      {/* Green Circle Node Icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                        isFinalTrue 
                          ? "bg-emerald-500 text-white" 
                          : (dept.status === "In Progress" || isDesigningApprovalPending)
                          ? "bg-amber-600 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}>
                        {isFinalTrue ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (dept.status === "In Progress" || isDesigningApprovalPending) ? (
                          <Clock size={16} />
                        ) : (
                          <X size={16} />
                        )}
                      </div>

                      {/* Department Name */}
                      <h5 className="font-extrabold text-slate-800 text-[11px] mt-2 capitalize">
                        {dept.department_name}
                      </h5>

                      {/* Staff Name */}
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Staff: <strong className="text-slate-600 font-bold">{dept.staff_name && dept.staff_name !== "Nil" ? dept.staff_name : "Not Assigned"}</strong>
                      </span>

                      {/* Assigned Time */}
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        Assigned: {formatShortTime(dept.assigned_on)}
                      </span>

                      {/* Done Time */}
                      <span className="text-[9px] text-slate-400">
                        Done: {formatShortTime(dept.completed_on)}
                      </span>

                      {/* Bottom Tag Status */}
                      <div className="mt-1">
                        {dept.department_name === "designing" && dept.customer_design_approval === true ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                            <Check size={10} strokeWidth={3} /> Customer Approved
                          </span>
                        ) : isDesigningApprovalPending ? (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
                            <Clock size={10} /> Approval Pending
                          </span>
                        ) : isFinalTrue ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                            <Check size={10} strokeWidth={3} /> Completed
                          </span>
                        ) : dept.status === "In Progress" ? (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
                            <Clock size={10} /> In Progress
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            Pending
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Connecting Line */}
                    {!isLast && (
                      <div className={`flex-1 h-[2px] mt-4.5 mx-1 transition-all ${
                        isFinalTrue ? "bg-emerald-400" : "bg-slate-200"
                      }`} />
                    )}

                  </React.Fragment>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}