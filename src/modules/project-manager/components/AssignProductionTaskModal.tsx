"use client";

import React, { useEffect, useState } from "react";
import { X, Cog, CalendarClock } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getPMSubDepartments,
  assignProductionTask,
  getPMProjectById,
  getPMOrderById,
} from "../services/managerOrder.service";

interface AssignProductionTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  commitDate?: string | null;
  completionDate?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignProductionTaskModal({
  isOpen,
  orderId,
  projectId,
  commitDate,
  completionDate,
  onClose,
  onSuccess,
}: AssignProductionTaskModalProps) {
  const [subDepartments, setSubDepartments] = useState<any[]>([]);

  // Form States
  const [subDepartmentId, setSubDepartmentId] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [completionDateStr, setCompletionDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolved Date Boundaries
  const [effectiveCommitDate, setEffectiveCommitDate] = useState<string | null>(commitDate || null);
  const [effectiveCompletionDate, setEffectiveCompletionDate] = useState<string | null>(
    completionDate || null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getPMSubDepartments(3).then(setSubDepartments).catch(console.error); // 3 = Production Department ID
      setSubDepartmentId(0);
      setDescription("Nil");
      setValidationError(null);

      const initialCommit = commitDate || null;
      const initialCompletion = completionDate || null;

      setEffectiveCommitDate(initialCommit);
      setEffectiveCompletionDate(initialCompletion);

      // Default date to completionDate or today
      if (initialCompletion) {
        setCompletionDateStr(initialCompletion.substring(0, 10));
      } else {
        setCompletionDateStr(new Date().toISOString().substring(0, 10));
      }

      // If dates not provided in props, fetch from API
      if ((!initialCommit || !initialCompletion) && (projectId || orderId)) {
        const fetchDates = async () => {
          try {
            if (projectId) {
              const pData = await getPMProjectById(projectId);
              if (pData) {
                const cDate = pData.commit_date || pData.order?.commit_date || null;
                const compDate = pData.completion_date || pData.order?.completion_date || null;
                if (cDate && !initialCommit) setEffectiveCommitDate(cDate);
                if (compDate && !initialCompletion) {
                  setEffectiveCompletionDate(compDate);
                  setCompletionDateStr(compDate.substring(0, 10));
                }
              }
            } else if (orderId) {
              const oData = await getPMOrderById(orderId);
              if (oData) {
                const cDate = oData.commit_date || null;
                const compDate = oData.completion_date || null;
                if (cDate && !initialCommit) setEffectiveCommitDate(cDate);
                if (compDate && !initialCompletion) {
                  setEffectiveCompletionDate(compDate);
                  setCompletionDateStr(compDate.substring(0, 10));
                }
              }
            }
          } catch (err) {
            console.error("Error fetching project dates:", err);
          }
        };
        fetchDates();
      }
    }
  }, [isOpen, projectId, orderId, commitDate, completionDate]);

  if (!isOpen) return null;

  const validateCompletionTime = (): boolean => {
    if (!completionDateStr) {
      setValidationError("Completion Deadline is required");
      return false;
    }

    const selectedDate = new Date(completionDateStr);
    selectedDate.setHours(0, 0, 0, 0);

    if (effectiveCommitDate) {
      const commitObj = new Date(effectiveCommitDate.substring(0, 10));
      commitObj.setHours(0, 0, 0, 0);
      if (selectedDate < commitObj) {
        const formattedCommit = effectiveCommitDate.substring(0, 10);
        setValidationError(
          `Completion Time cannot be earlier than Commit Date (${formattedCommit})!`
        );
        return false;
      }
    }

    if (effectiveCompletionDate) {
      const completionObj = new Date(effectiveCompletionDate.substring(0, 10));
      completionObj.setHours(0, 0, 0, 0);
      if (selectedDate > completionObj) {
        const formattedCompletion = effectiveCompletionDate.substring(0, 10);
        setValidationError(
          `Completion Time cannot be later than Completion Date (${formattedCompletion})!`
        );
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !projectId || !subDepartmentId) {
      alert("Please select production unit!");
      return;
    }

    if (!validateCompletionTime()) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      order_id: orderId,
      project_id: projectId,
      department_id: 3, // Production Dept ID
      sub_department_id: subDepartmentId,
      task_description: description,
      completion_time: new Date(completionDateStr).toISOString(),
      status: "Assigned",
    };

    try {
      await assignProductionTask(payload);
      alert("Production Task assigned successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to assign production task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDateStr = effectiveCommitDate ? effectiveCommitDate.substring(0, 10) : undefined;
  const maxDateStr = effectiveCompletionDate ? effectiveCompletionDate.substring(0, 10) : undefined;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Cog className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Assign Production Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
          {/* Allowed Date Range Badge */}
          {(effectiveCommitDate || effectiveCompletionDate) && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-[11px] text-indigo-900 font-bold">
              <CalendarClock size={15} className="text-indigo-600 shrink-0" />
              <div>
                <span>Allowed Deadline Range: </span>
                <span className="text-indigo-700">
                  {effectiveCommitDate ? effectiveCommitDate.substring(0, 10) : "Start"} to{" "}
                  {effectiveCompletionDate ? effectiveCompletionDate.substring(0, 10) : "End"}
                </span>
              </div>
            </div>
          )}

          {/* 1. Production Sub-Department Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Production Unit *</label>
            <select
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(parseInt(e.target.value))}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
              required
            >
              <option value={0}>Choose Unit (Photo Framing / Laser Cutting...)</option>
              {subDepartments.map((sd) => (
                <option key={sd.id} value={sd.id}>
                  {sd.sub_department_name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Completion Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Completion Deadline *</label>
            <input
              type="date"
              value={completionDateStr}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => {
                setCompletionDateStr(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className={`h-10 border rounded-lg px-3 text-xs focus:outline-none bg-white font-bold ${
                validationError ? "border-rose-400" : "border-slate-200"
              }`}
              required
            />
            {validationError && (
              <p className="text-xs text-rose-500 font-bold mt-0.5">{validationError}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Task Description / Instructions</label>
            <textarea
              placeholder="Provide production assembly notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 text-xs focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !subDepartmentId}>
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}