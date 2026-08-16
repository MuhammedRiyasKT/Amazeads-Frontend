// src/modules/accounts/components/SalesReportTable.tsx

"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Eye } from "lucide-react";
import { SalesReport } from "../types";

interface SalesReportTableProps {
  reports: SalesReport[];
  isLoading: boolean;
  onViewReport: (report: SalesReport) => void;
}

export default function SalesReportTable({
  reports,
  isLoading,
  onViewReport,
}: SalesReportTableProps) {
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    // Standard visual badge style for reports status
    return (
      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block">
        {status || "Created"}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full relative">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead style={{ width: "150px" }}>Date</TableHead>
              <TableHead style={{ width: "120px", textAlign: "center" }}>Orders Count</TableHead>
              <TableHead style={{ textAlign: "right" }}>Sales Amount</TableHead>
              <TableHead style={{ textAlign: "right" }}>Collection</TableHead>
              <TableHead style={{ textAlign: "right" }}>Pending Amount</TableHead>
              <TableHead style={{ width: "120px", textAlign: "center" }}>Status</TableHead>
              <TableHead style={{ width: "100px", textAlign: "center" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="animate-pulse">
                  <TableCell><div className="h-4 bg-slate-100 rounded w-24" /></TableCell>
                  <TableCell align="center"><div className="h-4 bg-slate-100 rounded w-10 mx-auto" /></TableCell>
                  <TableCell align="right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></TableCell>
                  <TableCell align="right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></TableCell>
                  <TableCell align="right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></TableCell>
                  <TableCell align="center"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></TableCell>
                  <TableCell align="center"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">📊</span>
                    <strong className="text-slate-800 text-sm">No sales reports found</strong>
                    <span className="text-xs">Try changing your date filters or generate a new report.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id || report.date} className="hover:bg-slate-50/50 transition-colors">
                  {/* Date */}
                  <TableCell className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                    {formatDate(report.date)}
                  </TableCell>

                  {/* Orders count */}
                  <TableCell align="center" className="text-xs font-bold text-slate-800">
                    {report.orders || 0}
                  </TableCell>

                  {/* Sales Amount */}
                  <TableCell align="right" className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                    ₹{(report.sales_amount || 0).toLocaleString("en-IN")}.00
                  </TableCell>

                  {/* Collection */}
                  <TableCell align="right" className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                    ₹{(report.cash_collection || 0).toLocaleString("en-IN")}.00
                  </TableCell>

                  {/* Pending Amount */}
                  <TableCell align="right" className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                    ₹{(report.today_orders_pending || 0).toLocaleString("en-IN")}.00
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    {getStatusBadge(report.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <button
                      onClick={() => onViewReport(report)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
