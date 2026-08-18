import React from "react";
import { X } from "lucide-react";

interface OrderFiltersProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  onClear?: () => void;
  commitToDate?: string;
  setCommitToDate?: (val: string) => void;
  completionDate?: string;
  setCompletionDate?: (val: string) => void;
}

export default function OrderFilters({
  mobileSearch,
  setMobileSearch,
  orderStatus,
  setOrderStatus,
  commitToDate,
  setCommitToDate,
  completionDate,
  setCompletionDate,
}: OrderFiltersProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Search Mobile No..."
          value={mobileSearch}
          onChange={(e) => setMobileSearch(e.target.value)}
          className="h-10 w-full border border-slate-200 rounded-lg px-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
        />
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

      {/* Horizontal Status Filter Bar (Confirmed, In Progress) */}
      <div className="flex items-center gap-1 bg-slate-100/70 border p-1 rounded-xl shrink-0 self-start sm:self-center">
        <button
          type="button"
          onClick={() => setOrderStatus("")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${orderStatus === ""
              ? "bg-white text-slate-800 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-slate-700 border border-transparent"
            }`}
        >
          All Orders
        </button>
        <button
          type="button"
          onClick={() => setOrderStatus("Confirmed")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${orderStatus === "Confirmed"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
            }`}
        >
          New Orders
        </button>
        <button
          type="button"
          onClick={() => setOrderStatus("Ongoing")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${orderStatus === "Ongoing"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
            }`}
        >
          Ongoing
        </button>
        {/* <button
          type="button"
          onClick={() => setOrderStatus("Closed")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === "Closed"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
          }`}
        >
          Closed
        </button> */}
      </div>
    </div>
  );
}