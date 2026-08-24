import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrintingKpiData {
    total_assigned_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    not_completed_tasks: number;
    not_accepted_tasks: number;
    notaccepted_tasks: number;
}

export interface PrintingKpiResponse {
    success: boolean;
    message: string;
    data: PrintingKpiData;
}

export interface SubDepartmentKpiData {
    sub_department_id: number;
    sub_department_name: string;
    total_assigned_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    not_completed_tasks: number;
    not_accepted_tasks: number;
    notaccepted_tasks: number;
}

export type PrintingSubDepartmentKpiResponse = {
    success: boolean;
    message: string;
    data: Record<string, SubDepartmentKpiData>;
};

export type KpiFilterPreset =
    | "today"
    | "this_month"
    | "specific_date"
    | "custom_range"
    | "upto_today";

export interface PrintingOverviewFilters {
    preset: KpiFilterPreset;
    specificDate?: string;    // YYYY-MM-DD
    fromDate?: string;        // YYYY-MM-DD
    toDate?: string;          // YYYY-MM-DD
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildKpiParams(
    filters: PrintingOverviewFilters
): Record<string, string> {
    const params: Record<string, string> = {};

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");

    switch (filters.preset) {
        case "today": {
            const y = now.getFullYear();
            const m = pad(now.getMonth() + 1);
            const d = pad(now.getDate());
            params.date = `${y}-${m}-${d}`;
            break;
        }
        case "this_month": {
            const y = now.getFullYear();
            const m = pad(now.getMonth() + 1);
            params.month = m;
            params.year = String(y);
            break;
        }
        case "specific_date": {
            if (filters.specificDate) {
                params.date = filters.specificDate;
            }
            break;
        }
        case "custom_range": {
            if (filters.fromDate) params.from_date = filters.fromDate;
            if (filters.toDate) params.to_date = filters.toDate;
            break;
        }
        case "upto_today": {
            params.upto_today = "true";
            break;
        }
    }

    return params;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * GET /api/v1/printing/kpi-cards
 * Fetches main KPI aggregate data.
 */
export async function getPrintingKpiCards(
    filters: PrintingOverviewFilters
): Promise<PrintingKpiData> {
    const params = buildKpiParams(filters);
    const response = await api.get<PrintingKpiResponse>("/printing/kpi-cards", {
        params,
    });
    return response.data.data;
}

/**
 * GET /api/v1/printing/kpi-cards/by-sub-department
 * Fetches sub-department performance data.
 */
export async function getPrintingSubDepartmentKpiCards(
    filters: PrintingOverviewFilters
): Promise<Record<string, SubDepartmentKpiData>> {
    const params = buildKpiParams(filters);
    const response = await api.get<PrintingSubDepartmentKpiResponse>(
        "/printing/kpi-cards/by-sub-department",
        { params }
    );
    return response.data.data;
}
