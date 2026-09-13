// src/modules/attendance-report/pages/AttendanceReportPage.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ReportPeriod,
  AttendanceReportItem,
  AttendancePagination,
  AttendanceReportFilters,
  StaffOption,
} from "../types/attendanceReport.types";
import { getAttendanceReport, getStaffOptions } from "../services/attendanceReport.service";
import AttendanceReportHeader from "../components/AttendanceReportHeader";
import AttendanceReportFiltersBar from "../components/AttendanceReportFilters";
import AttendanceReportTable from "../components/AttendanceReportTable";
import StaffWiseAttendanceDrawer from "../components/StaffWiseAttendanceDrawer";
import AttendanceReportPagination from "../components/AttendanceReportPagination";

interface AttendanceReportPageProps {
  role?: "admin" | "manager" | "hr";
}

export default function AttendanceReportPage({ role = "admin" }: AttendanceReportPageProps) {
  // 1. Core State
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [filters, setFilters] = useState<AttendanceReportFilters>({
    page: 1,
    page_size: 5,
  });

  // 2. Data & Pagination State
  const [items, setItems] = useState<AttendanceReportItem[]>([]);
  const [pagination, setPagination] = useState<AttendancePagination>({
    page: 1,
    page_size: 5,
    total_count: 0,
    total_pages: 1,
  });

  // 3. Drawer State & Staff options state
  const [drawerItem, setDrawerItem] = useState<AttendanceReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);

  // 4. Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ── Fetch Staff Dropdown Options ──────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoadingStaff(true);

    getStaffOptions(role)
      .then((options) => {
        if (isMounted) {
          setStaffList(options);
        }
      })
      .catch((err) => {
        console.error("Error loading staff options:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStaff(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  // ── Fetch Report Data ──────────────────────────────────────────────────────
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMsg("");

    try {
      const res = await getAttendanceReport(period, filters);
      const fetchedItems = res.data?.items || [];
      const fetchedPagination = res.data?.pagination || {
        page: filters.page || 1,
        page_size: filters.page_size || 5,
        total_count: fetchedItems.length,
        total_pages: Math.ceil(fetchedItems.length / (filters.page_size || 5)) || 1,
      };

      setItems(fetchedItems);
      setPagination(fetchedPagination);
    } catch (err: any) {
      console.error(`Error loading attendance report for ${period}:`, err);
      setIsError(true);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to load attendance report. Please check server connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, filters]);

  // Execute fetch when period or filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  
  // Period Switcher: Reset incompatible date filters & page
  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setFilters({
      page: 1,
      page_size: filters.page_size || 5,
      staff_id: filters.staff_id, // preserve staff filter across period switches
    });
  };

  // Filter Updates
  const handleFilterChange = (updated: Partial<AttendanceReportFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updated,
      page: 1, // Reset page to 1 on filter change
    }));
  };

  // Clear Filters
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: filters.page_size || 5,
    });
  };

  // Page Change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Page Size Change
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      page_size: newPageSize,
    }));
  };

  // Open Staff Drawer Handler
  const handleOpenStaffDrawer = (item: AttendanceReportItem) => {
    setDrawerItem(item);
    setIsDrawerOpen(true);
  };

  // Close Staff Drawer Handler
  const handleCloseStaffDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerItem(null);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 w-full max-w-full">
      {/* 1. Header & Period Switcher */}
      <AttendanceReportHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={fetchReportData}
        isLoading={isLoading}
      />

      {/* 2. Filter Bar */}
      <AttendanceReportFiltersBar
        period={period}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        staffList={staffList}
        isLoadingStaff={isLoadingStaff}
      />

      {/* 3. Clean Attendance Data Table */}
      <AttendanceReportTable
        items={items}
        period={period}
        isLoading={isLoading}
        isError={isError}
        errorMsg={errorMsg}
        onRetry={fetchReportData}
        onOpenStaffDrawer={handleOpenStaffDrawer}
      />

      {/* 4. Staff-Wise Attendance Breakdown Slide-Over Drawer */}
      <StaffWiseAttendanceDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseStaffDrawer}
        item={drawerItem}
      />

      {/* 5. Pagination */}
      {!isLoading && !isError && pagination.total_count > 0 && (
        <AttendanceReportPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
