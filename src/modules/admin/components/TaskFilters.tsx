"use client";

import React, { useEffect, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { getStaffs, Staff, getRoles, Role } from "../services/staff.service";
import Input from "@/components/ui/Input";
import styles from "./TaskComponents.module.css";

interface TaskFiltersProps {
   searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: "all" | "day" | "range" | "month" | "year" | "staff"; // "all" കൂടി ചേർത്തു
  setFilterType: (type: "all" | "day" | "range" | "month" | "year" | "staff") => void;
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
  const [departments, setDepartments] = useState<Role[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  
  // സ്റ്റാഫ് സെലക്ഷന് വേണ്ടി ആദ്യം തിരഞ്ഞെടുക്കേണ്ട ഡിപ്പാർട്ട്മെന്റ് സ്റ്റേറ്റ്
  const [filterDept, setFilterDept] = useState("");

  useEffect(() => {
    // റോളുകളും സ്റ്റാഫും ബാക്ക്-എൻഡിൽ നിന്നും ഫെച്ച് ചെയ്യുന്നു
    getRoles()
      .then((data) => setDepartments(data.filter((r) => r.role_name.toLowerCase() !== "admin")))
      .catch((err) => console.error(err));

    getStaffs()
      .then((data) => setStaffs(data.filter((s) => s.role_name.toLowerCase() !== "admin")))
      .catch((err) => console.error(err));
  }, []);

  const months = [
    { label: "January", val: "1" },
    { label: "February", val: "2" },
    { label: "March", val: "3" },
    { label: "April", val: "4" },
    { label: "May", val: "5" },
    { label: "June", val: "6" },
    { label: "July", val: "7" },
    { label: "August", val: "8" },
    { label: "September", val: "9" },
    { label: "October", val: "10" },
    { label: "November", val: "11" },
    { label: "December", val: "12" },
  ];

  // തിരഞ്ഞെടുക്കപ്പെട്ട ഡിപ്പാർട്ട്മെന്റിലെ സ്റ്റാഫുകളെ മാത്രം ലിസ്റ്റ് ചെയ്യുന്നു
  const filteredStaffsByDept = staffs.filter(
    (s) => s.role_name.toLowerCase() === filterDept.toLowerCase()
  );

  return (
    <div className={styles.filtersBox}>
      {/* 1. ഇടതുവശത്തുള്ള പ്രധാന സെർച്ച് ബാർ */}
      <div className={styles.searchWrapper} style={{ maxWidth: "320px" }}>
        <Search size={16} className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Filter by title or staff..."
          className={styles.customInputOverride}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 2. വലതുവശത്തുള്ള ഡൈനാമിക് ഫിൽട്ടർ കൺട്രോളുകൾ */}
      <div className="flex items-center gap-3 justify-end flex-wrap">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-slate-500" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setFilterDept(""); 
              setSelectedStaffId("");
            }}
            className={styles.filterSelect}
          >
            <option value="all">No Filters (All)</option> {/* ഈ ഓപ്ഷൻ കൂടി നൽകുക */}
            <option value="day">Single Day</option>
            <option value="range">Date Range</option>
            <option value="month">Monthly & Yearly</option>
            <option value="year">Yearly Only</option>
            <option value="staff">Specific Staff Member</option>
          </select>
        </div>

        {/* A. Single Day - ഒരു തീയതി മാത്രം */}
        {filterType === "day" && (
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className={styles.dateInput}
          />
        )}

        {/* B. Date Range - രണ്ടു തീയതികൾ */}
        {filterType === "range" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={styles.dateInput}
            />
            <span className="text-xs font-semibold text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        )}

        {/* C. Monthly & Yearly */}
        {filterType === "month" && (
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Year (e.g. 2026)"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={styles.dateInput}
              style={{ width: "110px" }}
            />
          </div>
        )}

        {/* D. Yearly Only */}
        {filterType === "year" && (
          <input
            type="number"
            placeholder="Year (e.g. 2026)"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={styles.dateInput}
            style={{ width: "120px" }}
          />
        )}

        {/* E. Specific Staff Member (ഡിപ്പാർട്ട്മെന്റ് തിരിച്ചുള്ള എഡിറ്റിങ് ലോജിക്) */}
        {filterType === "staff" && (
          <div className="flex items-center gap-2">
            {/* ഡിപ്പാർട്ട്മെന്റ് ലിസ്റ്റ് */}
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setSelectedStaffId(""); // ഡിപ്പാർട്ട്മെന്റ് മാറുമ്പോൾ പഴയ സ്റ്റാഫ് ഐഡി റീസെറ്റ് ചെയ്യുന്നു
              }}
              className={styles.filterSelect}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.role_name}>{dept.role_name}</option>
              ))}
            </select>

            {/* തിരഞ്ഞെടുക്കപ്പെട്ട ഡിപ്പാർട്ട്മെന്റിലെ സ്റ്റാഫുകളുടെ ലിസ്റ്റ് */}
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              disabled={filterDept === ""} // ഡിപ്പാർട്ട്മെന്റ് തിരഞ്ഞെടുക്കാതെ ഇത് എനേബിൾ ആകില്ല
              className={styles.filterSelect}
              style={{ minWidth: "160px" }}
            >
              <option value="">Choose Staff Member</option>
              {filteredStaffsByDept.map((s) => (
                <option key={s.id} value={s.id}>{s.staff_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}