"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  RotateCw,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Briefcase,
  Users,
  Search,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  UserX,
  X,
  Layers,
  Sparkles,
  ArrowLeft,
  Eye,
  Package
} from "lucide-react";
import PieChart from "@/components/charts/PieChart";
import Pagination from "@/components/ui/Pagination";
import ViewOrderModal from "@/modules/sales/components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "../components/ProjectProgressTimelineDropdown";
import { getAttendanceLog } from "@/modules/hr/services/attendance.service";
import {
  getAdminLeaves,
  getManagerLeaves,
  approveLeaveByAdmin,
  rejectLeaveByAdmin,
  approveLeaveByManager,
  rejectLeaveByManager
} from "@/modules/leave/services/leave.service";
import { LeaveRequest } from "@/modules/leave/types";
import {
  getPMOrders,
  getProjectManagerSalesKpiCards,
  getProjectManagerOrderStatus,
  getProjectManagerPaymentStatus,
  getProjectManagerTasksKpiCards,
  getProjectManagerStaffWiseTasks,
  getProjectManagerDesignTasks,
  getProjectManagerPrintingTasks,
  getProjectManagerProductionTasks,
  getProjectManagerLogisticsTasks,
  getProjectManagerPrintingSubDepartmentTasks,
  getProjectManagerProductionSubDepartmentTasks,
  getEssentialKpiCards,
  getCustomerApprovalPendingProjects,
  getToCloseOrders,
  getPMNewOrders,
  getPMTasksMasterList,
  getPMProjectStaffs,
  DashboardFilter,
  UserRole
} from "../services/managerOrder.service";
import PMTaskDetailsModal from "../components/PMTaskDetailsModal";
import StaffTasksStackedChart from "../components/StaffTasksStackedChart";
import EssentialKpiVerticalChart, { EssentialKpiData } from "../components/EssentialKpiVerticalChart";
import { getRoles } from "@/modules/admin/services/staff.service";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "./ProjectManagerOverviewPage.module.css";


// Helper to format Indian Rupees
const formatRupees = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val);
};

// Safe API response extractor (works for both { success, data } and direct payloads)
const extractData = (res: any, fallback: any = null) => {
  if (!res) return fallback;
  if (res.success === false) return fallback;
  if (res.success === true && res.data !== undefined) return res.data;
  return res;
};

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case "In Progress": return { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" };
    case "Packed": return { background: "#fefce8", color: "#ca8a04", border: "1px solid #fde68a" };
    case "In Transist":
    case "In Transit": return { background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" };
    case "Delivered": return { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
    case "Confirmed":
    case "New": return { background: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8" };
    case "Ongoing": return { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" };
    default: return { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
  }
}

// Types
type FilterMode = "today" | "this_month" | "specific_date" | "custom_range" | "upto_today";

interface KpiData {
  orders: number;
  sales_amount: number;
  cash_collection: number;
  orders_pending: number;
  cancelled_orders_count?: number;
  total_cancelled_orders_count?: number;
  orders_cancelled?: number;
  cancelled_amount?: number;
  cancelled_orders_amount?: number;
  total_cancelled_amount?: number;
}

interface OrderStatusData {
  quotations: number;
  new_orders: number;
  in_progress: number;
  packed: number;
  in_transit: number;
  delivered: number;
  pending_customer_approval_projects_count?: number;
  orders_to_close?: number;
  order_to_close?: number;
  closed_orders?: number;
  closed?: number;
  cancelled_orders?: number;
  cancelled?: number;
}

interface PaymentStatusData {
  paid_orders: number;
  partial_orders: number;
  balance_pending_orders: number;
  not_paid_orders: number;
}

interface TaskKpiData {
  total_assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  not_completed_tasks: number;
  not_accepted_tasks: number;
}

interface StaffWiseTaskItem {
  staff_id: number;
  staff_name: string;
  role_id: number;
  role_name?: string;
  total_assigned_tasks: number;
  not_accepted_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  not_completed_tasks: number;
}

interface DeptStats {
  department: string;
  departmentId: number;
  assigned: number;
  inProgress: number;
  completed: number;
  notCompleted: number;
  apiName: string;
}

interface SubDeptStats {
  sub_department_name?: string;
  name?: string;
  total_assigned_tasks?: number;
  assigned?: number;
  in_progress_tasks?: number;
  in_progress?: number;
  completed_tasks?: number;
  completed?: number;
  not_completed_tasks?: number;
  not_completed?: number;
  not_accepted_tasks?: number;
  not_accepted?: number;
}

export default function ProjectManagerOverviewPage({ role = "project-manager" }: { role?: UserRole }) {
  const router = useRouter();
  const { selectedCategory } = useProjectManagerStore();

  // Dynamic current date helpers (local timezone-safe)
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const currentMonth = pad(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  const allMonths = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // ─── KPI Cards Date Filter States (defaults to Today) ───────────────────────
  const [filterType, setFilterType] = useState<"date" | "month">("date");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const activeFilterLabel = (() => {
    if (filterType === "date") {
      if (selectedDate === todayStr) {
        return `Today (${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`;
      }
      try {
        const d = new Date(selectedDate);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } catch {
        return selectedDate;
      }
    } else {
      const found = allMonths.find((m) => m.value === selectedMonth);
      return `${found?.label || selectedMonth} ${currentYear}`;
    }
  })();

  // ─── Refresh State ────────────────────────────────────────────────────────
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ─── Widgets States ───────────────────────────────────────────────────────
  const [salesKpi, setSalesKpi] = useState<{ loading: boolean; error: string | null; data: KpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [uptoTodaySalesKpi, setUptoTodaySalesKpi] = useState<any>(null);

  const [orderStatus, setOrderStatus] = useState<{ loading: boolean; error: string | null; data: OrderStatusData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [paymentStatus, setPaymentStatus] = useState<{ loading: boolean; error: string | null; data: PaymentStatusData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [taskSummary, setTaskSummary] = useState<{ loading: boolean; error: string | null; data: TaskKpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  // ─── Admin/Manager Specific States ──────────────────────────────────────────
  const [attendanceStats, setAttendanceStats] = useState<{ loading: boolean; error: string | null; data: { present: number; absent: number; leave: number; halfDay: number } | null }>({
    loading: false,
    error: null,
    data: null
  });

  const [leaveRequests, setLeaveRequests] = useState<{ loading: boolean; error: string | null; data: LeaveRequest[]; pendingCount: number; approvedTodayCount: number }>({
    loading: false,
    error: null,
    data: [],
    pendingCount: 0,
    approvedTodayCount: 0
  });

  const [departmentKpi, setDepartmentKpi] = useState<{ loading: boolean; error: string | null; data: DeptStats[] }>({
    loading: true,
    error: null,
    data: []
  });

  const [staffKpi, setStaffKpi] = useState<{ loading: boolean; error: string | null; data: StaffWiseTaskItem[] }>({
    loading: true,
    error: null,
    data: []
  });

  const [essentialKpi, setEssentialKpi] = useState<{ loading: boolean; error: string | null; data: EssentialKpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  // role_id -> role_name lookup (built once from /admin/roles)
  const [roleMap, setRoleMap] = useState<Record<number, string>>({});

  // ─── Drill-down Drawer State ──────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerDept, setDrawerDept] = useState<"Printing" | "Production" | null>(null);
  const [drawerData, setDrawerData] = useState<{ loading: boolean; error: string | null; subDepts: SubDeptStats[] }>({
    loading: false,
    error: null,
    subDepts: []
  });

  // Staff Table Sorting / Filtering
  const [mounted, setMounted] = useState<boolean>(false);
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [staffSortCol, setStaffSortCol] = useState<string>("total_assigned_tasks");
  const [staffSortAsc, setStaffSortAsc] = useState<boolean>(false);
  const [viewAllStaff, setViewAllStaff] = useState<boolean>(false);

  // ─── Custom KPI & Order Status Filtered View States ──────────────────────────
  const [customViewType, setCustomViewType] = useState<"essential" | "approval" | "to_close" | "order_status" | "new_orders" | "department_tasks" | null>(null);
  const [selectedEssentialOrderStatus, setSelectedEssentialOrderStatus] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);
  const [selectedDeptTaskStatus, setSelectedDeptTaskStatus] = useState<string | null>(null);
  const [selectedCustomLabel, setSelectedCustomLabel] = useState<string | null>(null);
  const [customViewOrders, setCustomViewOrders] = useState<any[]>([]);
  const [customCurrentPage, setCustomCurrentPage] = useState<number>(1);
  const [customTotalPages, setCustomTotalPages] = useState<number>(1);
  const [customTotalCount, setCustomTotalCount] = useState<number>(0);
  const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);

  // Modal / Timeline Popup States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState<boolean>(false);
  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState<number | null>(null);

  const fetchCustomViewData = useCallback(async () => {
    if (!customViewType) return;
    setIsCustomLoading(true);
    try {
      const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
      let data: any = null;

      if ((customViewType === "essential" || customViewType === "order_status") && selectedEssentialOrderStatus) {
        data = await getPMOrders(
          customCurrentPage,
          5,
          selectedEssentialOrderStatus,
          undefined,
          undefined,
          role,
          activeCategoryId
        );
      } else if (customViewType === "new_orders") {
        data = await getPMNewOrders(
          customCurrentPage,
          5,
          role,
          activeCategoryId,
          "Confirmed"
        );
      } else if (customViewType === "department_tasks" && selectedDeptId) {
        const filters: any = {
          category_id: activeCategoryId,
          department_id: selectedDeptId
        };
        if (selectedDeptTaskStatus === "In Progress") {
          filters.task_status = "In Progress";
        }
        data = await getPMTasksMasterList(customCurrentPage, 5, filters, role);
      } else if (customViewType === "approval") {
        data = await getCustomerApprovalPendingProjects(
          customCurrentPage,
          5,
          role,
          activeCategoryId
        );
      } else if (customViewType === "to_close") {
        data = await getToCloseOrders(
          customCurrentPage,
          5,
          role,
          activeCategoryId
        );
      }

      const items = data?.items || (Array.isArray(data) ? data : []);
      setCustomViewOrders(items);

      if (data?.pagination) {
        setCustomTotalCount(data.pagination.total_count || items.length);
        setCustomTotalPages(data.pagination.total_pages || 1);
      } else {
        const total = data?.total || items.length;
        setCustomTotalCount(total);
        setCustomTotalPages(data?.total_pages || Math.ceil(total / 5) || 1);
      }
    } catch (err) {
      console.error("Failed to fetch custom view data:", err);
      setCustomViewOrders([]);
    } finally {
      setIsCustomLoading(false);
    }
  }, [customViewType, selectedEssentialOrderStatus, selectedDeptId, selectedDeptTaskStatus, customCurrentPage, selectedCategory?.id, role]);

  useEffect(() => {
    if (customViewType) {
      fetchCustomViewData();
    }
  }, [customViewType, fetchCustomViewData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Date Filters ──────────────────────────────────────────────────────────
  const getSalesKpiFilters = useCallback((): DashboardFilter => {
    const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
    if (filterType === "month" && selectedMonth) {
      return {
        month: selectedMonth,
        year: Number(currentYear),
        category_id: activeCategoryId
      };
    }
    return {
      date: selectedDate || todayStr,
      category_id: activeCategoryId
    };
  }, [filterType, selectedMonth, currentYear, selectedDate, todayStr, selectedCategory?.id]);

  const getUptoTodayFilters = useCallback((): DashboardFilter => {
    return {
      upto_today: true,
      category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART
    };
  }, [selectedCategory?.id]);

  // ─── Date Label ────────────────────────────────────────────────────────────
  const getActiveFilterLabel = () => {
    return `Sales: ${activeFilterLabel} | Tasks: Till Today`;
  };

  // ─── Fetching Logic for Section APIs ──────────────────────────────────────

  const fetchSalesKpi = useCallback(async (filters: DashboardFilter) => {
    setSalesKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerSalesKpiCards(filters, role);
      setSalesKpi({ loading: false, error: null, data: extractData(res) });
    } catch {
      setSalesKpi({ loading: false, error: "Failed to load sales indicators", data: null });
    }
  }, [role]);

  const fetchUptoTodaySalesKpi = async (filters: DashboardFilter) => {
    try {
      const res = await getProjectManagerSalesKpiCards(filters, role);
      setUptoTodaySalesKpi(extractData(res));
    } catch {
      setUptoTodaySalesKpi(null);
    }
  };

  const fetchOrderStatus = async (filters: DashboardFilter) => {
    setOrderStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerOrderStatus(filters, role);
      setOrderStatus({ loading: false, error: null, data: extractData(res) });
    } catch {
      setOrderStatus({ loading: false, error: "Failed to load order workflow", data: null });
    }
  };

  const fetchPaymentStatus = async (filters: DashboardFilter) => {
    setPaymentStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerPaymentStatus(filters, role);
      setPaymentStatus({ loading: false, error: null, data: extractData(res) });
    } catch {
      setPaymentStatus({ loading: false, error: "Failed to load payments summary", data: null });
    }
  };

  const fetchTaskSummary = async (filters: DashboardFilter) => {
    setTaskSummary((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerTasksKpiCards(filters, role);
      setTaskSummary({ loading: false, error: null, data: extractData(res) });
    } catch {
      setTaskSummary({ loading: false, error: "Failed to load task counters", data: null });
    }
  };

  const fetchDepartmentProgress = async (filters: DashboardFilter) => {
    setDepartmentKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [designRes, printingRes, productionRes, logisticsRes] = await Promise.all([
        getProjectManagerDesignTasks(filters, role).catch(() => null),
        getProjectManagerPrintingTasks(filters, role).catch(() => null),
        getProjectManagerProductionTasks(filters, role).catch(() => null),
        getProjectManagerLogisticsTasks(filters, role).catch(() => null)
      ]);

      const design = extractData(designRes);
      const printing = extractData(printingRes);
      const production = extractData(productionRes);
      const logistics = extractData(logisticsRes);

      const formatted: DeptStats[] = [
        {
          department: "Design",
          departmentId: 1,
          assigned: design?.total_assigned_tasks ?? 0,
          inProgress: design?.in_progress_tasks ?? 0,
          completed: design?.completed_tasks ?? 0,
          notCompleted: design?.not_completed_tasks ?? 0,
          apiName: "design"
        },
        {
          department: "Printing",
          departmentId: 2,
          assigned: printing?.total_assigned_tasks ?? 0,
          inProgress: printing?.in_progress_tasks ?? 0,
          completed: printing?.completed_tasks ?? 0,
          notCompleted: printing?.not_completed_tasks ?? 0,
          apiName: "printing"
        },
        {
          department: "Production",
          departmentId: 3,
          assigned: production?.total_assigned_tasks ?? 0,
          inProgress: production?.in_progress_tasks ?? 0,
          completed: production?.completed_tasks ?? 0,
          notCompleted: production?.not_completed_tasks ?? 0,
          apiName: "production"
        },
        {
          department: "Logistics",
          departmentId: 4,
          assigned: logistics?.total_assigned_tasks ?? 0,
          inProgress: logistics?.in_progress_tasks ?? 0,
          completed: logistics?.completed_tasks ?? 0,
          notCompleted: logistics?.not_completed_tasks ?? 0,
          apiName: "logistics"
        }
      ];

      setDepartmentKpi({ loading: false, error: null, data: formatted });
    } catch {
      setDepartmentKpi({ loading: false, error: "Failed to load department task progress", data: [] });
    }
  };

  const fetchStaffKpi = async (filters: DashboardFilter) => {
    setStaffKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch staff-wise tasks, roles, and project staff roster in parallel
      const [res, rolesRes, pmStaffsRes] = await Promise.all([
        getProjectManagerStaffWiseTasks(filters, role),
        getRoles().catch(() => []),
        getPMProjectStaffs(undefined, role).catch(() => [])
      ]);

      // Build role_id -> role_name map
      const map: Record<number, string> = {};
      if (Array.isArray(rolesRes)) {
        rolesRes.forEach((r: { id: number; role_name: string }) => {
          map[r.id] = r.role_name;
        });
      }
      setRoleMap(map);

      // Build staff_id -> role_name / department map from PM staff roster
      const staffRoleMap: Record<number, string> = {};
      const staffDeptMap: Record<number, string> = {};
      if (Array.isArray(pmStaffsRes)) {
        pmStaffsRes.forEach((s: any) => {
          const staffId = s.id ?? s.staff_id;
          if (staffId) {
            if (s.role_name) staffRoleMap[staffId] = s.role_name;
            if (s.department_name) staffDeptMap[staffId] = s.department_name;
          }
        });
      }

      let items: StaffWiseTaskItem[] = [];
      if (res) {
        if (res.success && res.data) {
          items = Array.isArray(res.data.items) ? res.data.items : [];
        } else if (Array.isArray(res.items)) {
          items = res.items;
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res)) {
          items = res;
        }
      }

      // Attach role_name from staffRoleMap, roleMap, or existing
      items = items.map((item) => {
        const resolvedRole =
          item.role_name ||
          staffRoleMap[item.staff_id] ||
          map[item.role_id] ||
          staffDeptMap[item.staff_id] ||
          "";
        return {
          ...item,
          role_name: resolvedRole
        };
      });

      setStaffKpi({ loading: false, error: null, data: items });
    } catch {
      setStaffKpi({ loading: false, error: "Failed to load staff stats", data: [] });
    }
  };

  const fetchEssentialKpi = async (filters: DashboardFilter) => {
    setEssentialKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getEssentialKpiCards(filters, role);
      setEssentialKpi({ loading: false, error: null, data: extractData(res) });
    } catch {
      setEssentialKpi({ loading: false, error: "Failed to load essential KPI metrics", data: null });
    }
  };


  const fetchAttendance = async (filters: DashboardFilter) => {
    setAttendanceStats((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const targetDate = filters.date || todayStr;
      const res = await getAttendanceLog({
        page: 1,
        page_size: 1,
        date: targetDate
      });
      setAttendanceStats({
        loading: false,
        error: null,
        data: {
          present: res.total_present ?? 0,
          absent: res.total_absent ?? 0,
          leave: res.total_leave ?? 0,
          halfDay: res.total_half_day ?? 0
        }
      });
    } catch {
      setAttendanceStats({
        loading: false,
        error: "Failed to load attendance",
        data: null
      });
    }
  };

  const fetchLeaves = async () => {
    setLeaveRequests((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const typeFilters = { page: 1, page_size: 10 };
      const res = await (role === "admin" ? getAdminLeaves(typeFilters) : getManagerLeaves(typeFilters));
      const items = res?.items || [];
      const pendingItems = items.filter((l: any) => l.status === "HR Approved");
      const todayDateStr = new Date().toDateString();
      const approvedToday = items.filter((l: any) => {
        if (l.status !== "Approved") return false;
        const approvedAt = l.admin_approved_at || l.manager_approved_at;
        return approvedAt && new Date(approvedAt).toDateString() === todayDateStr;
      }).length;

      setLeaveRequests({
        loading: false,
        error: null,
        data: items,
        pendingCount: pendingItems.length,
        approvedTodayCount: approvedToday
      });
    } catch {
      setLeaveRequests({
        loading: false,
        error: "Failed to load leave requests",
        data: [],
        pendingCount: 0,
        approvedTodayCount: 0
      });
    }
  };

  const handleLeaveDecision = async (leaveId: number, approve: boolean) => {
    const adminStaffId = 2; // Default system operator ID
    try {
      if (approve) {
        await (role === "admin" ? approveLeaveByAdmin(leaveId, adminStaffId) : approveLeaveByManager(leaveId, adminStaffId));
      } else {
        await (role === "admin" ? rejectLeaveByAdmin(leaveId, adminStaffId) : rejectLeaveByManager(leaveId, adminStaffId));
      }
      fetchLeaves();
    } catch (err: any) {
      console.error("Failed to approve/reject leave", err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "An error occurred";
      alert(errMsg);
    }
  };

  // Central refresh driver
  const loadDashboard = useCallback(
    async (isManual: boolean = false) => {
      if (isManual) setIsRefreshing(true);
      const salesFilters = getSalesKpiFilters();
      const uptoTodayFilters = getUptoTodayFilters();

      const promises: Promise<any>[] = [
        fetchSalesKpi(salesFilters),
        fetchUptoTodaySalesKpi(uptoTodayFilters),
        fetchOrderStatus(uptoTodayFilters),
        fetchDepartmentProgress(uptoTodayFilters),
        fetchStaffKpi(uptoTodayFilters),
        fetchEssentialKpi(uptoTodayFilters)
      ];

      if (role !== "project-manager") {
        promises.push(fetchPaymentStatus(uptoTodayFilters));
        promises.push(fetchTaskSummary(uptoTodayFilters));
      }

      if (role === "admin" || role === "manager") {
        promises.push(fetchAttendance(uptoTodayFilters));
        promises.push(fetchLeaves());
      }

      await Promise.all(promises);

      if (isManual) setIsRefreshing(false);
    },
    [getSalesKpiFilters, getUptoTodayFilters, fetchSalesKpi, role]
  );

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Re-fetch only sales KPI cards when date / month filter changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchSalesKpi(getSalesKpiFilters());
  }, [filterType, selectedDate, selectedMonth, getSalesKpiFilters, fetchSalesKpi]);

  // Drawer Fetching
  const fetchSubDepartmentKpis = async (deptName: "Printing" | "Production") => {
    setDrawerData({ loading: true, error: null, subDepts: [] });
    const filters = getUptoTodayFilters();
    try {
      let data = null;
      if (deptName === "Printing") {
        data = await getProjectManagerPrintingSubDepartmentTasks(filters, role);
      } else {
        data = await getProjectManagerProductionSubDepartmentTasks(filters, role);
      }
      const raw = extractData(data, []);
      // extractData returns null when { success: true, data: null } — guard always to array
      const subDepts: SubDeptStats[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      setDrawerData({ loading: false, error: null, subDepts });
    } catch {
      setDrawerData({ loading: false, error: `Failed to load sub-departments for ${deptName}`, subDepts: [] });
    }
  };

  const handleDepartmentClick = (dept: string) => {
    if (dept === "Printing" || dept === "Production") {
      setDrawerDept(dept);
      setDrawerOpen(true);
      fetchSubDepartmentKpis(dept);
    }
  };

  // Staff Table Sorting / Searching
  const handleSort = (col: string) => {
    if (staffSortCol === col) {
      setStaffSortAsc(!staffSortAsc);
    } else {
      setStaffSortCol(col);
      setStaffSortAsc(false);
    }
  };

  // Filter staff rows — hide zero-activity staff by default; search + sort still apply
  const getProcessedStaffList = (rawList: StaffWiseTaskItem[] = staffKpi.data || []): StaffWiseTaskItem[] => {
    const listToProcess = Array.isArray(rawList) ? rawList : [];
    let list = listToProcess.filter((item) => {
      // Default: hide staff with zero activity
      if (!viewAllStaff) {
        const total =
          (item.total_assigned_tasks ?? 0) +
          (item.in_progress_tasks ?? 0) +
          (item.completed_tasks ?? 0) +
          (item.not_completed_tasks ?? 0) +
          (item.not_accepted_tasks ?? 0);
        if (total === 0) return false;
      }
      // Search filter
      if (staffSearch.trim() !== "") {
        return item.staff_name.toLowerCase().includes(staffSearch.toLowerCase());
      }
      return true;
    });


    // Sort
    list.sort((a: any, b: any) => {
      let valA = a[staffSortCol] ?? 0;
      let valB = b[staffSortCol] ?? 0;
      if (typeof valA === "string") {
        return staffSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return staffSortAsc ? valA - valB : valB - valA;
    });

    return list;
  };

  const ordersVal = salesKpi.data?.orders ?? 0;
  const salesVal = salesKpi.data?.sales_amount ?? 0;
  const collectionVal = salesKpi.data?.cash_collection ?? 0;
  const pendingVal = salesKpi.data?.orders_pending ?? 0;
  const cancelledCountVal =
    salesKpi.data?.cancelled_orders_count ??
    salesKpi.data?.total_cancelled_orders_count ??
    salesKpi.data?.orders_cancelled ??
    0;
  const cancelledAmtVal =
    salesKpi.data?.cancelled_amount ??
    salesKpi.data?.cancelled_orders_amount ??
    salesKpi.data?.total_cancelled_amount ??
    0;

  const isPM = role === "project-manager";

  const getStatusPath = (statusName: string): string | null => {
    const prefix = role === "admin" ? "/admin" : role === "manager" ? "/manager" : "/project-manager";
    if (statusName === "New Orders") {
      return `${prefix}/new-orders`;
    }
    if (statusName === "In Progress" || statusName === "Packed" || statusName === "In Transit" || statusName === "Delivered") {
      if (role === "project-manager") {
        if (statusName === "In Progress") return "/project-manager/orders";
        if (statusName === "Packed") return "/project-manager/packed-orders";
        if (statusName === "In Transit") return "/project-manager/in-transist";
        if (statusName === "Delivered") return "/project-manager/delivered";
      }
      return `${prefix}/orders`;
    }
    return null;
  };

  // Order status list mapping
  const orderStats = orderStatus.data;
  const orderChartData: {
    name: string;
    value: number;
    color: string;
    path?: string;
    onClick?: () => void;
  }[] = [
    ...(!isPM
      ? [
          {
            name: "Quotations",
            value: orderStats?.quotations ?? 0,
            color: "#cbd5e1",
            onClick: () => {
              setCustomViewType("order_status");
              setSelectedEssentialOrderStatus("Draft");
              setSelectedCustomLabel("Quotations");
              setCustomCurrentPage(1);
            }
          },
        ]
      : []),
    {
      name: "New Orders",
      value: orderStats?.new_orders ?? 0,
      color: "#3b82f6",
      onClick: () => {
        setCustomViewType("new_orders");
        setSelectedEssentialOrderStatus("Confirmed");
        setSelectedCustomLabel("New Orders");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "Approval",
      value: orderStats?.pending_customer_approval_projects_count ?? 0,
      color: "#a855f7",
      onClick: () => {
        setCustomViewType("approval");
        setSelectedCustomLabel("Customer Approval Pending");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "In Progress",
      value: orderStats?.in_progress ?? 0,
      color: "#fbbf24",
      onClick: () => {
        setCustomViewType("order_status");
        setSelectedEssentialOrderStatus("In Progress");
        setSelectedCustomLabel("In Progress Orders");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "Packed",
      value: orderStats?.packed ?? 0,
      color: "#06b6d4",
      onClick: () => {
        setCustomViewType("order_status");
        setSelectedEssentialOrderStatus("Packed");
        setSelectedCustomLabel("Packed Orders");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "In Transit",
      value: orderStats?.in_transit ?? 0,
      color: "#38bdf8",
      onClick: () => {
        setCustomViewType("order_status");
        setSelectedEssentialOrderStatus("In Transit");
        setSelectedCustomLabel("In Transit Orders");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "Delivered",
      value: orderStats?.delivered ?? 0,
      color: "#10b981",
      onClick: () => {
        setCustomViewType("order_status");
        setSelectedEssentialOrderStatus("Delivered");
        setSelectedCustomLabel("Delivered Orders");
        setCustomCurrentPage(1);
      }
    },
    {
      name: "To Close",
      value: orderStats?.orders_to_close ?? orderStats?.order_to_close ?? 0,
      color: "#f43f5e",
      onClick: () => {
        setCustomViewType("to_close");
        setSelectedCustomLabel("To Close");
        setCustomCurrentPage(1);
      }
    }
  ];

  // Payment donut status
  const payStats = paymentStatus.data;
  const paymentChartData = [
    { name: "Paid", value: payStats?.paid_orders ?? 0, color: "#10b981" },
    { name: "Partial", value: payStats?.partial_orders ?? 0, color: "#f59e0b" },
    { name: "Not Paid", value: payStats?.not_paid_orders ?? 0, color: "#ef4444" }
  ];

  const totalPaymentsCount = paymentChartData.reduce((acc, c) => acc + c.value, 0);

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className="flex items-center gap-1.5">
              <Layers className="text-indigo-600" size={20} />
              <h1 className={styles.title}>Project Manager Overview</h1>
            </div>
          </div>
        </div>
        <div className={styles.skeletonKpiGrid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonKpiCard} />
          ))}
        </div>
      </div>
    );
  }

  if (customViewType) {
    const isApprovalView = customViewType === "approval";
    const isDeptTaskView = customViewType === "department_tasks";
    const displayLabel = selectedCustomLabel || (isApprovalView ? "Customer Approval Pending" : "To Close");
    const badgeText = isApprovalView
      ? "APPROVAL PENDING"
      : customViewType === "to_close"
      ? "TO CLOSE"
      : customViewType === "new_orders"
      ? "NEW ORDERS"
      : isDeptTaskView
      ? (selectedDeptTaskStatus?.toUpperCase() || "TASKS")
      : selectedEssentialOrderStatus === "Draft"
      ? "DRAFT / QUOTATIONS"
      : (selectedEssentialOrderStatus || "CUSTOM");

    const resetCustomView = () => {
      setCustomViewType(null);
      setSelectedEssentialOrderStatus(null);
      setSelectedCustomLabel(null);
      setSelectedDeptId(null);
      setSelectedDeptName(null);
      setSelectedDeptTaskStatus(null);
    };

    return (
      <div className={styles.page}>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <button
                onClick={resetCustomView}
                className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                title="Back to Overview"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {displayLabel}
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-500 pl-11">
              {isApprovalView
                ? `Viewing design projects awaiting customer approval`
                : customViewType === "to_close"
                ? `Viewing delivered orders awaiting final close out`
                : customViewType === "new_orders"
                ? `Viewing newly confirmed orders awaiting order number assignment`
                : isDeptTaskView
                ? `Viewing ${selectedDeptName} department tasks with status "${selectedDeptTaskStatus}"`
                : selectedEssentialOrderStatus === "Draft"
                ? `Viewing quotation orders with status Draft`
                : `Viewing orders filtered by status "${selectedEssentialOrderStatus}"`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchCustomViewData()}
              disabled={isCustomLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <RotateCw size={13} className={isCustomLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={resetCustomView}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className={`${styles.tableCard} bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col`}>
          <div className={`${styles.tableContainer} w-full overflow-x-auto`}>
            {isApprovalView ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ minWidth: "110px" }}>ORDER ID</th>
                    <th style={{ minWidth: "160px" }}>CUSTOMER</th>
                    <th style={{ minWidth: "200px" }}>PRODUCT</th>
                    <th style={{ minWidth: "120px" }}>COMPLETED ON</th>
                    <th style={{ minWidth: "130px" }}>ASSIGNED TO</th>
                    <th style={{ minWidth: "110px" }}>COMMIT DATE</th>
                    <th style={{ minWidth: "75px", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isCustomLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                        <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold text-xs">
                          <RotateCw size={14} className="animate-spin text-indigo-600" />
                          <span>Loading approval pending projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : customViewOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-slate-800">No Projects Found</div>
                          <p className="text-xs text-slate-400">There are no design projects awaiting customer approval.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customViewOrders.map((item, idx) => {
                      const pId = item.project_id || item.id;
                      return (
                        <tr key={item.id || idx}>
                          <td style={{ fontWeight: 700 }} className="align-middle text-slate-900">
                            {item.order_number ? `#${item.order_number}` : (item.order_id ? `#${item.order_id}` : "—")}
                          </td>
                          <td style={{ fontWeight: 700 }} className="align-middle">
                            <div>
                              <span className="block text-slate-900">{item.customer_name || "—"}</span>
                              {item.customer_mobile_number && (
                                <span className="text-[10px] font-normal text-slate-400 block">{item.customer_mobile_number}</span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, fontSize: "0.78rem" }} className="relative align-middle">
                            <span
                              className="hover:text-indigo-600 transition-colors cursor-pointer border-b border-dashed border-slate-300"
                              onClick={() => {
                                if (pId) {
                                  setSelectedTimelineProjectId(
                                    selectedTimelineProjectId === pId ? null : pId
                                  );
                                }
                              }}
                              title="Click to view department progress timeline"
                            >
                              {item.product_name || item.project_name || "—"}
                            </span>

                            {pId && selectedTimelineProjectId === pId && (
                              <ProjectProgressTimelineDropdown
                                projectId={pId}
                                onClose={() => setSelectedTimelineProjectId(null)}
                                position="bottom"
                                role={role}
                              />
                            )}
                          </td>
                          <td className="align-middle whitespace-nowrap text-slate-600 text-xs font-semibold">
                            {item.completed_on || item.completed_date || item.completion_date || "—"}
                          </td>
                          <td style={{ fontWeight: 700 }} className="align-middle capitalize">
                            {item.assigned_to_name || item.assigned_by_staff_name || item.created_by_name || "—"}
                          </td>
                          <td className="align-middle whitespace-nowrap text-slate-600 text-xs font-semibold">
                            {item.commit_date || "—"}
                          </td>
                          <td className="align-middle text-center">
                            <div className={styles.actionGroup}>
                              <button
                                onClick={() => {
                                  if (item.order_id || item.id) {
                                    setSelectedOrderId(item.order_id || item.id);
                                    setIsViewOpen(true);
                                  }
                                }}
                                className={styles.actionBtn}
                                title="View details"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : isDeptTaskView ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ minWidth: "95px" }}>ORDER ID</th>
                    <th style={{ minWidth: "150px" }}>CUSTOMER</th>
                    <th style={{ minWidth: "180px" }}>PRODUCT</th>
                    <th style={{ minWidth: "140px" }}>DEPARTMENT / UNIT</th>
                    <th style={{ minWidth: "130px" }}>ASSIGNED TO</th>
                    <th style={{ minWidth: "120px" }}>ASSIGNED BY</th>
                    <th style={{ minWidth: "110px" }}>DEADLINE</th>
                    <th style={{ minWidth: "100px", textAlign: "center" }}>STATUS</th>
                    <th style={{ minWidth: "75px", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isCustomLoading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                        <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold text-xs">
                          <RotateCw size={14} className="animate-spin text-indigo-600" />
                          <span>Loading {displayLabel}...</span>
                        </div>
                      </td>
                    </tr>
                  ) : customViewOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: "32px" }}>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-slate-800">No Tasks Found</div>
                          <p className="text-xs text-slate-400">
                            There are no {selectedDeptName} tasks with status {selectedDeptTaskStatus}.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customViewOrders.map((order) => {
                      const tasksList = order.tasks && order.tasks.length > 0 ? order.tasks : [null];
                      const tasksCount = tasksList.length;

                      return (
                        <React.Fragment key={order.order_id || order.id}>
                          {tasksList.map((task: any, tIdx: number) => {
                            const isFirstRow = tIdx === 0;

                            return (
                              <tr key={`${order.order_id || order.id}-${task?.id || tIdx}`}>
                                {/* Order ID */}
                                {isFirstRow && (
                                  <td rowSpan={tasksCount} style={{ fontWeight: 700 }} className="align-middle text-slate-900 whitespace-nowrap">
                                    {order.order_number ? `#${order.order_number}` : (order.order_id ? `#${order.order_id}` : `#${order.id}`)}
                                  </td>
                                )}

                                {/* Customer */}
                                {isFirstRow && (
                                  <td rowSpan={tasksCount} style={{ fontWeight: 700 }} className="align-middle">
                                    <div>
                                      <span className="block text-slate-900">{order.customer_name || "—"}</span>
                                      {order.customer_mobile_number && (
                                        <span className="text-[10px] font-normal text-slate-400 block">{order.customer_mobile_number}</span>
                                      )}
                                    </div>
                                  </td>
                                )}

                                {/* Product */}
                                <td style={{ fontWeight: 700, fontSize: "0.78rem" }} className="align-middle text-slate-800">
                                  {task?.product_name || "—"}
                                </td>

                                {/* Department / Unit */}
                                <td className="align-middle text-xs font-bold text-slate-700 capitalize">
                                  {task?.department_name || selectedDeptName || "—"}
                                  {task?.sub_department_name && (
                                    <span className="block text-[10px] text-indigo-600 font-semibold">
                                      ({task.sub_department_name})
                                    </span>
                                  )}
                                </td>

                                {/* Assigned To */}
                                <td className="align-middle text-xs font-semibold text-slate-800">
                                  {task?.assigned_to_name || "Not Accepted"}
                                </td>

                                {/* Assigned By */}
                                <td className="align-middle text-xs font-medium text-slate-600">
                                  {task?.assigned_by_name || "—"}
                                </td>

                                {/* Deadline */}
                                <td className="align-middle whitespace-nowrap text-slate-600 text-xs font-semibold">
                                  {task?.completion_time ? new Date(task.completion_time).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                </td>

                                {/* Status */}
                                <td style={{ textAlign: "center" }} className="align-middle">
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                                    style={
                                      (task?.status || selectedDeptTaskStatus) === "In Progress"
                                        ? { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" }
                                        : { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
                                    }
                                  >
                                    {task?.status || selectedDeptTaskStatus}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="align-middle text-center">
                                  <div className={styles.actionGroup}>
                                    <button
                                      onClick={() => {
                                        if (task?.id) {
                                          setSelectedTaskId(task.id);
                                          setIsTaskDetailsOpen(true);
                                        } else if (order.order_id || order.id) {
                                          setSelectedOrderId(order.order_id || order.id);
                                          setIsViewOpen(true);
                                        }
                                      }}
                                      className={styles.actionBtn}
                                      title="View task details"
                                    >
                                      <Eye size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ minWidth: "90px" }}>ORDER ID</th>
                    <th style={{ minWidth: "140px" }}>CUSTOMER</th>
                    <th style={{ minWidth: "160px" }}>PRODUCT</th>
                    <th style={{ minWidth: "60px", textAlign: "center" }}>QTY</th>
                    <th style={{ minWidth: "90px" }}>TOTAL</th>
                    <th style={{ minWidth: "105px" }}>COMMIT DATE</th>
                    <th style={{ minWidth: "120px" }}>COMPLETION DATE</th>
                    <th style={{ minWidth: "110px" }}>CREATED BY</th>
                    <th style={{ minWidth: "110px", textAlign: "center" }}>STATUS</th>
                    <th style={{ minWidth: "75px", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isCustomLoading ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "24px" }}>
                        <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold text-xs">
                          <RotateCw size={14} className="animate-spin text-indigo-600" />
                          <span>Loading {displayLabel} orders...</span>
                        </div>
                      </td>
                    </tr>
                  ) : customViewOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "32px" }}>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-slate-800">No Orders Found</div>
                          <p className="text-xs text-slate-400">
                            There are no orders matching this filter slot.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customViewOrders.map((order) => {
                      const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                      const projectsCount = projectsList.length;

                      return (
                        <React.Fragment key={order.id}>
                          {projectsList.map((proj: any, pIdx: number) => {
                            const isFirstRow = pIdx === 0;

                            return (
                              <tr key={`${order.id}-${proj?.id || pIdx}`}>
                                {isFirstRow && (
                                  <>
                                    <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap text-center text-slate-400">
                                      {order.order_number ? `#${order.order_number}` : "—"}
                                    </td>
                                    <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                      <div>
                                        <span className="block text-slate-900">{order.customer_name}</span>
                                        {order.customer_mobile_number && (
                                          <span className="text-[10px] font-normal text-slate-400 block">{order.customer_mobile_number}</span>
                                        )}
                                      </div>
                                    </td>
                                  </>
                                )}

                                <td style={{ fontWeight: 700, fontSize: "0.78rem" }} className="relative">
                                  <span
                                    className="hover:text-indigo-600 transition-colors cursor-pointer border-b border-dashed border-slate-300"
                                    onClick={() => {
                                      if (proj) {
                                        setSelectedTimelineProjectId(
                                          selectedTimelineProjectId === proj.id ? null : proj.id
                                        );
                                      }
                                    }}
                                    title="Click to view department progress timeline"
                                  >
                                    {proj ? proj.project_name : "—"}
                                  </span>

                                  {proj && selectedTimelineProjectId === proj.id && (
                                    <ProjectProgressTimelineDropdown
                                      projectId={proj.id}
                                      onClose={() => setSelectedTimelineProjectId(null)}
                                      position="bottom"
                                      role={role}
                                    />
                                  )}
                                </td>
                                <td style={{ textAlign: "center", color: "#64748b" }}>
                                  {proj ? proj.quantity : "—"}
                                </td>

                                {isFirstRow && (
                                  <>
                                    <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                      ₹{(order.final_amount || order.total_amount || 0).toLocaleString("en-IN")}
                                    </td>
                                    <td rowSpan={projectsCount} className="align-middle whitespace-nowrap" style={{ color: "#64748b", fontSize: "0.775rem" }}>
                                      {order.commit_date || "—"}
                                    </td>
                                    <td rowSpan={projectsCount} className="align-middle whitespace-nowrap" style={{ color: "#64748b", fontSize: "0.775rem" }}>
                                      {order.completion_date || "—"}
                                    </td>
                                    <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle capitalize">
                                      {order.created_by_name || "—"}
                                    </td>
                                    <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                      <span style={{
                                        display: "inline-block",
                                        padding: "3px 9px",
                                        borderRadius: "6px",
                                        fontSize: "0.70rem",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        ...getStatusBadgeStyle(order.order_status),
                                      }}>
                                        {order.order_status || "—"}
                                      </span>
                                    </td>
                                    <td rowSpan={projectsCount} className="align-middle">
                                      <div className={styles.actionGroup}>
                                        <button
                                          onClick={() => { setSelectedOrderId(order.id); setIsViewOpen(true); }}
                                          className={styles.actionBtn}
                                          title="View details"
                                        >
                                          <Eye size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {!isCustomLoading && customViewOrders.length > 0 && (
            <div className={`${styles.paginationRow} flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-t border-slate-100 px-5 py-3.5`}>
              <div className={`${styles.resultsText} text-xs font-semibold text-slate-500`}>
                Showing page <strong className="font-black text-slate-900">{customCurrentPage}</strong> of <strong className="font-black text-slate-900">{customTotalPages}</strong> ({customTotalCount} items)
              </div>
              <Pagination
                total={customTotalCount}
                limit={5}
                activePage={customCurrentPage}
                onPageChange={(page) => setCustomCurrentPage(page)}
              />
            </div>
          )}
        </div>

        <ViewOrderModal isOpen={isViewOpen} orderId={selectedOrderId} role={role === "admin" ? "admin" : role === "manager" ? "manager" : "project-manager"} onClose={() => setIsViewOpen(false)} />
        <PMTaskDetailsModal isOpen={isTaskDetailsOpen} taskId={selectedTaskId} role={role} onClose={() => setIsTaskDetailsOpen(false)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ─── Header ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className="flex items-center gap-1.5">
            <Layers className="text-indigo-600" size={20} />
            <h1 className={styles.title}>
              {role === "admin" ? "Admin Overview" : role === "manager" ? "Manager Overview" : "Project Manager Overview"}
            </h1>
          </div>
          <span className={styles.activeRangeLabel}>
            {getActiveFilterLabel()}
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Day / Previous Days Date Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8.5 shadow-3xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Day:</span>
              <input
                type="date"
                value={filterType === "date" ? selectedDate : ""}
                max={todayStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setFilterType("date");
                    setSelectedMonth("");
                  }
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                title="Filter by Today or Previous Days"
              />
            </div>

            {/* Month Filter (Current Year) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8.5 shadow-3xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Month:</span>
              <select
                value={filterType === "month" ? selectedMonth : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedMonth(e.target.value);
                    setFilterType("month");
                  }
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-1"
                title="Filter by Month of Current Year"
              >
                <option value="" disabled={filterType === "month"}>Select Month ({currentYear})</option>
                {allMonths.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} {currentYear}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick 'Today' button when non-today is active */}
            {(filterType !== "date" || selectedDate !== todayStr) && (
              <button
                onClick={() => {
                  setFilterType("date");
                  setSelectedDate(todayStr);
                  setSelectedMonth("");
                }}
                className="h-8.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                title="Reset to Today"
              >
                Today
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={isRefreshing}
              className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard Statistics"
            >
              <RotateCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5 Top KPI Cards ─── */}
      {salesKpi.loading ? (
        <div className={styles.skeletonKpiGrid}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonKpiCard} />
          ))}
        </div>
      ) : salesKpi.error ? (
        <div className={styles.errorState}>
          <AlertCircle size={16} className={styles.errorIcon} />
          <span className={styles.errorMsg}>{salesKpi.error}</span>
          <button className={styles.retryBtn} onClick={() => fetchSalesKpi(getSalesKpiFilters())}>Retry</button>
        </div>
      ) : (
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Orders</span>
              <div className={styles.kpiIconWrapper}><ShoppingBag size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{ordersVal}</strong>
            <span className={styles.subtitle}>Registered orders</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Sales</span>
              <div className={styles.kpiIconWrapper}><DollarSign size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(salesVal)}</strong>
            <span className={styles.subtitle}>Gross Sales amount</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiAmber}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Collection</span>
              <div className={styles.kpiIconWrapper}><CheckCircle2 size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(collectionVal)}</strong>
            <span className={styles.subtitle}>Collected cash amount</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiRose}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Pending Amount</span>
              <div className={styles.kpiIconWrapper}><Clock size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(pendingVal)}</strong>
            <span className={styles.subtitle}>Total outstanding balance</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Cancelled</span>
              <div className={styles.kpiIconWrapper}><XCircle size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>
              {cancelledCountVal} ({formatRupees(cancelledAmtVal)})
            </strong>
            <span className={styles.subtitle}>Cancelled orders & amount</span>
          </div>
        </div>
      )}

      {/* ─── ROW 1: 3 Section Cards ─── */}
      <div className={styles.threeColGrid}>
        {/* 1. Order status distribution */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm min-h-[350px] sm:min-h-[370px] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
                <Package size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-[19px] font-extrabold text-slate-900 tracking-tight leading-snug">
                  Order status distribution
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Total number of orders by current status
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 font-extrabold text-[11px] tracking-wider uppercase rounded-lg border border-blue-100/80">
              Workflow queue
            </span>
          </div>

          {orderStatus.loading ? (
            <div className="w-full flex-1 bg-slate-50/40 rounded-2xl border border-slate-100/90 p-4 mt-3 min-h-[250px] animate-pulse" />
          ) : orderStatus.error ? (
            <div className={styles.sectionErrorView}>
              <span className={styles.errorTitle}>Error</span>
              <span className={styles.errorSub}>{orderStatus.error}</span>
              <button className={styles.sectionRetryBtn} onClick={() => fetchOrderStatus(getUptoTodayFilters())}>Retry</button>
            </div>
          ) : (
            <div className="w-full flex-1 bg-slate-50/40 rounded-2xl border border-slate-100/90 p-3 sm:p-4 mt-3 relative min-h-[250px] flex items-center">
              <svg viewBox="0 0 680 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
                {/* Y-Axis Gridlines */}
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                  const maxVal = Math.max(...orderChartData.map(d => d.value), 5);
                  const y = 200 - ratio * 160;
                  const gridVal = Math.round(ratio * maxVal);

                  return (
                    <g key={ratio}>
                      <line x1="44" y1={y} x2="665" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                      <text x="36" y={y + 4} textAnchor="end" className="text-[12px] font-bold fill-slate-500">
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Render Column Bars */}
                {orderChartData.map((item, index) => {
                  const maxVal = Math.max(...orderChartData.map(d => d.value), 5);
                  const count = orderChartData.length || 1;
                  const slotWidth = 606 / count;
                  const slotCenter = 54 + (index + 0.5) * slotWidth;
                  const barWidth = count <= 7 ? 40 : 36;
                  const x = slotCenter - barWidth / 2;
                  const barHeight = item.value > 0 && maxVal > 0
                    ? Math.max((item.value / maxVal) * 160, 4)
                    : 4;
                  const y = 200 - barHeight;

                  return (
                    <g
                      key={item.name}
                      className={`group ${item.path || item.onClick ? "cursor-pointer" : ""}`}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.path) {
                          router.push(item.path);
                        }
                      }}
                    >
                      <title>{`${item.name}: ${item.value} orders`}</title>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={item.color}
                        rx={item.value > 0 ? "6" : "2"}
                        className="transition-all duration-300 group-hover:opacity-85"
                      />

                      {/* Count Badge over Column */}
                      <text
                        x={slotCenter}
                        y={item.value > 0 ? y - 8 : 190}
                        textAnchor="middle"
                        className="text-[13.5px] font-black fill-slate-900"
                      >
                        {item.value}
                      </text>

                      {/* X Label */}
                      <text
                        x={slotCenter}
                        y="228"
                        textAnchor="middle"
                        className={`text-[12px] font-bold fill-slate-700 ${(item.path || item.onClick) ? "group-hover:fill-blue-600 transition-colors" : ""}`}
                      >
                        {item.name}
                      </text>
                    </g>
                  );
                })}

                <line x1="44" y1="200" x2="665" y2="200" stroke="#cbd5e1" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>

{/* 2. Payments status (Shown for Admin & Manager) */}
{!isPM && (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
        Payments status
      </h3>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Cash ledger
      </span>
    </div>

    {paymentStatus.loading ? (
      <div className="flex-1 w-full bg-slate-50 rounded-lg animate-pulse" />
    ) : paymentStatus.error ? (
      <div className={styles.sectionErrorView}>
        <span className={styles.errorTitle}>Error</span>
        <span className={styles.errorSub}>{paymentStatus.error}</span>
        <button className={styles.sectionRetryBtn} onClick={() => fetchPaymentStatus(getUptoTodayFilters())}>Retry</button>
      </div>
    ) : totalPaymentsCount === 0 ? (
      <div className={styles.emptyStateContainer}>
        <span className={styles.emptyStateTitle}>No Payments Data</span>
        <span className="text-xs text-slate-400 font-medium">No order values processed.</span>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
        <div className="flex items-center justify-center relative">
          <PieChart
            data={paymentChartData}
            centerValue={String(totalPaymentsCount)}
            totalLabel="TOTAL ORDERS"
            size={170}
            minHeight="min-h-[180px]"
          />
        </div>

        <div className="space-y-3 font-semibold text-sm">
          {paymentChartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-extrabold text-slate-800 text-sm">{item.name}</span>
              </div>
              <span className="font-black text-slate-900 text-lg">{item.value}</span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between bg-rose-50/70 border border-rose-100/80 p-2.5 rounded-xl">
            <span className="text-xs font-bold text-rose-700">Total Pending</span>
            <span className="text-base font-black text-rose-700">
              {formatRupees(
                uptoTodaySalesKpi?.total_cash_pending ??
                uptoTodaySalesKpi?.orders_pending ??
                uptoTodaySalesKpi?.total_pending_balance ??
                0
              )}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
)}

{/* 2. Department-wise tasks */}
<div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
  <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
      Department-wise tasks
    </h3>
    <p className="text-xs font-semibold text-slate-400">
      Task breakdown by department — click bar to view tasks
    </p>
  </div>

  {departmentKpi.loading ? (
    <div className="flex-1 w-full bg-slate-50 rounded-lg animate-pulse" />
  ) : departmentKpi.error ? (
    <div className={styles.sectionErrorView}>
      <span className={styles.errorTitle}>Error</span>
      <span className={styles.errorSub}>{departmentKpi.error}</span>
      <button className={styles.sectionRetryBtn} onClick={() => fetchDepartmentProgress(getUptoTodayFilters())}>Retry</button>
    </div>
  ) : (
    <>
      <div className="w-full flex-1 relative">
        <svg viewBox="0 0 520 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = 195 - ratio * 170;
            const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress]);
            const maxLimit = Math.max(...allVals, 14);
            const gridVal = Math.round(ratio * maxLimit);

            return (
              <g key={ratio} className="opacity-40">
                <line x1="38" y1={y} x2="500" y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                <text x="28" y={y + 4} textAnchor="end" className="text-[12px] font-extrabold fill-slate-500">{gridVal}</text>
              </g>
            );
          })}

          {departmentKpi.data.map((item, grpIdx) => {
            const xStart = 60 + grpIdx * 120;
            const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress]);
            const maxLimit = Math.max(...allVals, 14);

            const assignedHeight = maxLimit > 0 ? (item.assigned / maxLimit) * 170 : 0;
            const assignedY = 195 - assignedHeight;

            const inProgressHeight = maxLimit > 0 ? (item.inProgress / maxLimit) * 170 : 0;
            const inProgressY = 195 - inProgressHeight;

            return (
              <g key={item.department}>
                {/* Assigned bar group */}
                <g
                  className="group/assigned cursor-pointer"
                  onClick={() => {
                    setCustomViewType("department_tasks");
                    setSelectedDeptId(item.departmentId);
                    setSelectedDeptName(item.department);
                    setSelectedDeptTaskStatus("Assigned");
                    setSelectedCustomLabel(`${item.department} — Assigned Tasks`);
                    setCustomCurrentPage(1);
                  }}
                >
                  <title>{`Click to view ${item.department} assigned tasks (${item.assigned})`}</title>
                  <rect
                    x={xStart}
                    y={assignedY}
                    width={34}
                    height={Math.max(assignedHeight, 2)}
                    fill="#6366f1"
                    rx="5"
                    className="transition-all duration-300 group-hover/assigned:opacity-80"
                  />
                  {item.assigned > 0 && (
                    <text x={xStart + 17} y={assignedY - 7} textAnchor="middle" className="text-[14px] font-black fill-slate-900 group-hover/assigned:fill-indigo-600 transition-colors">
                      {item.assigned}
                    </text>
                  )}
                </g>

                {/* In progress bar group */}
                <g
                  className="group/progress cursor-pointer"
                  onClick={() => {
                    setCustomViewType("department_tasks");
                    setSelectedDeptId(item.departmentId);
                    setSelectedDeptName(item.department);
                    setSelectedDeptTaskStatus("In Progress");
                    setSelectedCustomLabel(`${item.department} — In Progress Tasks`);
                    setCustomCurrentPage(1);
                  }}
                >
                  <title>{`Click to view ${item.department} in progress tasks (${item.inProgress})`}</title>
                  <rect
                    x={xStart + 40}
                    y={inProgressY}
                    width={34}
                    height={Math.max(inProgressHeight, 2)}
                    fill="#f59e0b"
                    rx="5"
                    className="transition-all duration-300 group-hover/progress:opacity-80"
                  />
                  {item.inProgress > 0 && (
                    <text x={xStart + 57} y={inProgressY - 7} textAnchor="middle" className="text-[14px] font-black fill-slate-900 group-hover/progress:fill-amber-600 transition-colors">
                      {item.inProgress}
                    </text>
                  )}
                </g>

                <text
                  x={xStart + 37}
                  y="212"
                  textAnchor="middle"
                  className="text-[13.5px] font-extrabold fill-slate-700"
                >
                  {item.department}
                </text>
              </g>
            );
          })}

          <line x1="38" y1="195" x2="500" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-sm font-black text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 block" /> Assigned
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block" /> In progress
        </div>
      </div>
    </>
  )}
</div>

{/* 4. General task summary / Attendance & approvals (Shown for Admin & Manager) */}
{!isPM && (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[310px] sm:min-h-[330px] flex flex-col justify-between">
    {role === "admin" || role === "manager" ? (
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Attendance & approvals
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Executive check</span>
          </div>

          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Attendance Summary</h4>
            {attendanceStats.loading ? (
              <div className="h-10 bg-slate-100 rounded animate-pulse" />
            ) : attendanceStats.error ? (
              <span className="text-xs text-rose-500">{attendanceStats.error}</span>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 border border-emerald-100/60 p-2.5 rounded-lg text-center">
                  <span className="text-base font-extrabold text-emerald-800">{attendanceStats.data?.present ?? 0}</span>
                  <div className="text-[9.5px] font-bold text-emerald-600">Present</div>
                </div>
                <div className="bg-rose-50 border border-rose-100/60 p-2.5 rounded-lg text-center">
                  <span className="text-base font-extrabold text-rose-800">{attendanceStats.data?.absent ?? 0}</span>
                  <div className="text-[9.5px] font-bold text-rose-600">Absent</div>
                </div>
                <div className="bg-amber-50 border border-amber-100/60 p-2.5 rounded-lg text-center">
                  <span className="text-base font-extrabold text-amber-800">{attendanceStats.data?.leave ?? 0}</span>
                  <div className="text-[9.5px] font-bold text-amber-600">On Leave</div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Pending Leaves ({leaveRequests.pendingCount})</h4>
              {leaveRequests.approvedTodayCount > 0 && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {leaveRequests.approvedTodayCount} Approved Today
                </span>
              )}
            </div>

            {leaveRequests.loading ? (
              <div className="animate-pulse flex flex-col gap-2 mt-2">
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ) : leaveRequests.error ? (
              <span className="text-xs text-rose-500">{leaveRequests.error}</span>
            ) : leaveRequests.data.filter(l => l.status === "HR Approved").length === 0 ? (
              <div className={styles.emptyStateContainer} style={{ minHeight: "80px", padding: "10px" }}>
                <span className={styles.emptyStateTitle}>All processed</span>
                <span className="text-[9px] text-slate-400">All leave requests have been cleared.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2 max-h-[140px] overflow-y-auto pr-1">
                {leaveRequests.data
                  .filter(l => l.status === "HR Approved")
                  .slice(0, 2)
                  .map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs gap-2">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="font-bold text-slate-700 truncate">{leave.staff_name}</span>
                        <span className="text-[9px] text-slate-400 truncate">
                          {leave.leave_type} • {new Date(leave.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleLeaveDecision(leave.id, true)}
                          className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                          title="Approve Leave"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, false)}
                          className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                          title="Reject Leave"
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <a
            href={role === "admin" ? "/admin/hr/leave" : "/manager/hr/leave"}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            Manage All Leaves <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    ) : (
      <>
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            General task summary
          </h3>
        </div>

        {taskSummary.loading ? (
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : taskSummary.error ? (
          <div className={styles.sectionErrorView}>
            <span className={styles.errorTitle}>Error</span>
            <span className={styles.errorSub}>{taskSummary.error}</span>
            <button className={styles.sectionRetryBtn} onClick={() => fetchTaskSummary(getUptoTodayFilters())}>Retry</button>
          </div>
        ) : !taskSummary.data ? (
          <div className={styles.emptyStateContainer}>
            <span className={styles.emptyStateTitle}>No Task Data available</span>
          </div>
        ) : (
          <div className="space-y-4 my-auto">
            {/* Top Block: TOTAL ASSIGNED */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 text-center space-y-1">
              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest block">
                TOTAL ASSIGNED
              </span>
              <span className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight block">
                {taskSummary.data.total_assigned_tasks ?? 45}
              </span>
            </div>

            {/* Bottom 3 Cards Row */}
            <div className="grid grid-cols-3 gap-3">
              {/* COMPLETED */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  COMPLETED
                </span>
                <span className="text-2xl font-black text-emerald-600 block">
                  {taskSummary.data.completed_tasks ?? 0}
                </span>
              </div>

              {/* IN PROGRESS */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  IN PROGRESS
                </span>
                <span className="text-2xl font-black text-amber-600 block">
                  {taskSummary.data.in_progress_tasks ?? 0}
                </span>
              </div>

              {/* NOT ACCEPTED */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  NOT ACCEPTED
                </span>
                <span className="text-2xl font-black text-indigo-600 block">
                  {taskSummary.data.not_accepted_tasks ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}

        {/* 3. Essential KPI metrics */}
        <EssentialKpiVerticalChart
          data={essentialKpi.data}
          isLoading={essentialKpi.loading}
          isError={Boolean(essentialKpi.error)}
          errorMsg={essentialKpi.error || ""}
          onRetry={() => fetchEssentialKpi(getUptoTodayFilters())}
          onSelectMetric={(orderStatus, labelName) => {
            setCustomViewType("essential");
            setSelectedEssentialOrderStatus(orderStatus);
            setSelectedCustomLabel(labelName);
            setCustomCurrentPage(1);
          }}
        />

        {/* 6. Tasks by staff */}
        <StaffTasksStackedChart
          data={staffKpi.data}
          isLoading={staffKpi.loading}
        />
      </div>
    </div>
  );
}