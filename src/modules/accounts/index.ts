// src/modules/accounts/index.ts

export { default as AccountsOverviewPage } from "./pages/AccountsOverviewPage";
export { default as DailyEntryPage } from "./pages/DailyEntryPage";
export { default as ExpensesPage } from "./pages/ExpensesPage";
export { default as AccountsPage } from "./pages/AccountsPage";

// Re-export common report pages from reports module
export {
  DailyAccountsReportsPage,
  AccountsSalesReportPage,
  AccountsExpenseReportPage,
} from "@/modules/reports";

export * from "./services/accounts.service";
export * from "./types/accounts.types";