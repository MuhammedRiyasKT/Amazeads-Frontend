"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Users, ChevronDown, ChevronUp } from "lucide-react";
import Input from "@/components/ui/Input";
import { Staff, Role } from "../services/staff.service";
import styles from "./StaffComponents.module.css";

interface StaffFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  staffs: Staff[];
  roles: Role[];
  selectedStaff: Staff | null;
  setSelectedStaff: (staff: Staff | null) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export default function StaffFilters({
  searchQuery,
  setSearchQuery,
  staffs,
  roles,
  selectedStaff,
  setSelectedStaff,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
}: StaffFiltersProps) {
  // ഡ്രോപ്പ്ഡൗൺ സ്റ്റേറ്റുകൾ
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<number, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ഔട്ട്‌സൈഡ് ക്ലിക്ക് ഹാൻഡ്ലർ (ഡ്രോപ്പ്ഡൗൺ ക്ലോസ് ചെയ്യാൻ)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDeptExpand = (deptId: number) => {
    setExpandedDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  return (
    <div className={styles.filtersBox}>
      <div className={styles.filterControls} style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
        
        {/* 1. ഇൻസ്റ്റന്റ് സെർച്ച് ബാർ */}
        <div className={styles.searchWrapper} style={{ flex: 1, minWidth: "200px" }}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 2. Unified Choose Staff / Department Dropdown */}
        <div className="relative" ref={dropdownRef} style={{ width: "260px" }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-10 border border-slate-200 rounded-lg px-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 bg-white cursor-pointer hover:bg-slate-50 transition-all shadow-2xs"
          >
            <span className="flex items-center gap-2 truncate">
              <Users size={14} className="text-slate-500 shrink-0" />
              <span className="truncate">
                {selectedStaff
                  ? `${selectedStaff.staff_name} (${selectedStaff.role_name})`
                  : selectedRole
                  ? `Dept: ${selectedRole}`
                  : "Choose Staff / Department"}
              </span>
            </span>
            {isDropdownOpen ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto z-50 p-2 text-xs">
              <div
                onClick={() => {
                  setSelectedStaff(null);
                  setSelectedRole("");
                  setIsDropdownOpen(false);
                }}
                className={`px-3 py-2 font-bold rounded-lg cursor-pointer border-b mb-1 uppercase tracking-wider transition-colors ${
                  !selectedStaff && !selectedRole
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-indigo-600 hover:bg-slate-50"
                }`}
              >
                ALL STAFF & DEPARTMENTS
              </div>

              {roles
                .filter((dept) => !["admin", "operator"].includes(dept.role_name.trim().toLowerCase()))
                .map((dept) => {
                const filtered = staffs.filter((s) => s.role_name === dept.role_name);
                const isExpanded = !!expandedDepts[dept.id];
                const isRoleSelected = !selectedStaff && selectedRole.toLowerCase() === dept.role_name.toLowerCase();

                return (
                  <div key={dept.id} className="flex flex-col mb-1">
                    {/* Department Row */}
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                        isRoleSelected ? "bg-indigo-100 text-indigo-900 font-bold" : "hover:bg-slate-100 text-slate-700 font-semibold"
                      }`}
                    >
                      <span
                        onClick={() => {
                          setSelectedRole(dept.role_name);
                          setSelectedStaff(null);
                          setIsDropdownOpen(false);
                        }}
                        className="flex-1 uppercase text-[11px] tracking-wide flex items-center gap-1.5"
                        title={`Filter all staff in ${dept.role_name}`}
                      >
                        <span className="font-bold">{dept.role_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({filtered.length})</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDeptExpand(dept.id);
                        }}
                        className="p-1 hover:bg-slate-200/80 rounded text-slate-500 cursor-pointer"
                        title={isExpanded ? "Collapse staff list" : "Expand staff list"}
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {/* Expanded Staff List */}
                    {isExpanded && (
                      <div className="flex flex-col pl-3 mt-0.5 border-l-2 border-indigo-100 ml-2 space-y-0.5">
                        {filtered.length === 0 ? (
                          <span className="px-3 py-1 text-[10px] text-slate-400 italic">No staff assigned</span>
                        ) : (
                          filtered.map((staff) => {
                            const isStaffSelected = selectedStaff?.id === staff.id;
                            return (
                              <div
                                key={staff.id}
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setSelectedRole("");
                                  setIsDropdownOpen(false);
                                }}
                                className={`px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors flex items-center justify-between ${
                                  isStaffSelected
                                    ? "bg-indigo-600 text-white font-bold"
                                    : "text-slate-700 hover:bg-indigo-50 font-medium"
                                }`}
                              >
                                <span>{staff.staff_name}</span>
                                <span className={`text-[10px] ${isStaffSelected ? "text-indigo-100" : "text-slate-400"}`}>
                                  {staff.account_status ? "Active" : "Inactive"}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Status Select Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          style={{ width: "140px" }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* 4. Clear button */}
        {(selectedStaff || selectedRole || selectedStatus || searchQuery) && (
          <button
            onClick={() => {
              setSelectedStaff(null);
              setSelectedRole("");
              setSelectedStatus("");
              setSearchQuery("");
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-3 py-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}