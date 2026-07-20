"use client";

import React, { useEffect, useState, useRef } from "react";
import { SlidersHorizontal, Search, ChevronDown, User } from "lucide-react";
import { getStaffs, Staff, getRoles, Role } from "../services/staff.service";
import Input from "@/components/ui/Input";
import styles from "./AdminComponents.module.css";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: "all" | "day" | "range" | "month" | "year" | "staff";
  setFilterType: (type: any) => void;
  workDate: string;
  setWorkDate: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  selectedStaffId: string;
  setSelectedStaffId: (val: string) => void;
}

export default function TaskFilters({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  workDate,
  setWorkDate,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedStaffId,
  setSelectedStaffId,
}: TaskFiltersProps) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // കസ്റ്റം ഡ്രോപ്പ്ഡൗൺ സ്റ്റേറ്റുകൾ
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => {
    getStaffs()
      .then((data) => setStaffs(data.filter((s) => s.role_name.toLowerCase() !== "admin")))
      .catch((err) => console.error(err));

    // വെളിയിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ ഡ്രോപ്പ്ഡൗൺ തനിയെ ക്ലോസ് ആകാനുള്ള ലിസണർ
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setExpandedDept(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
    { label: "Jan", val: "1" }, { label: "Feb", val: "2" }, { label: "Mar", val: "3" },
    { label: "Apr", val: "4" }, { label: "May", val: "5" }, { label: "Jun", val: "6" },
    { label: "Jul", val: "7" }, { label: "Aug", val: "8" }, { label: "Sep", val: "9" },
    { label: "Oct", val: "10" }, { label: "Nov", val: "11" }, { label: "Dec", val: "12" },
  ];

  // സ്റ്റാഫ് ലിസ്റ്റിനെ ഡിപ്പാർട്ട്മെന്റ് (Role) തിരിച്ച് ഗ്രൂപ്പ് ചെയ്യാനുള്ള റിയാക്റ്റ് ലോജിക്
  const groupedStaffs = staffs.reduce((acc, staff) => {
    const department = staff.role_name || "Others";
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(staff);
    return acc;
  }, {} as Record<string, Staff[]>);

  const dateTabs = [
    { label: "Today", val: "day" as const },
    { label: "Week", val: "range" as const },
    { label: "Month", val: "month" as const },
    { label: "Year", val: "year" as const },
    { label: "All", val: "all" as const }
  ];

  // സെലക്ട് ചെയ്യപ്പെട്ട ജീവനക്കാരന്റെ പേര് കണ്ടുപിടിക്കുന്നു (ബട്ടണിൽ കാണിക്കാൻ)
  const selectedStaff = staffs.find((s) => s.id.toString() === selectedStaffId);
  const triggerLabel = selectedStaff ? selectedStaff.staff_name : "Choose Staff / Department";

  const handleDeptToggle = (dept: string) => {
    setExpandedDept(expandedDept === dept ? null : dept); // ഒരെണ്ണം തുറക്കുമ്പോൾ മറ്റൊന്ന് തനിയെ അടയും
  };

  const handleStaffSelect = (id: string) => {
    setSelectedStaffId(id);
    setIsMenuOpen(false); // സെലക്ട് ചെയ്തു കഴിഞ്ഞാൽ ഡ്രോപ്പ്ഡൗൺ ക്ലോസ് ചെയ്യും
    setExpandedDept(null);
  };

  return (
    <div className={styles.filtersBox}>
      {/* 1. ഇടതുവശത്തുള്ള പ്രധാന സെർച്ച് ബാർ */}
      <div className={styles.searchWrapper} style={{ maxWidth: "260px" }}>
        <Search size={16} className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Filter by title or staff..."
          className={styles.customInputOverride}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 2. വലതുവശത്തുള്ള ഫിൽട്ടർ കൺട്രോളുകൾ */}
      <div className="flex items-center gap-4 justify-end flex-wrap">
        
        {/* കൺസോളിഡേറ്റഡ് അക്കോർഡിയൻ ഡ്രോപ്പ്ഡൗൺ (നിങ്ങൾ ആവശ്യപ്പെട്ടത്) */}
        <div className={styles.customDropdownWrapper} ref={dropdownRef}>
          <button 
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={styles.customDropdownTrigger}
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-slate-500" />
              {triggerLabel}
            </span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {isMenuOpen && (
            <div className={styles.customDropdownMenu}>
              {/* All Option */}
              <div 
                className={styles.deptHeaderRow} 
                onClick={() => handleStaffSelect("")}
                style={{ color: "#334155" }}
              >
                <span>ALL STAFF MEMBERS</span>
              </div>

              {/* ഡിപ്പാർട്ട്മെന്റുകളുടെ അക്കോർഡിയൻ ലിസ്റ്റ് */}
              {Object.keys(groupedStaffs).map((dept) => {
                const isExpanded = expandedDept === dept;
                return (
                  <div key={dept}>
                    <div className={styles.deptHeaderRow} onClick={() => handleDeptToggle(dept)}>
                      <span>{dept.toUpperCase()}</span>
                      <ChevronDown 
                        size={12} 
                        style={{ 
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0)", 
                          transition: "transform 0.15s ease" 
                        }} 
                      />
                    </div>
                    {isExpanded && (
                      <div className={styles.staffListSub}>
                        {groupedStaffs[dept].map((staff) => (
                          <div
                            key={staff.id}
                            className={styles.staffSubItem}
                            onClick={() => handleStaffSelect(staff.id.toString())}
                          >
                            {staff.staff_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* തീയതി ഫിൽട്ടർ പില്ലുകൾ */}
        <div className={styles.tabsRow} style={{ padding: "3px", borderRadius: "8px", gap: "4px" }}>
          {dateTabs.map((tab) => (
            <button
              key={tab.val}
              type="button"
              className={`${styles.tab} ${filterType === tab.val ? styles.tabActive : ""}`}
              onClick={() => setFilterType(tab.val)}
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* കണ്ടീഷണൽ തീയതി ഇൻപുട്ടുകൾ */}
        <div className="flex items-center gap-2">
          {filterType === "day" && (
            <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem" }} />
          )}

          {filterType === "range" && (
            <div className="flex items-center gap-1.5">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "110px" }} />
              <span className="text-[10px] font-bold text-slate-400">to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "110px" }} />
            </div>
          )}

          {filterType === "month" && (
            <div className="flex items-center gap-1.5">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={styles.filterSelect} style={{ height: "34px", padding: "0 8px", fontSize: "0.78rem" }}>
                <option value="">Month</option>
                {months.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <input type="number" placeholder="Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "70px" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}