import api from "@/lib/axios";
import {
    SalesKpiCardsResponse,
    SalesOrderStatusResponse,
    SalesPaymentStatusResponse,
    SalesOverviewFilters
} from "../types";

// 1. Get Sales KPI Cards
export async function getSalesKpiCards(filters?: SalesOverviewFilters): Promise<SalesKpiCardsResponse> {
    const response = await api.get("/sales/kpi-cards", { params: filters });
    return response.data;
}

// 2. Get Order Status KPI Data
export async function getSalesOrderStatusKpi(filters?: SalesOverviewFilters): Promise<SalesOrderStatusResponse> {
    const response = await api.get("/sales/kpi-cards/order-status", { params: filters });
    return response.data;
}

// 3. Get Payment Status KPI Data
export async function getSalesPaymentStatusKpi(filters?: SalesOverviewFilters): Promise<SalesPaymentStatusResponse> {
    const response = await api.get("/sales/kpi-cards/payments", { params: filters });
    return response.data;
}
