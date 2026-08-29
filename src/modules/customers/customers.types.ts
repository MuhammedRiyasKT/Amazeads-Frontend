// src/modules/customers/customers.types.ts

export type CustomerRole = "sales" | "admin";

export interface Customer {
    id: number;
    customer_name: string;
    mobile_number: string;
    whatsapp_number: string;
    requirements: string;
    status: string;
    created_by: number;
    created_on: string;
    updated_on: string;
}

export interface CustomerAddress {
    id: number;
    customer_id: number;
    address_type: string;
    address_line_1: string;
    address_line_2: string;
    district: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    is_default: boolean;
    created_on: string;
    updated_on: string;
}

export interface CustomerDetails extends Customer {
    billing_address?: CustomerAddress;
    delivery_address?: CustomerAddress;
    addresses?: CustomerAddress[];
}

export interface CustomerPagination {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
}

export interface CustomerListResponse {
    items: Customer[];
    pagination: CustomerPagination;
}

export type DateFilterMode = "all" | "specific" | "range";

export interface CustomerListParams {
    page?: number;
    page_size?: number;
    search?: string;
    date?: string;
    from_date?: string;
    to_date?: string;
}
