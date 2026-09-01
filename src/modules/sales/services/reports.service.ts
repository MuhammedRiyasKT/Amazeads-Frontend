// src/modules/sales/services/reports.service.ts

import api from "@/lib/axios";
import { SalesReportParams, SalesReportResponse } from "../types/reports.types";

/**
 * Build clean params object — removes undefined, null, empty strings
 * so we never send empty query parameters to the API.
 */
function buildCleanParams(params: SalesReportParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {
    page: params.page,
    page_size: params.page_size,
  };

  if (params.year) clean.year = params.year;
  if (params.month) clean.month = params.month;
  if (params.day) clean.day = params.day;
  if (params.date) clean.date = params.date;
  if (params.from_date) clean.from_date = params.from_date;
  if (params.to_date) clean.to_date = params.to_date;
  if (params.upto_today === true) clean.upto_today = true;
  if (params.category_id !== undefined && params.category_id !== null) {
    clean.category_id = params.category_id;
  }

  return clean;
}

// 1. Daily Reports — GET /sales/reports/by-day
export async function getDailyReports(params: SalesReportParams): Promise<SalesReportResponse> {
  const response = await api.get("/sales/reports/by-day", { params: buildCleanParams(params) });
  return response.data;
}

// 2. Weekly Reports — GET /sales/reports/by-week
export async function getWeeklyReports(params: SalesReportParams): Promise<SalesReportResponse> {
  const response = await api.get("/sales/reports/by-week", { params: buildCleanParams(params) });
  return response.data;
}

// 3. Monthly Reports — GET /sales/reports/by-month
export async function getMonthlyReports(params: SalesReportParams): Promise<SalesReportResponse> {
  const response = await api.get("/sales/reports/by-month", { params: buildCleanParams(params) });
  return response.data;
}

// 4. Yearly Reports — GET /sales/reports/by-year
export async function getYearlyReports(params: SalesReportParams): Promise<SalesReportResponse> {
  const response = await api.get("/sales/reports/by-year", { params: buildCleanParams(params) });
  return response.data;
}
