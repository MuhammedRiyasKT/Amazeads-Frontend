"use client";

import React, { useEffect, useState, useRef } from "react";
import { CalendarRange, Clock, CheckCircle2, AlertTriangle, Check, X, Eye, Users, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { LeaveRequest, LeavePagination, LeaveStatus, LeaveFilters } from "@/modules/leave/types";
import { getManagerLeaves, approveLeaveByManager, rejectLeaveByManager } from "@/modules/leave/services/leave.service";
import { getManagerStaffs, getManagerRoles, Staff, Role } from "@/modules/admin/services/staff.service"; // മാനേജർ ഇമ്പോർട്ടുകൾ
import LeaveDetailsModal from "@/modules/leave/components/LeaveDetailsModal";
import LeaveFiltersPanel from "@/modules/leave/components/LeaveFiltersPanel";

export default function ManagerLeavePage() {
  const [currentManagerId] = useState(3);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<LeavePagination>({ page: 1, page_size: 5, total_count: 0, total_pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [staffId, setStaffId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "year" | "all">("today");

  // Date States
  const [selectedDate, setSelectedDate] = useState("2026-07-24");
  const [selectedMonth, setSelectedMonth] = useState("7");
  const [selectedYear, setSelectedYear] = useState("2026");

  // Dropdown States
  const [staffList, setStaffsList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Role[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<number, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // REUSABLE UI HELPERS
  // ==========================================

  const getFinalStatusBadge = (status: LeaveStatus) => {
    let displayStatus = status;
    if (status === "Manager Approved" || status === "HR Approved" || status === "Pending") {
      displayStatus = "Pending";
    }
    const styles: Record<string, string> = {
      Pending: "bg-amber-50 text-amber-700 border-amber-100",
      Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Rejected: "bg-rose-50 text-rose-700 border-rose-100",
    };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${styles[displayStatus]}`}>{displayStatus}</span>;
  };

  const getLeaveTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      Casual: "bg-indigo-50 text-indigo-700 border-indigo-100",
      Sick: "bg-rose-50 text-rose-700 border-rose-100",
      Paid: "bg-teal-50 text-teal-700 border-teal-100",
      Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${types[type] || "bg-slate-50"}`}>{type}</span>;
  };

  const renderHRStatus = (leave: LeaveRequest) => {
    if (leave.hr_approved_by) return <span className="text-xs text-sky-600 font-bold">HR Approved</span>;
    return <span className="text-slate-400 text-xs font-medium">—</span>;
  };

  const renderManagerAndAdminStatus = (leave: LeaveRequest) => {
    if (leave.status === "Pending") {
      return <span className="text-xs text-slate-400 font-medium">Waiting for HR</span>;
    }
    if (leave.admin_approved_by) {
      if (leave.status === "Approved") {
        return (
          <div className="flex flex-col">
            <span className="text-xs text-emerald-600 font-bold">Admin Approved</span>
            {leave.admin_approved_at && (
              <span className="text-[10px] text-slate-400 mt-0.5">{new Date(leave.admin_approved_at).toLocaleDateString()}</span>
            )}
          </div>
        );
      }
      if (leave.status === "Rejected") {
        return <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border">Admin Rejected</span>;
      }
    }
    if (leave.manager_approved_by) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-indigo-600 font-bold">Manager Approved</span>
          {leave.manager_approved_at && (
            <span className="text-[10px] text-slate-400 mt-0.5">{new Date(leave.manager_approved_at).toLocaleDateString()}</span>
          )}
        </div>
      );
    }
    if (leave.status === "HR Approved") {
      return <span className="text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-0.5 rounded border border-amber-100/50 animate-pulse">Pending Review</span>;
    }
    if (leave.status === "Rejected" && leave.hr_approved_by && !leave.admin_approved_by && !leave.manager_approved_by) {
      return <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border">Manager Rejected</span>;
    }
    return <span className="text-slate-400 text-xs font-medium">—</span>;
  };

  // ==========================================
  // SIDE EFFECTS AND LIFECYCLES
  // ==========================================

  useEffect(() => {
    getManagerStaffs().then((data) => setStaffsList(data || [])).catch((err) => console.error(err));
    getManagerRoles().then((data) => setDepartments(data.filter((r) => r.role_name.toLowerCase() !== "admin"))).catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadLeaves = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: LeaveFilters = { page: pageToFetch, page_size: 5 };
      if (timeFilter === "today" && selectedDate) {
        activeFilters.day = parseInt(selectedDate.split("-")[2]);
        activeFilters.month = parseInt(selectedDate.split("-")[1]);
        activeFilters.year = parseInt(selectedDate.split("-")[0]);
      } else if (timeFilter === "week" && fromDate && toDate) {
        activeFilters.from_date = fromDate;
        activeFilters.to_date = toDate;
      } else if (timeFilter === "month" && selectedMonth && selectedYear) {
        activeFilters.month = parseInt(selectedMonth);
        activeFilters.year = parseInt(selectedYear);
      } else if (timeFilter === "year" && selectedYear) {
        activeFilters.year = parseInt(selectedYear);
      }

      if (selectedStaff) activeFilters.staff_id = selectedStaff.id;
      if (leaveType) activeFilters.leave_type = leaveType;
      if (approvalFilter === "manager_approved") activeFilters.manager_approved = true;
      if (approvalFilter === "hr_approved") activeFilters.hr_approved = true;
      if (approvalFilter === "admin_approved") activeFilters.admin_approved = true;

      const data = await getManagerLeaves(activeFilters);
      setLeaves(data.items || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadLeaves(); }, [currentPage, timeFilter, selectedDate, fromDate, toDate, selectedMonth, selectedYear, selectedStaff, leaveType, approvalFilter]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadLeaves(1);
  };

  const handleClearFilters = () => {
    setStaffId("");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setApprovalFilter("");
    setTimeFilter("all");
    setSearchQuery("");
    setSelectedMonth("7");
    setSelectedYear("2026");
    setCurrentPage(1);
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this leave request?")) return;
    try {
      await approveLeaveByManager(id, currentManagerId);
      alert("Approved successfully");
      loadLeaves();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Reject this leave request?")) return;
    try {
      await rejectLeaveByManager(id, currentManagerId);
      alert("Rejected successfully");
      loadLeaves();
    } catch (err) { console.error(err); }
  };

  const toggleDeptExpand = (deptId: number) => {
    setExpandedDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      leave.staff_name.toLowerCase().includes(query) ||
      leave.leave_type.toLowerCase().includes(query) ||
      leave.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Manager Leave Desk</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve department level requests after HR review.</p>
      </div>

      {/* Filters (അഡ്മിൻ പാനലിലേതുപോലെ ഒരേ ഡിസൈനിൽ ആക്കിയത്) */}
      <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Choose Staff dropdown */}
          <div className="relative" ref={dropdownRef} style={{ width: "260px" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-10 border border-slate-200 rounded-lg px-4 flex items-center justify-between text-xs font-semibold text-slate-700 bg-white cursor-pointer hover:bg-slate-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Users size={14} className="text-slate-500" />
                {selectedStaff ? selectedStaff.staff_name : "Choose Staff / Department"}
              </span>
              {isDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50 p-2">
                <div
                  onClick={() => { setSelectedStaff(null); setIsDropdownOpen(false); }}
                  className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer border-b mb-1 uppercase tracking-wider"
                >
                  ALL STAFF MEMBERS
                </div>
                {departments.map((dept) => {
                  const filtered = staffList.filter((s) => s.role_name === dept.role_name);
                  const isExpanded = !!expandedDepts[dept.id];
                  return (
                    <div key={dept.id} className="flex flex-col">
                      <div
                        onClick={() => toggleDeptExpand(dept.id)}
                        className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase hover:bg-slate-50 rounded-md cursor-pointer"
                      >
                        <span>{dept.role_name}</span>
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </div>
                      {isExpanded && (
                        <div className="flex flex-col pl-3">
                          {filtered.length === 0 ? (
                            <span className="px-3 py-1 text-[10px] text-slate-400 italic">No staff assigned</span>
                          ) : (
                            filtered.map((staff) => (
                              <div
                                key={staff.id}
                                onClick={() => { setSelectedStaff(staff); setIsDropdownOpen(false); }}
                                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50/60 rounded-md cursor-pointer font-medium"
                              >
                                {staff.staff_name}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Capsule Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border">
            {(["today", "week", "month", "year", "all"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${
                  timeFilter === filter ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* തീയതി ഫിൽട്ടറുകൾ */}
          {timeFilter === "today" && (
            <div className="flex items-center gap-2 border rounded-lg px-3 h-10 bg-white">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 focus:outline-none bg-transparent cursor-pointer"
              />
              <Calendar size={14} className="text-slate-500" />
            </div>
          )}

          {timeFilter === "week" && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 border rounded-lg px-3 focus:outline-none bg-white shadow-sm"
              />
              <span>to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 border rounded-lg px-3 focus:outline-none bg-white shadow-sm"
              />
            </div>
          )}

          {timeFilter === "month" && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 border rounded-lg px-3 bg-white text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="1">Jan</option>
                <option value="2">Feb</option>
                <option value="3">Mar</option>
                <option value="4">Apr</option>
                <option value="5">May</option>
                <option value="6">Jun</option>
                <option value="7">Jul</option>
                <option value="8">Aug</option>
                <option value="9">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
              </select>
              <input
                type="number"
                placeholder="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 w-20 border rounded-lg px-3 text-xs font-bold focus:outline-none bg-white shadow-sm"
              />
            </div>
          )}

          {timeFilter === "year" && (
            <input
              type="number"
              placeholder="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 w-24 border rounded-lg px-3 text-xs font-bold focus:outline-none bg-white shadow-sm"
            />
          )}

          {/* മറ്റ് കാറ്റഗറി ഫിൽട്ടറുകൾ */}
          <div className="flex gap-2">
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none"
            >
              <option value="">All Leave Types</option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none"
            >
              <option value="">All Approvals</option>
              <option value="manager_approved">Manager Approved</option>
              <option value="hr_approved">HR Approved</option>
              <option value="admin_approved">Admin Approved</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end border-t pt-3">
          <button onClick={handleClearFilters} className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-bold cursor-pointer">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        
        {/* ഇൻസ്റ്റന്റ് സെർച്ച് ബാർ */}
        <div className="p-4 border-b bg-slate-50/50">
          <input
            type="text"
            placeholder="Filter by title or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 h-10 border border-slate-200 bg-white rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "120px" }}>Staff Name</TableHead>
                <TableHead style={{ width: "120px" }}>Leave Type</TableHead>
                <TableHead style={{ width: "140px" }}>Reason</TableHead>
                <TableHead style={{ width: "130px" }}>Final Status</TableHead>
                <TableHead style={{ width: "180px" }}>HR Status</TableHead>
                <TableHead style={{ width: "240px" }}>Manager & Admin Status</TableHead>
                <TableHead style={{ width: "120px", textAlign: "center" }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6">Loading...</TableCell></TableRow>
              ) : filteredLeaves.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6">No applications found.</TableCell></TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-bold text-xs">{leave.staff_name || `Staff #${leave.staff_id}`}</TableCell>
                    <TableCell>{getLeaveTypeBadge(leave.leave_type)}</TableCell>

                    {/* Reason Column (View Details) */}
                    <TableCell>
                      <button
                        onClick={() => { setSelectedLeave(leave); setIsModalOpen(true); }}
                        className="flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer"
                      >
                        <Eye size={12} /> View Reason
                      </button>
                    </TableCell>

                    <TableCell>{getFinalStatusBadge(leave.status)}</TableCell>
                    <TableCell>{renderHRStatus(leave)}</TableCell>
                    <TableCell>{renderManagerAndAdminStatus(leave)}</TableCell>
                    <TableCell className="text-center">
                      {leave.status === "HR Approved" ? (
                        <div className="flex justify-center gap-1.5 items-center">
                          <button onClick={() => handleApprove(leave.id)} className="p-1.5 bg-green-50 text-green-600 rounded cursor-pointer border border-green-100 shadow-sm"><Check size={13} /></button>
                          <button onClick={() => handleReject(leave.id)} className="p-1.5 bg-red-50 text-red-600 rounded cursor-pointer border border-red-100 shadow-sm"><X size={13} /></button>
                        </div>
                      ) : leave.status === "Pending" ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Waiting for HR</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="flex justify-between items-center bg-white border-t px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Showing page {pagination.page} of {pagination.total_pages}</div>
            <Pagination total={pagination.total_count} limit={pagination.page_size} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <LeaveDetailsModal isOpen={isModalOpen} leave={selectedLeave} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}