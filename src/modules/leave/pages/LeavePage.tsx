"use client";

import React, { useEffect, useState } from "react";
import { CalendarRange, Clock, CheckCircle2, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { LeaveRequest, LeavePagination, CreateLeavePayload } from "../types";
import { getStaffLeaves, submitLeaveRequest } from "../services/leave.service";
import StaffLeaveList from "../components/StaffLeaveList";
import ApplyLeaveModal from "../components/ApplyLeaveModal";
import { useAuthStore } from "@/store/authStore"; // Zustand Auth Store ഇമ്പോർട്ട് ചെയ്യുന്നു

export default function LeavePage() {
  // Zustand-ൽ നിന്നും കറന്റ് ലോഗിൻ ചെയ്ത യൂസറെയും ഹൈഡ്രേഷൻ സ്റ്റാറ്റസിനെയും എടുക്കുന്നു
  const { user, _hasHydrated } = useAuthStore();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<LeavePagination>({
    page: 1,
    page_size: 5,
    total_count: 0,
    total_pages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchLeaves = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getStaffLeaves(
        user.role_name,
        user.id,
        currentPage,
        5
      );
      setLeaves(data.items || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load staff leave history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (_hasHydrated && user) {
      fetchLeaves();
    }
  }, [currentPage, user, _hasHydrated]);

  const handleSubmitLeave = async (payload: CreateLeavePayload) => {
    if (!user) return;
    try {
      await submitLeaveRequest(user.role_name, user.id, payload);
      setIsApplyModalOpen(false);
      setCurrentPage(1);
      fetchLeaves();
    } catch (err) {
      console.error("Failed to submit leave:", err);
      alert("Leave submission failed. Please try again.");
    }
  };

  // ഹൈഡ്രേഷൻ പൂർത്തിയാകുന്നത് വരെയോ യൂസർ ഇല്ലെങ്കിലോ ലോഡിങ് കാണിക്കുന്നു (Next.js Hydration Error തടയാൻ)
  if (!_hasHydrated || !user) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading Leave Panel...
      </div>
    );
  }

  // KPI കണക്കുകൾ
  const totalApplied = pagination.total_count;
  const pendingCount = leaves.filter((l) => l.status === "Pending" || l.status === "Manager Approved" || l.status === "HR Approved").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply and monitor your leave requests for {user.role_name} department.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} /> New Leave Application
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <CalendarRange size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Leaves</span>
            <strong className="text-xl font-bold text-slate-800">{totalApplied}</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Applications</span>
            <strong className="text-xl font-bold text-slate-800">{pendingCount}</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Approved Applications</span>
            <strong className="text-xl font-bold text-slate-800">{approvedCount}</strong>
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="flex flex-col gap-4">
        <StaffLeaveList leaves={leaves} isLoading={isLoading} />

        {pagination.total_pages > 1 && (
          <div className="flex justify-between items-center bg-white border-t rounded-xl px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">
              Showing page {pagination.page} of {pagination.total_pages}
            </div>
            <Pagination
              total={pagination.total_count}
              limit={pagination.page_size}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleSubmitLeave}
      />
    </div>
  );
}