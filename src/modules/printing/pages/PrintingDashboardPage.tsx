"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import QueueCardGrid from "../components/QueueCardGrid";
import { usePrintingStore } from "@/store/printingStore";

interface PrintingDashboardPageProps {
  categoryName: string;
}

export default function PrintingDashboardPage({ categoryName }: PrintingDashboardPageProps) {
  const selectedSubDept = usePrintingStore((state) => state.selectedSubDept);
  const activeUnit = selectedSubDept?.sub_department_name || categoryName;

  return (
    <div className="flex flex-col gap-5 p-6">
      
      {/* 🌟 Simple & Clean Page Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link 
            href="/printing" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={14} /> Back to Categories
          </Link>

          <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
            <Printer size={13} /> {activeUnit}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Printing Queue ({activeUnit})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage upcoming and active print jobs assigned for {activeUnit}.
          </p>
        </div>
      </div>

      {/* 🌟 Clean Table */}
      <QueueCardGrid />
    </div>
  );
}