// src/modules/customers/customers.service.ts
import api from "@/lib/axios";
import {
    CustomerRole,
    CustomerListResponse,
    CustomerDetails,
    CustomerListParams,
} from "./customers.types";

/** Clean params — drop undefined/null/empty strings */
function buildParams(raw: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(raw)) {
        if (val !== undefined && val !== null && val !== "") {
            out[key] = val;
        }
    }
    return out;
}

/**
 * List customers with optional search / date filters / pagination.
 * role: "sales" | "admin"
 */
export async function getCustomers(
    role: CustomerRole,
    params: CustomerListParams = {}
): Promise<CustomerListResponse> {
    const cleaned = buildParams({
        page: params.page ?? 1,
        page_size: params.page_size ?? 5,
        search: params.search,
        date: params.date,
        from_date: params.from_date,
        to_date: params.to_date,
    });
    const response = await api.get(`/${role}/customers`, { params: cleaned });
    return response.data;
}

/**
 * Fetch full customer details (with addresses) by ID.
 * role: "sales" | "admin"
 */
export async function getCustomerById(
    role: CustomerRole,
    id: number
): Promise<CustomerDetails> {
    const response = await api.get(`/${role}/customers/${id}`);
    return response.data;
}
