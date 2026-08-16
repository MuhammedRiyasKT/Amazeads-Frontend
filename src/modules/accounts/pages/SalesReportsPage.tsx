// src/modules/accounts/pages/SalesReportsPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FilePlus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";

import { 
  SalesReport, 
  SalesReportFilters 
} from "../types";

import {
  getSalesReports,
  generateSalesReport,
  getSalesReportDetail,
} from "../services/accounts.service";

import SalesReportFiltersComponent from "../components/SalesReportFilters";
import SalesReportTable from "../components/SalesReportTable";
import SalesReportDetailsDrawer from "../components/SalesReportDetailsDrawer";
import GenerateReportModal from "../components/GenerateReportModal";

export default function SalesReportsPage() {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5); // Keep default page_size = 5

  // Filters State
  const [filters, setFilters] = useState<SalesReportFilters>({});

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Active Report Details Selection
  const [selectedReport, setSelectedReport] = useState<SalesReport | null>(null);

  // Toast alert messages
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

  // Load Sales Reports List
  const fetchReportsList = async () => {
    setIsLoading(true);
    try {
      const queryFilters: SalesReportFilters = {
        page,
        page_size: pageSize,
        ...filters,
      };

      const res = await getSalesReports(queryFilters);
      setReports(res.reports || []);
      setTotalCount(res.total_count || 0);
    } catch (err) {
      console.error("Error loading sales reports:", err);
      setToastMsg({
        type: "error",
        text: "Failed to load sales reports.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, [page, filters]);

  // Filter Event Handlers
  const handleFilterChange = (updated: Partial<SalesReportFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updated };
      // Clean empty keys
      Object.keys(newFilters).forEach((key) => {
        const val = newFilters[key as keyof SalesReportFilters];
        if (val === undefined || val === null || val === "") {
          delete newFilters[key as keyof SalesReportFilters];
        }
      });
      return newFilters;
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Generation Handlers
  const handleGenerateReportSubmit = async (dateStr: string): Promise<boolean | "duplicate"> => {
    try {
      await generateSalesReport({ report_date: dateStr });
      setToastMsg({
        type: "success",
        text: "Sales report generated successfully.",
      });
      fetchReportsList();
      return true;
    } catch (err: any) {
      console.error(err);
      const isDuplicate = err?.response?.status === 400 || 
                          err?.response?.data?.detail?.includes("already exists") ||
                          err?.response?.data?.message?.includes("already exists");
      if (isDuplicate) {
        return "duplicate";
      }
      throw err;
    }
  };

  // View detail
  const handleViewReport = async (report: SalesReport) => {
    setIsLoading(true);
    try {
      const data = await getSalesReportDetail(report.date);
      setSelectedReport(data);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
      setToastMsg({
        type: "error",
        text: "Failed to load sales report details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewByDate = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const data = await getSalesReportDetail(dateStr);
      setSelectedReport(data);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
      setToastMsg({
        type: "error",
        text: "Failed to load sales report details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 w-full max-w-full">
      {/* Toast alert */}
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

      {/* Page Header */}
      <div className="flex items-center justify-between w-full">
        <div className="space-y-0.5">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Sales Reports</h1>
          <p className="text-xs font-semibold text-slate-400">View and manage daily sales collection reports</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={fetchReportsList}
            disabled={isLoading}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button
            onClick={() => setIsGeneratingModalOpen(true)}
            className="font-bold flex items-center gap-1.5 h-9 text-xs px-4 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
          >
            <FilePlus size={15} /> Generate Report
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <SalesReportFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main Table */}
      <SalesReportTable
        reports={reports}
        isLoading={isLoading}
        onViewReport={handleViewReport}
      />

      {/* Pagination row */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between w-full border-t border-slate-100 pt-4 mt-2">
          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}</strong> of{" "}
            <strong className="text-slate-700">{totalCount}</strong> reports
          </span>

          <Pagination
            total={totalCount}
            limit={pageSize}
            activePage={page}
            onPageChange={setPage}
          />
          
          {/* Spacer to match layout width */}
          <div className="w-[100px]" />
        </div>
      )}

      {/* Dialog Modals and Side drawers */}
      
      {/* 1. Generate report prompt modal */}
      <GenerateReportModal
        isOpen={isGeneratingModalOpen}
        onClose={() => setIsGeneratingModalOpen(false)}
        onGenerate={handleGenerateReportSubmit}
        onViewExisting={handleViewByDate}
      />

      {/* 2. Details Drawer */}
      <SalesReportDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}
