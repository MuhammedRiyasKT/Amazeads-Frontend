import api from "@/lib/axios";

export interface ProductionKpiData {
    total_assigned_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    not_completed_tasks: number;
    not_accepted_tasks: number;
    notaccepted_tasks?: number; // Safe fallback matching backend response field variants
}

export interface ProductionSubDepartmentKpiData {
    sub_department_id: number;
    sub_department_name: string;
    total_assigned_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    not_completed_tasks: number;
    not_accepted_tasks: number;
    notaccepted_tasks?: number; // Safe fallback matching backend response field variants
}

export type KpiFilterPreset = "today" | "this_month" | "custom_range" | "upto_today" | "specific_date";

export interface ProductionOverviewFilters {
    preset: KpiFilterPreset;
    fromDate?: string;
    toDate?: string;
}

// Helper to format preset filters into query params
function buildParams(filters: ProductionOverviewFilters): Record<string, string | boolean> {
    const params: Record<string, string | boolean> = {};

    switch (filters.preset) {
        case "today": {
            const today = new Date();
            const pad = (n: number) => String(n).padStart(2, "0");
            params.date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
            break;
        }
        case "this_month": {
            const today = new Date();
            const pad = (n: number) => String(n).padStart(2, "0");
            params.month = pad(today.getMonth() + 1);
            params.year = String(today.getFullYear());
            break;
        }
        case "custom_range":
            if (filters.fromDate && filters.toDate) {
                params.from_date = filters.fromDate;
                params.to_date = filters.toDate;
            }
            break;
        case "upto_today":
            params.upto_today = true;
            break;
        default:
            break;
    }

    return params;
}

// 1. Fetch aggregated KPI cards (/api/v1/production/kpi-cards)
export async function getProductionKpiCards(
    filters: ProductionOverviewFilters
): Promise<ProductionKpiData> {
    const params = buildParams(filters);
    const response = await api.get("/production/kpi-cards", { params });
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch production KPI cards");
}

// 2. Fetch sub-department grouped KPI cards (/api/v1/production/kpi-cards/by-sub-department)
export async function getProductionSubDepartmentKpiCards(
    filters: ProductionOverviewFilters
): Promise<Record<string, ProductionSubDepartmentKpiData>> {
    const params = buildParams(filters);
    const response = await api.get("/production/kpi-cards/by-sub-department", { params });
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch production sub-department KPI cards");
}
