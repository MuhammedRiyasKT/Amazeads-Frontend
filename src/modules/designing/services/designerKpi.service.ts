import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DesignerKpiData {
  total_assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  not_completed_tasks: number;
  not_accepted_tasks: number;
  notaccepted_tasks: number;
}

export interface DesignerKpiResponse {
  success: boolean;
  message: string;
  data: DesignerKpiData;
}

export type DateFieldType = "assigned_on" | "completed_on" | "completion_time";

export type KpiFilterPreset =
  | "today"
  | "this_month"
  | "specific_date"
  | "custom_range"
  | "upto_today";

export interface DesignerKpiFilters {
  preset: KpiFilterPreset;
  specificDate?: string;    // YYYY-MM-DD (used for 'specific_date')
  fromDate?: string;        // YYYY-MM-DD (used for 'custom_range')
  toDate?: string;          // YYYY-MM-DD (used for 'custom_range')
  dateField?: DateFieldType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildKpiParams(
  filters: DesignerKpiFilters
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

  if (filters.dateField) {
    params.date_field = filters.dateField;
  }

  return params;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/designer/kpi-cards
 * Fetches designer KPI aggregate data with optional date filters.
 */
export async function getDesignerKpiCards(
  filters: DesignerKpiFilters
): Promise<DesignerKpiData> {
  const params = buildKpiParams(filters);
  const response = await api.get<DesignerKpiResponse>("/designer/kpi-cards", {
    params,
  });
  return response.data.data;
}
