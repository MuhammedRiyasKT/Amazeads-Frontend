// src/constants/sidebar.ts
export interface SidebarSubItem {
  name: string;
  path: string;
  badge?: string | number;
}

export interface SidebarMenuItem {
  name: string;
  path: string;
  iconName: string;
  hasArrow?: boolean;
  subItems?: SidebarSubItem[];
}

export const SIDEBAR_MENU_BY_ROLE: Record<string, SidebarMenuItem[]> = {
  profile: [
    { name: "Dashboard", path: "/profile", iconName: "LayoutGrid" },
    { name: "Attendance", path: "/profile/attendance", iconName: "CalendarDays" },
    { name: "Daily Task Report", path: "/profile/report", iconName: "ClipboardList" },
    { name: "Leave Requests", path: "/profile/leave", iconName: "CalendarDays" },
  ],
  sales: [
    { name: "Overview", path: "/sales", iconName: "LayoutGrid", hasArrow: false },
    {
      name: "Quotation",
      path: "/sales/create-quotation",
      iconName: "FileText",
      hasArrow: true,
      subItems: [
        { name: "Create Quotation", path: "/sales/create-quotation" },
        { name: "List Quotation", path: "/sales/list-quotation" },
      ]
    },
    {
      name: "Sale",
      path: "/sales/create-order",
      iconName: "ShoppingBag",
      hasArrow: true,
      subItems: [
        { name: "Create Order", path: "/sales/create-order" },
        { name: "Orders", path: "/sales/orders" },
        { name: "Payment", path: "/sales/payments" },
        { name: "Orders To Dispatch", path: "/sales/order-dispatch" },
        { name: "Closed / Completed", path: "/sales/closed-orders" },
        { name: "Cancel Orders", path: "/sales/cancel" }
      ]
    },
    {
      name: "Project",
      path: "/sales/projects",
      iconName: "Folder",
      hasArrow: true,
      subItems: [
        { name: "Projects", path: "/sales/projects" },
        { name: "Projects To Design", path: "/sales/projects-to-design" },
        { name: "Projects To Print", path: "/sales/projects-to-print" },
      ]
    },
    {
      name: "Activities",
      path: "/sales/design-approval",
      iconName: "CheckSquare",
      hasArrow: true,
      subItems: [
        { name: "Design Approval", path: "/sales/design-approval" },
        { name: "Orders To Close", path: "/sales/orders-to-close" },
      ]
    },
    { name: "Sales Reports", path: "/sales/reports", iconName: "CalendarDays", hasArrow: false },
    { name: "Daily Task", path: "/sales/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Customer", path: "/sales/customers", iconName: "Users", hasArrow: false },
    { name: "Back To Category", path: "/sales", iconName: "ArrowLeft", hasArrow: false },
  ],
  admin: [
    { name: "Overview", path: "/admin", iconName: "LayoutGrid", hasArrow: false },
    {
      name: "Orders",
      path: "",
      iconName: "ShoppingBag",
      hasArrow: true,
      subItems: [
        { name: "New Orders List", path: "/admin/new-orders" },
        { name: "Ongoing Orders List", path: "/admin/orders" },
        { name: "Closed / Completed Orders", path: "/admin/closed" },
        { name: "Orders To Dispatch", path: "/admin/order-dispatch" },
        { name: "Cancel Orders", path: "/admin/cancel" }

      ]
    },
    {
      name: "Project",
      path: "/admin/projects",
      iconName: "Folder",
      hasArrow: true,
      subItems: [
        { name: "Projects", path: "/admin/projects" },
        { name: "ProjectTo Design", path: "/admin/productfor-design" },
        { name: "ProjectTo Print", path: "/admin/productfor-print" },
        { name: "ProjectTo Production", path: "/admin/productfor-production" },
        { name: "ProjectTo Logistics", path: "/admin/productfor-logistics" },
      ]
    },
    { name: "Task", path: "/admin/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/admin/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    {
      name: "HR & Staff",
      path: "/admin/hr/staff",
      iconName: "Users",
      hasArrow: true,
      subItems: [
        { name: "Staff List", path: "/admin/hr/staff" },
        { name: "Leave Requests", path: "/admin/hr/leave" },
      ]
    },
    { name: "Product", path: "/admin/products", iconName: "Box", hasArrow: false },
    { name: "Compliances", path: "/admin/compliances", iconName: "ShieldCheck", hasArrow: false },
    { name: "Accounts", path: "/admin/accounts", iconName: "Landmark", hasArrow: false },
    { name: "Customer", path: "/admin/customers", iconName: "Users", hasArrow: false },
  ],
  manager: [
    { name: "Overview", path: "/manager", iconName: "LayoutGrid", hasArrow: false },
    {
      name: "Orders",
      path: "",
      iconName: "ShoppingBag",
      hasArrow: true,
      subItems: [
        { name: "New Orders List", path: "/manager/new-orders" },
        { name: "Ongoing Orders List", path: "/manager/orders" },
        { name: "Closed / Completed Orders", path: "/manager/closed" },
        { name: "Orders To Dispatch", path: "/manager/order-dispatch" },
        { name: "Cancel Orders", path: "/manager/cancel" }
      ]
    },
    {
      name: "Project",
      path: "/manager/projects",
      iconName: "Folder",
      hasArrow: true,
      subItems: [
        { name: "Projects", path: "/manager/projects" },
        { name: "ProjectTo Design", path: "/manager/productfor-design" },
        { name: "ProjectTo Print", path: "/manager/productfor-print" },
        { name: "ProjectTo Production", path: "/manager/productfor-production" },
        { name: "ProjectTo Logistics", path: "/manager/productfor-logistics" },
      ]
    },
    { name: "Task", path: "/manager/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/manager/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Product", path: "/admin/products", iconName: "Box", hasArrow: false },
    { name: "Compliances", path: "/admin/compliances", iconName: "ShieldCheck", hasArrow: false },
    { name: "Accounts", path: "/admin/accounts", iconName: "Landmark", hasArrow: false },
  ],
  "project manager": [
    { name: "Overview", path: "/project-manager", iconName: "LayoutGrid", hasArrow: false },
    {
      name: "Orders",
      path: "",
      iconName: "ShoppingBag",
      hasArrow: true,
      subItems: [
        { name: "New Orders List", path: "/project-manager/new-orders" },
        { name: "Ongoing Orders List", path: "/project-manager/orders" },
        { name: "Orders To Dispatch", path: "/project-manager/order-dispatch" },
        { name: "Closed / Completed Orders", path: "/project-manager/closed" },
        { name: "Cancel Orders", path: "/project-manager/cancel" }
      ]
    },
    {
      name: "Project",
      path: "/project-manager/projects",
      iconName: "Folder",
      hasArrow: true,
      subItems: [
        { name: "Projects", path: "/project-manager/projects" },
        { name: "ProjectTo Design", path: "/project-manager/productfor-design" },
        { name: "ProjectTo Print", path: "/project-manager/productfor-print" },
        { name: "ProjectTo Production", path: "/project-manager/productfor-production" },
        { name: "ProjectTo Logistics", path: "/project-manager/productfor-logistics" },
      ]
    },
    { name: "Tasks", path: "/project-manager/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/project-manager/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    {
      name: "Courier & Tracking",
      path: "/project-manager/packed-orders",
      iconName: "Truck",
      hasArrow: false,
      subItems: [
        { name: "Packed Orders", path: "/project-manager/packed-orders" },
        { name: "In Transist", path: "/project-manager/in-transist" },
        { name: "Delivered Orders", path: "/project-manager/delivered" },
      ]
    },
    { name: "Expenses", path: "/project-manager/expenses", iconName: "CreditCard", hasArrow: false },

  ],
  printing: [
    { name: "Overview", path: "/printing/overview", iconName: "LayoutGrid", hasArrow: false },
    { name: "Task", path: "/printing", iconName: "ClipboardList" },
    { name: "Daily Task", path: "/printing/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/printing/timeline", iconName: "TrendingUp" },
  ],
  designing: [
    { name: "Overview", path: "/designing", iconName: "LayoutGrid", hasArrow: false },
    { name: "Task", path: "/designing/tasks", iconName: "ClipboardList" },
    { name: "Daily Task", path: "/designing/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/designing/timeline", iconName: "TrendingUp" },
  ],
  production: [
    { name: "Overview", path: "/production/overview", iconName: "LayoutGrid", hasArrow: false },
    { name: "Task", path: "/production", iconName: "ClipboardList" },
    { name: "Daily Task", path: "/production/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/production/timeline", iconName: "TrendingUp" },
  ],
  logistics: [
    { name: "Overview", path: "/logistics", iconName: "LayoutGrid", hasArrow: false },
    { name: "Task", path: "/logistics/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Packed Orders", path: "/logistics/packed-orders", iconName: "PackageCheck", hasArrow: false },
    { name: "Daily Task", path: "/logistics/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Status timeline", path: "/logistics/timeline", iconName: "TrendingUp", hasArrow: false },
  ],
  hr: [
    { name: "Overview", path: "/hr", iconName: "LayoutGrid", hasArrow: false },
    { name: "Daily Task", path: "/hr/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Leave Requests", path: "/hr/leave", iconName: "CalendarCheck", hasArrow: false },
    { name: "Attendance", path: "/hr/attendance", iconName: "CalendarDays", hasArrow: false },
  ],
  accounts: [
    { name: "Overview", path: "/accounts", iconName: "LayoutGrid", hasArrow: false },
    { name: "Daily Entry", path: "/accounts/daily-entry", iconName: "ClipboardCheck", hasArrow: false },
    { name: "Accounts", path: "/accounts/accounts", iconName: "Wallet", hasArrow: false },
    { name: "Compliances", path: "/accounts/compliances", iconName: "ShieldCheck", hasArrow: false },
    { name: "Accounts Reports", path: "/accounts/daily-report", iconName: "CalendarDays", hasArrow: false },
    { name: "Expenses", path: "/accounts/expenses", iconName: "ReceiptText", hasArrow: false },
    { name: "Daily Task", path: "/accounts/daily-tasks", iconName: "Clock", hasArrow: false },
  ],
  marketing: [
    { name: "Daily Task", path: "/marketing/daily-tasks", iconName: "ClipboardList", hasArrow: false },
  ]

};

export const SIDEBAR_FOOTER_ITEMS = [
  { name: "Settings", path: "/settings", iconName: "Settings" },
  { name: "Help Center", path: "/help", iconName: "HelpCircle" },
];