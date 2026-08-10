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
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === "success"
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
