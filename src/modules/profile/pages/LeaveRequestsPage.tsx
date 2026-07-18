"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import styles from "../components/ProfileComponents.module.css";

export default function LeaveRequestsPage() {
  const [numDays, setNumDays] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Leave request submitted successfully!");
    // ഭാവിയിൽ ബാക്ക്-എൻഡ് വരുമ്പോൾ ഇവിടെ എപിഐ കോൾ ചെയ്യാം
  };

  const handleReset = () => {
    setNumDays(0);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <div className={styles.container}>
      {/* മെയിൻ കാർഡ് കണ്ടെയ്നർ (സ്ക്രീൻഷോട്ടിലുള്ള ഫിഗ്മ ലേഔട്ട് പോലെ ചെയ്തത്) */}
      <div className={styles.scheduleCard} style={{ padding: "32px" }}>
        
        {/* Header Title */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">New Leave Request</h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left max-w-5xl">
          
          {/* Row 1: Number of Days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Number of Days</label>
            <input
              type="number"
              min="0"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-indigo-600 font-bold"
              value={numDays}
              onChange={(e) => setNumDays(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          {/* Row 2: Start & End Dates (2 Columns) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 3: Reason for Leave */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reason for Leave</label>
            <textarea
              placeholder="Briefly describe the reason for your request..."
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 min-h-[160px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Row 4: Submit & Reset Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button 
              variant="primary" 
              size="sm" 
              type="submit"
              className="px-6 h-10 font-bold bg-indigo-600 hover:bg-indigo-700"
            >
              Submit Request
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={handleReset}
              className="px-6 h-10 font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}