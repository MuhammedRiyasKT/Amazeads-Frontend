import api from "@/lib/axios";
import { useSalesStore } from "@/store/salesStore";
import {
    SalesKpiCardsResponse,
    SalesOrderStatusResponse,
    SalesPaymentStatusResponse,
    SalesOverviewFilters
} from "../types";

// Helper to inject category_id from the store
const injectCategoryFilter = (filters?: SalesOverviewFilters): any => {
    const params = { ...filters } as any;
    const selectedCategory = useSalesStore.getState().selectedCategory;
    if (selectedCategory?.id !== undefined && params.category_id === undefined) {
        params.category_id = selectedCategory.id;
    }
    return params;
};

// 1. Get Sales KPI Cards
export async function getSalesKpiCards(filters?: SalesOverviewFilters): Promise<SalesKpiCardsResponse> {
    const params = injectCategoryFilter(filters);
    const response = await api.get("/sales/kpi-cards", { params });
    return response.data;
}

// 2. Get Order Status KPI Data
export async function getSalesOrderStatusKpi(filters?: SalesOverviewFilters): Promise<SalesOrderStatusResponse> {
    const params = injectCategoryFilter(filters);
    const response = await api.get("/sales/kpi-cards/order-status", { params });
    return response.data;
}

// 3. Get Payment Status KPI Data
export async function getSalesPaymentStatusKpi(filters?: SalesOverviewFilters): Promise<SalesPaymentStatusResponse> {
    const params = injectCategoryFilter(filters);
    const response = await api.get("/sales/kpi-cards/payments", { params });
    return response.data;
}
