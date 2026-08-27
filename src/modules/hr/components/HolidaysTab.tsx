// src/modules/hr/components/HolidaysTab.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  Holiday,
  HolidayFilters,
  HolidayResponse,
  CreateHolidayPayload,
} from "../types/attendance.types";
import {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  bulkAddHolidays,
} from "../services/attendance.service";
import AddEditHolidayModal from "./AddEditHolidayModal";

export default function HolidaysTab() {
  const [data, setData] = useState<HolidayResponse>({
    items: [],
    pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [yearFilter, setYearFilter] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Calendar View State
  const activeYear = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
  const activeMonth = monthFilter ? parseInt(monthFilter) : (new Date().getMonth() + 1);

  const [existingHolidaysForMonth, setExistingHolidaysForMonth] = useState<Holiday[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<Record<string, { holiday_name: string; is_optional: boolean }>>({});
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchExistingHolidaysForMonth = async (yr: number, mo: number) => {
    setIsCalendarLoading(true);
    try {
      const res = await getHolidays({
        year: yr,
        month: mo,
        page: 1,
        page_size: 100
      });
      const items = res.items || res.data || [];
      setExistingHolidaysForMonth(items);

      // Auto-select Sundays that do not already exist in the database
      const daysCount = new Date(yr, mo, 0).getDate();
      const newSundays: Record<string, { holiday_name: string; is_optional: boolean }> = {};

      for (let day = 1; day <= daysCount; day++) {
        const dateObj = new Date(yr, mo - 1, day);
        if (dateObj.getDay() === 0) { // Sunday
          const dateStr = `${yr}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const exists = items.some((h: Holiday) => h.holiday_date === dateStr);
          if (!exists) {
            newSundays[dateStr] = {
              holiday_name: "Sunday",
              is_optional: false
            };
          }
        }
      }
      setSelectedHolidays(newSundays);
    } catch (err) {
      console.error("Error fetching holidays for month:", err);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingHolidaysForMonth(activeYear, activeMonth);
  }, [activeYear, activeMonth]);

  const handleDaySelect = (day: number) => {
    const dateStr = `${activeYear}-${String(activeMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Check if duplicate
    const isSaved = existingHolidaysForMonth.some((h) => h.holiday_date === dateStr);
    if (isSaved) return;

    setSelectedHolidays((prev) => {
      const next = { ...prev };
      if (next[dateStr]) {
        delete next[dateStr];
      } else {
        const isSunday = new Date(activeYear, activeMonth - 1, day).getDay() === 0;
        next[dateStr] = {
          holiday_name: isSunday ? "Sunday" : "Holiday",
          is_optional: false
        };
      }
      return next;
    });
  };

  const handleBulkSave = async () => {
    const list = Object.keys(selectedHolidays).map((dateStr) => ({
      holiday_name: selectedHolidays[dateStr].holiday_name.trim(),
      holiday_date: dateStr,
      is_optional: selectedHolidays[dateStr].is_optional
    }));

    if (list.length === 0) return;

    setIsBulkSaving(true);
    try {
      await bulkAddHolidays({ holidays: list });
      setToastMsg({
        type: "success",
        text: `Successfully marked ${list.length} holidays!`,
      });
      setSelectedHolidays({});
      fetchHolidaysData();
      fetchExistingHolidaysForMonth(activeYear, activeMonth);
    } catch (err: any) {
      console.error("Error bulk saving holidays:", err);
      setToastMsg({
        type: "error",
        text: err?.response?.data?.message || err?.response?.data?.detail || "Failed to bulk save holidays."
      });
    } finally {
      setIsBulkSaving(false);
    }
  };

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    holiday: Holiday | null;
  }>({ isOpen: false, holiday: null });

  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter, monthFilter, debouncedSearch]);

  // Fetch Holidays
  const fetchHolidaysData = async () => {
    setIsLoading(true);
    setError(null);

    const filters: HolidayFilters = {
      page: currentPage,
      page_size: 5,
    };

    if (yearFilter) filters.year = yearFilter;
    if (monthFilter) filters.month = monthFilter;
    if (debouncedSearch) filters.holiday_name = debouncedSearch;

    try {
      const res = await getHolidays(filters);
      setData(res);
    } catch (err: any) {
      console.error("Error fetching holidays:", err);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load holidays."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidaysData();
  }, [currentPage, yearFilter, monthFilter, debouncedSearch]);

  // Submit Handler for Add/Edit
  const handleModalSubmit = async (payload: CreateHolidayPayload) => {
    if (editingHoliday && editingHoliday.id) {
      await updateHoliday(editingHoliday.id, payload);
      setToastMsg({
        type: "success",
        text: `Holiday "${payload.holiday_name}" updated successfully!`,
      });
    } else {
      await addHoliday(payload);
      setToastMsg({
        type: "success",
        text: `Holiday "${payload.holiday_name}" added successfully!`,
      });
    }
    fetchHolidaysData();
    fetchExistingHolidaysForMonth(activeYear, activeMonth);
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteModal.holiday || !deleteModal.holiday.id) return;

    setIsDeleting(true);
    try {
      await deleteHoliday(deleteModal.holiday.id);
      setToastMsg({
        type: "success",
        text: `Holiday "${deleteModal.holiday.holiday_name}" deleted successfully!`,
      });
      setDeleteModal({ isOpen: false, holiday: null });
      fetchHolidaysData();
      fetchExistingHolidaysForMonth(activeYear, activeMonth);
    } catch (err: any) {
      console.error("Error deleting holiday:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete holiday.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const holidaysList = data.items || data.data || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${toastMsg.type === "success"
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-rose-600 text-white border-rose-700"
            }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toastMsg.text}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Month:</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search holiday..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Add Holiday Button */}
          <button
            type="button"
            onClick={() => {
              setEditingHoliday(null);
              setIsModalOpen(true);
            }}
            className="h-9 px-4 text-xs font-extrabold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus size={15} /> Add Holiday
          </button>
        </div>
      </div>

      {/* Bulk Holiday Marking Calendar Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-650" size={17} />
            <h3 className="font-extrabold text-slate-805 text-xs uppercase leading-tight tracking-wider">
              Bulk Monthly Holiday Marker — {MONTH_NAMES[activeMonth - 1]} {activeYear}
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold capitalize">
            Sundays auto-selected
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid Section */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {isCalendarLoading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading calendar...</span>
                </div>
              </div>
            ) : (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offsets */}
                  {Array.from({ length: new Date(activeYear, activeMonth - 1, 1).getDay() }).map((_, i) => (
                    <div key={`offset-${i}`} className="h-11 bg-slate-50/50 rounded-lg border border-slate-100/50" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: new Date(activeYear, activeMonth, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${activeYear}-${String(activeMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSunday = new Date(activeYear, activeMonth - 1, day).getDay() === 0;

                    const existing = existingHolidaysForMonth.find((h) => h.holiday_date === dateStr);
                    const isSelected = !!selectedHolidays[dateStr];
                    const isOptional = selectedHolidays[dateStr]?.is_optional;

                    let bgClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300";
                    let badge = "";

                    if (existing) {
                      bgClass = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
                      badge = existing.is_optional ? "Opt-Saved" : "Saved";
                    } else if (isSelected) {
                      if (isOptional) {
                        bgClass = "bg-amber-500 border-amber-600 text-white shadow-3xs hover:bg-amber-600 animate-fade-in";
                      } else {
                        bgClass = "bg-indigo-600 border-indigo-700 text-white shadow-3xs hover:bg-indigo-700 animate-fade-in";
                      }
                      badge = selectedHolidays[dateStr].holiday_name;
                    } else if (isSunday) {
                      // Deselected Sunday
                      bgClass = "bg-rose-50/30 border-rose-200/50 border-dashed text-rose-500 hover:bg-rose-50/50";
                      badge = "Deselected";
                    }

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() => handleDaySelect(day)}
                        disabled={!!existing}
                        className={`h-11 rounded-lg border flex flex-col items-center justify-between p-1 transition-all cursor-pointer select-none text-left relative ${bgClass}`}
                        title={existing ? `Already saved: ${existing.holiday_name}` : "Click to toggle holiday"}
                      >
                        <span className="text-xs font-black leading-none">{day}</span>
                        {badge && (
                          <span className={`text-[8px] font-black uppercase tracking-wider truncate max-w-full px-0.5 leading-none ${existing
                              ? "text-slate-400"
                              : isSelected
                                ? "text-white"
                                : "text-rose-450"
                            }`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend indicators */}
            <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-700 block" />
                <span>Regular (Selected)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 border border-amber-600 block" />
                <span>Optional (Selected)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-50/30 border border-rose-200 border-dashed block" />
                <span>Unselected Sunday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-105 border border-slate-200 block" />
                <span>Already Saved Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-slate-205 block" />
                <span>Working Day</span>
              </div>
            </div>
          </div>

          {/* Bulk Selection Form Section */}
          <div className="lg:col-span-4 bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase leading-tight">
                Pending Holidays
              </h4>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                Configure names of the {Object.keys(selectedHolidays).length} holidays to bulk save
              </p>
            </div>

            <div className="flex-grow overflow-y-auto max-h-56 pr-1 space-y-3">
              {Object.keys(selectedHolidays).length === 0 ? (
                <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400 italic font-semibold">
                  No holidays selected in the calendar yet.
                </div>
              ) : (
                Object.keys(selectedHolidays)
                  .sort()
                  .map((dateStr) => {
                    const dateObj = new Date(dateStr);
                    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                    return (
                      <div key={dateStr} className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col gap-2 relative">
                        {/* Remove Day Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHolidays((prev) => {
                              const next = { ...prev };
                              delete next[dateStr];
                              return next;
                            });
                          }}
                          className="absolute top-1.5 right-1.5 text-slate-450 hover:text-rose-500 cursor-pointer"
                          title="Deselect holiday"
                        >
                          <X size={12} />
                        </button>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">{formattedDate}</span>
                          <span className="text-[9px] uppercase tracking-wider font-medium text-slate-400">{dateStr}</span>
                        </div>

                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Holiday Name"
                            value={selectedHolidays[dateStr].holiday_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedHolidays((prev) => ({
                                ...prev,
                                [dateStr]: {
                                  ...prev[dateStr],
                                  holiday_name: val
                                }
                              }));
                            }}
                            className="flex-grow px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                          <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600 shrink-0 select-none">
                            <input
                              type="checkbox"
                              checked={selectedHolidays[dateStr].is_optional}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedHolidays((prev) => ({
                                  ...prev,
                                  [dateStr]: {
                                    ...prev[dateStr],
                                    is_optional: checked
                                  }
                                }));
                              }}
                              className="rounded text-indigo-650 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5 border-slate-300"
                            />
                            Opt
                          </label>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-200/80 pt-3">
              <button
                type="button"
                onClick={handleBulkSave}
                disabled={isBulkSaving || Object.keys(selectedHolidays).length === 0 || Object.values(selectedHolidays).some((h) => !h.holiday_name.trim())}
                className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-extrabold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isBulkSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Holidays ({Object.keys(selectedHolidays).length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holidays Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[180px]">
                  HOLIDAY NAME
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[160px] text-center">
                  DATE
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[150px] text-center">
                  TYPE
                </th>
                <th className="py-3.5 px-4 w-[120px] text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-slate-500 font-semibold"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading holidays...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-rose-600 font-semibold"
                  >
                    {error}
                  </td>
                </tr>
              ) : holidaysList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-slate-400 font-semibold"
                  >
                    No holidays found.
                  </td>
                </tr>
              ) : (
                holidaysList.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Holiday Name */}
                    <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900 align-middle">
                      {item.holiday_name}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-700 align-middle whitespace-nowrap">
                      {item.holiday_date}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle whitespace-nowrap">
                      {item.is_optional ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          Optional
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Regular
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHoliday(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                          title="Edit Holiday"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteModal({ isOpen: true, holiday: item })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                          title="Delete Holiday"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination */}
        {!isLoading && holidaysList.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 font-semibold">
              Showing page <strong>{data.pagination.page}</strong> of{" "}
              <strong>{data.pagination.total_pages}</strong> (
              {data.pagination.total_count} holidays)
            </div>
            <Pagination
              total={data.pagination.total_count}
              limit={data.pagination.page_size}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Holiday Modal */}
      <AddEditHolidayModal
        isOpen={isModalOpen}
        holiday={editingHoliday}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHoliday(null);
        }}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2500] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 flex flex-col gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Delete Holiday
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <strong>"{deleteModal.holiday?.holiday_name}"</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, holiday: null })}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
