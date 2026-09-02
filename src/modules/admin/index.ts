// src/modules/admin/index.ts

export { default as AdminPage } from "./pages/AdminPage";
export { default as StaffListPage } from "./pages/StaffListPage";
export { default as DailyTasksPage } from "./pages/DailyTasksPage";
export { default as StaffAssignmentsOverviewPage } from "./pages/StaffAssignmentsOverviewPage";
export { default as ExtraTasksPage } from "./pages/ExtraTasksPage";
export { default as ExtraStaffTasksOverviewPage } from "./pages/ExtraStaffTasksOverviewPage";
export { default as AdminLeavePage } from "./pages/AdminLeavePage";
export { default as AdminAccountsPage } from "./pages/AdminAccountsPage";

export * from "./services/adminAccount.service";
export * from "./types/adminAccount.types";
