// src/modules/project-manager/index.ts

export { default as ProjectManagerOverviewPage } from "./pages/ProjectManagerOverviewPage";
export { default as PMTasksPage } from "./pages/PMTasksPage";

// 🌟 Re-export from shared @/modules/orders and @/modules/projects for 100% backward compatibility
export {
  OrdersListPage as PMAllOrdersPage,
  NewOrdersPage as PMNewOrdersPage,
  ClosedOrdersPage as PMClosedOrdersPage,
  DeliveredOrdersPage as PMDeliveredOrdersPage,
  InTransitPage as PMInTransitPage,
  OrderDispatchPage as PMOrderDispatchPage,
  PackedOrdersPage as PMPackedOrdersPage,
  OrderCategorySelectPage as PMCategorySelectPage,
} from "@/modules/orders";

export {
  ProjectsListPage as PMProjectsPage,
  ProductForDesignPage as PMDesignPage,
  ProductForPrintPage as PMPrintPage,
  ProductForProductionPage as PMProductionPage,
  ProductForLogisticsPage as PMLogisticsPage,
} from "@/modules/projects";
