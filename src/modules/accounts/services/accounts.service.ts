// src/modules/accounts/services/accounts.service.ts

import api from "@/lib/axios";
import {
  AccountsSummaryParams,
  AccountsSummaryResponse,
  GenerateAccountsReportPayload,
  GenerateAccountsReportResponse,
  DailyAccountsReportParams,
  DailyAccountsReportResponse,
} from "../types/accounts.types";


export const getSummary = async (params?: AccountsSummaryParams): Promise<AccountsSummaryResponse> => {
  const res = await api.get<AccountsSummaryResponse>("/accounts/accounts-report/summary", { params });
  return res.data;
};

export const generateAccountsReport = async (
  payload: GenerateAccountsReportPayload
): Promise<GenerateAccountsReportResponse> => {
  const res = await api.post<GenerateAccountsReportResponse>("/accounts/accounts-report/generate", payload);
  return res.data;
};

export const listDailySummary = async (
  params?: DailyAccountsReportParams
): Promise<DailyAccountsReportResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<DailyAccountsReportResponse>("/accounts/accounts-report/list-daily-summary", {
    params: cleanedParams,
  });
  return res.data;
};

export const accountsService = {
  getSummary,
  generateAccountsReport,
  listDailySummary,
};