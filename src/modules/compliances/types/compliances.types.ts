export type ComplianceRole = "admin" | "manager" | "accounts";

export interface Compliance {
    id: number;
    compliance_name: string;
    compliance_type: string;
    description: string;
    due_date: string;
    reminder_date: string;
    assigned_to: number;
    assigned_to_name: string;
    assigned_by: number;
    assigned_by_name: string;
    status: string;
    priority: string;
    completed_on: string | null;
    completed_by: number | null;
    completed_by_name: string | null;
    remarks: string;
    created_by: number;
    created_by_name: string;
    created_on: string;
    updated_by: number;
    updated_by_name: string;
    updated_on: string;
    days_left: number;
    is_overdue: boolean;
}

export interface CompliancePagination {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
}

export interface ComplianceListResponse {
    items: Compliance[];
    pagination: CompliancePagination;
}

export interface ComplianceKpi {
    total_compliances: number;
    total_count: number;
    pending_compliances: number;
    pending_count: number;
    completed_compliances: number;
    completed_count: number;
    overdue_compliances: number;
    overdue_count: number;
    in_progress_compliances: number;
    from_date: string | null;
    to_date: string | null;
}

export interface ComplianceListParams {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    priority?: string;
    compliance_type?: string;
    assigned_to?: number;
    assigned_by?: number;
    due_date?: string;
    from_date?: string;
    to_date?: string;
    month?: string;
    year?: string;
    upto_today?: boolean;
    is_overdue?: boolean;
    not_completed?: boolean;
}

export interface CreateCompliancePayload {
    compliance_name: string;
    compliance_type: string;
    description?: string;
    due_date: string;
    reminder_date?: string;
    assigned_to: number;
    status: string;
    priority: string;
    remarks?: string;
}

export interface UpdateCompliancePayload {
    compliance_name: string;
    compliance_type: string;
    description?: string;
    due_date: string;
    reminder_date?: string;
    assigned_to: number;
    status: string;
    priority: string;
    completed_on?: string | null;
    completed_by?: number | null;
    remarks?: string;
}

export interface UpdateComplianceStatusPayload {
    status: string;
    remarks?: string;
}
