"use client";

import React, { useEffect, useState } from "react";
import { X, Hash, Calendar, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getOrderProjectsAssignments,
  updateProjectDepartmentAssignments,
  assignOrderNumber,
  getPMOrderById
} from "../services/managerOrder.service";

interface CreateOrderIdModalProps {
  isOpen: boolean;
  orderId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderIdModal({
  isOpen,
  orderId,
  onClose,
  onSuccess,
}: CreateOrderIdModalProps) {
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDates, setOrderDates] = useState<{ commit_date?: string; completion_date?: string }>({});

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      setNewOrderNumber("");

      Promise.all([
        getOrderProjectsAssignments(orderId),
        getPMOrderById(orderId)
      ])
        .then(([assignmentsData, orderData]) => {
          console.log("PROJECTS_ASSIGNMENTS_DATA:", JSON.stringify(assignmentsData, null, 2));
          console.log("ORDER_DATA:", JSON.stringify(orderData, null, 2));

          setOrderDates({
            commit_date: orderData?.commit_date,
            completion_date: orderData?.completion_date,
          });

          const today = getTodayStr();
          const orderProjects = orderData?.projects || [];
          const projectDetailsMap = new Map<number, any>();
          orderProjects.forEach((p: any) => {
            projectDetailsMap.set(p.id, p);
          });

          console.log("ORDER_PROJECTS_IDS:", orderProjects.map((p: any) => p.id));
          console.log("ASSIGNMENT_PROJECT_IDS:", (assignmentsData || []).map((proj: any) => proj.project_id || proj.id));

          const formatted = (assignmentsData || []).map((proj: any) => {
            const projId = proj.project_id || proj.id;
            const details = projectDetailsMap.get(projId) || {};

            const designDateVal = details.design_date || proj.design_date;
            const printingDateVal = details.printing_date || proj.printing_date;
            const fallbackDate = orderData?.commit_date ? orderData.commit_date.substring(0, 10) : today;

            return {
              project_id: projId,
              product_name: proj.product_name || proj.project_name || details.project_name,
              quantity: proj.quantity || details.quantity,
              design_date: designDateVal && designDateVal !== "null" ? designDateVal.substring(0, 10) : fallbackDate,
              printing_date: printingDateVal && printingDateVal !== "null" ? printingDateVal.substring(0, 10) : fallbackDate,
              departments: (proj.departments || []).map((d: any) => ({
                department_id: d.id || d.department_id,
                name: d.name || d.department_name,
                is_assigned: Boolean(d.is_assigned),
              })),
            };
          });

          setProjectsList(formatted);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  const handleDepartmentToggle = (projectIdx: number, deptId: number) => {
    setProjectsList((prev) => {
      const updated = [...prev];
      const targetProj = { ...updated[projectIdx] };
      targetProj.departments = targetProj.departments.map((d: any) => {
        if (d.department_id === deptId) {
          return { ...d, is_assigned: !d.is_assigned };
        }
        return d;
      });
      updated[projectIdx] = targetProj;
      return updated;
    });
  };

  const handleDateChange = (projectIdx: number, field: "design_date" | "printing_date", val: string) => {
    if (orderDates.commit_date && orderDates.completion_date && val) {
      const selected = new Date(val);
      const commit = new Date(orderDates.commit_date.substring(0, 10));
      const completion = new Date(orderDates.completion_date.substring(0, 10));

      if (selected < commit || selected > completion) {
        alert(
          `${field === "design_date" ? "Design Date" : "Printing Date"} must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`
        );
      }
    }

    setProjectsList((prev) => {
      const updated = [...prev];
      updated[projectIdx] = { ...updated[projectIdx], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderNumber.trim()) {
      alert("Please enter a Production Order Number!");
      return;
    }

    if (orderDates.commit_date && orderDates.completion_date) {
      const commit = new Date(orderDates.commit_date.substring(0, 10));
      const completion = new Date(orderDates.completion_date.substring(0, 10));

      for (let i = 0; i < projectsList.length; i++) {
        const proj = projectsList[i];
        const rowNum = i + 1;

        const isDesigningChecked = proj.departments.some(
          (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
        );
        const isPrintingChecked = proj.departments.some(
          (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
        );

        if (isDesigningChecked) {
          if (!proj.design_date) {
            alert(`Please select a Design Date for item #${rowNum} (${proj.product_name || "Project"})`);
            return;
          }
          const dDate = new Date(proj.design_date);
          if (dDate < commit || dDate > completion) {
            alert(`Design Date for item #${rowNum} (${proj.product_name || "Project"}) must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`);
            return;
          }
        }

        if (isPrintingChecked) {
          if (!proj.printing_date) {
            alert(`Please select a Printing Date for item #${rowNum} (${proj.product_name || "Project"})`);
            return;
          }
          const pDate = new Date(proj.printing_date);
          if (pDate < commit || pDate > completion) {
            alert(`Printing Date for item #${rowNum} (${proj.product_name || "Project"}) must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    const today = getTodayStr();

    try {
      // 1. ഓരോ പ്രൊജക്റ്റിന്റെയും ഡിപ്പാർട്ട്മെന്റ് ചെക്ക്ബോക്സുകളും തീയതികളും പാച്ച് ചെയ്യുന്നു
      for (const proj of projectsList) {

        // Designing (1), Printing (2) ചെക്ക്ബോക്സുകൾ ടിക്ക് ചെയ്തിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു 🌟
        const isDesigningChecked = proj.departments.some(
          (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
        );
        const isPrintingChecked = proj.departments.some(
          (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
        );

        // അടിസ്ഥാന പേലോഡ്
        const payload: any = {
          departments: proj.departments.map((d: any) => ({
            department_id: d.department_id,
            status: Boolean(d.is_assigned),
          })),
        };

        // 🌟 Designing ടിക്ക് ചെയ്തിട്ടുണ്ടെങ്കിൽ മാത്രം design_date അയക്കുന്നു
        if (isDesigningChecked) {
          payload.design_date = proj.design_date && proj.design_date.trim() !== "" ? proj.design_date : today;
        }

        // 🌟 Printing ടിക്ക് ചെയ്തിട്ടുണ്ടെങ്കിൽ മാത്രം printing_date അയക്കുന്നു
        if (isPrintingChecked) {
          payload.printing_date = proj.printing_date && proj.printing_date.trim() !== "" ? proj.printing_date : today;
        }

        await updateProjectDepartmentAssignments(proj.project_id, payload);
      }

      // 2. ഫൈനൽ പ്രൊഡക്ഷൻ ഓർഡർ നമ്പർ അസൈൻ ചെയ്യുന്നു
      await assignOrderNumber(orderId, newOrderNumber.trim());

      alert("Order ID and department routing generated successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error generating Order ID and routing:", err);
      const errMsg = err?.response?.data?.detail?.[0]?.msg || "Failed to confirm order ID and department routing.";
      alert(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Hash className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Generate Order ID & Routing</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 overflow-y-auto text-xs font-semibold text-slate-600">

          {/* Order dates helper display */}
          {orderDates.commit_date && orderDates.completion_date && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-medium text-slate-500 justify-around">
              <div>
                Commit: <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1">{orderDates.commit_date.substring(0, 10)}</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div>
                Completion: <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md ml-1">{orderDates.completion_date.substring(0, 10)}</span>
              </div>
            </div>
          )}

          {/* Order ID Input Field */}
          <div className="flex flex-col gap-1.5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <label className="text-[11px] font-bold text-indigo-900 uppercase flex items-center gap-1">
              <Hash size={13} className="text-indigo-600" />
              <span>Production Order Number / ID *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ABC123, SO-98419..."
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              className="h-10 border border-slate-300 rounded-lg px-3 bg-white text-xs font-extrabold focus:outline-none focus:border-indigo-500 shadow-2xs"
              required
            />
          </div>

          {/* Department Workflow Routing Checklist */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2.5 flex items-center gap-1">
              <Layers size={13} className="text-indigo-600" />
              <span>Confirm Department Workflow Routing per Product</span>
            </h4>

            {isLoading ? (
              <div className="p-6 text-center text-slate-500 italic">Loading product items & department checklists...</div>
            ) : projectsList.length === 0 ? (
              <div className="p-4 text-center text-slate-400 italic bg-slate-50 rounded-lg">No projects mapped under this order.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {projectsList.map((proj, pIdx) => {
                  const isDesigningSelected = proj.departments.some(
                    (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
                  );
                  const isPrintingSelected = proj.departments.some(
                    (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
                  );

                  return (
                    <div key={proj.project_id || pIdx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-3">
                      {/* Product Name & Qty */}
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-extrabold text-slate-800 text-xs">
                          {pIdx + 1}. {proj.product_name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border">
                          Qty: {proj.quantity}
                        </span>
                      </div>

                      {/* Department Checkboxes */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase w-full">Target Departments:</span>
                        {proj.departments
                          .map((dept: any) => {
                            return (
                              <label
                                key={dept.department_id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${dept.is_assigned
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={dept.is_assigned}
                                  onChange={() => {
                                    handleDepartmentToggle(pIdx, dept.department_id);
                                  }}
                                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="capitalize">{dept.name}</span>
                              </label>
                            );
                          })}
                      </div>

                      {/* 🌟 ഡേറ്റുകൾ കാണിക്കുന്നത് അതാത് ചെക്ക്ബോക്സ് ടിക്ക് ചെയ്താൽ മാത്രം */}
                      {(isDesigningSelected || isPrintingSelected) && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {isDesigningSelected && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-0.5">
                                <Calendar size={10} /> Design Target Date
                              </span>
                              <input
                                type="date"
                                value={proj.design_date || getTodayStr()}
                                onChange={(e) => handleDateChange(pIdx, "design_date", e.target.value)}
                                min={orderDates.commit_date ? orderDates.commit_date.substring(0, 10) : undefined}
                                max={orderDates.completion_date ? orderDates.completion_date.substring(0, 10) : undefined}
                                className="h-8 border border-slate-200 bg-white rounded-lg px-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                              />
                            </div>
                          )}

                          {isPrintingSelected && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-0.5">
                                <Calendar size={10} /> Print Target Date
                              </span>
                              <input
                                type="date"
                                value={proj.printing_date || getTodayStr()}
                                onChange={(e) => handleDateChange(pIdx, "printing_date", e.target.value)}
                                min={orderDates.commit_date ? orderDates.commit_date.substring(0, 10) : undefined}
                                max={orderDates.completion_date ? orderDates.completion_date.substring(0, 10) : undefined}
                                className="h-8 border border-slate-200 bg-white rounded-lg px-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                              />
                            </div>
                          )}
                        </div>
                      )}


                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || isLoading || !newOrderNumber.trim()}>
              {isSubmitting ? "Generating ID..." : "Confirm Routing & Generate ID"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}