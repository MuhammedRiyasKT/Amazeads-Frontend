import api from "@/lib/axios";
import {
    ComplianceRole,
    ComplianceListParams,
    ComplianceListResponse,
    ComplianceKpi,
    Compliance,
    CreateCompliancePayload,
    UpdateCompliancePayload,
    UpdateComplianceStatusPayload,
} from "../types/compliances.types";

/**
 * Strips the `/api/v1` prefix from the path since the Axios instance baseURL
 * already includes the `/api/v1` prefix. This satisfies the requirement to define
 * the exact basePath string requested by the user, while making correct network calls.
 */
const getCleanPath = (role: ComplianceRole, subPath: string = "") => {
    const basePath =
        role === "admin"
            ? "/api/v1/admin/compliances"
            : role === "manager"
                ? "/api/v1/manager/compliances"
                : "/api/v1/accounts/compliances";
    const fullPath = subPath ? `${basePath}${subPath}` : basePath;
    return fullPath.startsWith("/api/v1") ? fullPath.substring(7) : fullPath;
};

/**
 * Dynamically cleans undefined, null, and empty string parameters from the query.
 */
const cleanParams = (params?: ComplianceListParams) => {
    if (!params) return {};
    return Object.fromEntries(
        Object.entries(params).filter(
            ([, val]) => val !== undefined && val !== null && val !== ""
        )
    );
};

export const listCompliances = async (
    role: ComplianceRole,
    params?: ComplianceListParams
): Promise<ComplianceListResponse> => {
    const cleaned = cleanParams(params);
    const response = await api.get<ComplianceListResponse>(getCleanPath(role), {
        params: cleaned,
    });
    return response.data;
};

export const getComplianceKpi = async (
    role: ComplianceRole,
    params?: ComplianceListParams
): Promise<ComplianceKpi> => {
    // KPI accepts same active filters (excluding pagination parameters)
    const filterParams: any = { ...params };
    delete filterParams.page;
    delete filterParams.page_size;

    const cleaned = cleanParams(filterParams);
    const response = await api.get<ComplianceKpi>(getCleanPath(role, "/kpi"), {
        params: cleaned,
    });
    return response.data;
};

export const getComplianceById = async (
    role: ComplianceRole,
    id: number
): Promise<Compliance> => {
    const response = await api.get<Compliance>(getCleanPath(role, `/${id}`));
    return response.data;
};

export const createCompliance = async (
    role: ComplianceRole,
    payload: CreateCompliancePayload
): Promise<Compliance> => {
    const response = await api.post<Compliance>(getCleanPath(role), payload);
    return response.data;
};

export const updateCompliance = async (
    role: ComplianceRole,
    id: number,
    payload: UpdateCompliancePayload
): Promise<Compliance> => {
    const response = await api.put<Compliance>(getCleanPath(role, `/${id}`), payload);
    return response.data;
};

export const deleteCompliance = async (
    role: ComplianceRole,
    id: number
): Promise<void> => {
    await api.delete(getCleanPath(role, `/${id}`));
};

export const updateComplianceStatus = async (
    role: ComplianceRole,
    id: number,
    payload: UpdateComplianceStatusPayload
): Promise<Compliance> => {
    const response = await api.patch<Compliance>(
        getCleanPath(role, `/${id}/status`),
        payload
    );
    return response.data;
};
