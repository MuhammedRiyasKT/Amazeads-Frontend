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

        {/* 2. Choose Staff / Department Dropdown (accordion രീതിയിൽ) */}
        <div className="relative" ref={dropdownRef} style={{ width: "230px" }}>
          <button
            type="button"
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
              {roles.map((dept) => {
                const filtered = staffs.filter((s) => s.role_name === dept.role_name);
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

        {/* 3. Roles Select Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          style={{ width: "160px" }}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.role_name}>{role.role_name}</option>
          ))}
        </select>

        {/* 4. Status Select Filter */}
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

        {/* 5. Clear button */}
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