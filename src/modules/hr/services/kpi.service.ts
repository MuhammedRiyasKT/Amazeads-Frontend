// src/modules/hr/services/kpi.service.ts

import api from "@/lib/axios";
import { DailyTasksKpi, DailyTasksKpiParams } from "../types/kpi.types";

/**
 * Utility to clean undefined, null, or empty string values from params object
 */
const cleanParams = (params: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.keys(params).forEach((key) => {
        const val = params[key];
        if (val !== undefined && val !== null && val !== "") {
            cleaned[key] = val;
        }
    });
    return cleaned;
};

/**
 * Fetch Daily Tasks KPI cards data
 */
export async function getDailyTasksKpi(
    filters: DailyTasksKpiParams
): Promise<DailyTasksKpi> {
    const params = cleanParams(filters);
    const response = await api.get("/hr/kpi-cards/daily-tasks", { params });
    return response.data?.data || response.data || {};
}
