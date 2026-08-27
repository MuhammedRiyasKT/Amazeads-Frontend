// src/modules/hr/types/kpi.types.ts

export interface DailyTasksKpi {
    total_tasks: number;
    completed: number;
    pending: number;
    overdue: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    from_date: string | null;
    to_date: string | null;
}

export interface DailyTasksKpiParams {
    month?: string;
    year?: number;
    day?: string;
    date?: string;
    from_date?: string;
    to_date?: string;
    upto_today?: boolean;
    staff_id?: number;
}
