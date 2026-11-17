import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";

interface OrderFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  onClear?: () => void;
  commitToDate?: string;
  setCommitToDate?: (val: string) => void;
  completionDate?: string;
  setCompletionDate?: (val: string) => void;
}

const ONGOING_OPTIONS = [
  { label: "All Ongoing", value: "Ongoing", color: "bg-indigo-500" },
  { label: "In Progress", value: "In Progress", color: "bg-blue-500" },
  { label: "Packed", value: "Packed", color: "bg-purple-500" },
  { label: "In Transit", value: "In Transit", color: "bg-amber-500" },
  { label: "Delivered", value: "Delivered", color: "bg-emerald-500" },
];

export default function OrderFilters({
  search,
  setSearch,
  orderStatus,
  setOrderStatus,
  commitToDate,
  setCommitToDate,
  completionDate,
  setCompletionDate,
}: OrderFiltersProps) {
  const [ongoingDropdownOpen, setOngoingDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOngoingDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ongoingValues = ["Ongoing", "In Progress", "Packed", "In Transit", "In Transist", "Delivered"];
  const isOngoingActive = ongoingValues.includes(orderStatus);

  const getOngoingButtonLabel = () => {
    if (!isOngoingActive || orderStatus === "Ongoing") {
      return "Ongoing";
    }
    if (orderStatus === "In Transist") return "In Transit";
    return orderStatus;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Search across all text fields */}
      <div className="relative flex items-center flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search across all text fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full border border-slate-200 rounded-lg pl-9 pr-8 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Date Filters inside the row */}
      {setCommitToDate && setCompletionDate && (
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 flex-wrap">
          {/* Commit Date */}
          <div className="flex items-center gap-1.5">
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Commit:
            </span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={commitToDate || ""}
                onChange={(e) => setCommitToDate(e.target.value)}
                className="border-none outline-none text-[11px] font-semibold text-slate-600 bg-transparent cursor-pointer"
                style={{ paddingRight: commitToDate ? "14px" : "0" }}
              />
              {commitToDate && (
                <button
                  type="button"
                  onClick={() => setCommitToDate("")}
                  className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-3.5 bg-slate-200" />

          {/* Completed Date */}
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Completed:
            </span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={completionDate || ""}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="border-none outline-none text-[11px] font-semibold text-slate-600 bg-transparent cursor-pointer"
                style={{ paddingRight: completionDate ? "14px" : "0" }}
              />
              {completionDate && (
                <button
                  type="button"
                  onClick={() => setCompletionDate("")}
                  className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Status Filter Bar */}
      <div className="flex items-center gap-1 bg-slate-100/70 border p-1 rounded-xl shrink-0 self-start sm:self-center">
        <button
          type="button"
          onClick={() => {
            setOngoingDropdownOpen(false);
            setOrderStatus("");
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === ""
              ? "bg-white text-slate-800 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-slate-700 border border-transparent"
          }`}
        >
          All Orders
        </button>
        <button
          type="button"
          onClick={() => {
            setOngoingDropdownOpen(false);
            setOrderStatus("Confirmed");
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === "Confirmed"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
          }`}
        >
          New Orders
        </button>

        {/* Ongoing Dropdown Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOngoingDropdownOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isOngoingActive
                ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
                : "text-slate-500 hover:text-indigo-600 border border-transparent"
            }`}
          >
            <span>{getOngoingButtonLabel()}</span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                ongoingDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {ongoingDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200/90 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
              <div className="px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Ongoing Status
              </div>
              <div className="py-1">
                {ONGOING_OPTIONS.map((opt) => {
                  const isSelected =
                    orderStatus === opt.value ||
                    (opt.value === "In Transit" && orderStatus === "In Transist");

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setOrderStatus(opt.value);
                        setOngoingDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/80 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && (
                        <Check size={13} className="text-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setOngoingDropdownOpen(false);
            setOrderStatus("urgent");
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            orderStatus === "urgent"
              ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200 font-extrabold"
              : "text-slate-500 hover:text-rose-600 border border-transparent"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          <span>Overdue & Due Today</span>
        </button>
      </div>
    </div>
  );
}