// src/constants/sidebar.ts

export interface SidebarSubItem {
  name: string;
  path: string;
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
    { name: "My Attendance", path: "/profile/attendance", iconName: "Calendar" },
    { name: "Daily Task Report", path: "/profile/report", iconName: "ClipboardList" },
    { name: "Leave Requests", path: "/profile/leaves", iconName: "CalendarDays" },
  ],
  sales: [
    { name: "Overview", path: "/sales", iconName: "LayoutGrid", hasArrow: false },
    { 
      name: "Sale", 
      path: "", // ഡ്രോപ്പ്ഡൗൺ ആയതിനാൽ മെയിൻ പാത്ത് വെറും ശൂന്യമായി വിടാം
      iconName: "ShoppingBag", 
      hasArrow: true,
      subItems: [
        { name: "Create Order", path: "/sales/create-order" },
        { name: "Orders", path: "/sales/orders" },
        { name: "Payment", path: "/sales/payments" },
      ]
    },
    { name: "Project", path: "/sales/projects", iconName: "Folder", hasArrow: true },
    { name: "Daily Task", path: "/sales/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Customer", path: "/sales/customers", iconName: "Users", hasArrow: false },
    { name: "Status timeline", path: "/sales/timeline", iconName: "TrendingUp", hasArrow: false },
  ],
  admin: [
    { name: "Overview", path: "/admin", iconName: "LayoutGrid", hasArrow: false },
    { name: "Orders", path: "/admin/orders", iconName: "ShoppingBag", hasArrow: false },
    { name: "Project", path: "/admin/projects", iconName: "Folder", hasArrow: false },
    { name: "Task", path: "/admin/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/admin/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { 
      name: "HR & Staff", 
      path: "", 
      iconName: "Users", 
      hasArrow: true,
      subItems: [
        { name: "Staff List", path: "/admin/hr/staff" },
        { name: "Attendance", path: "/admin/hr/attendance" },
      ]
    },
    { name: "Product", path: "/admin/products", iconName: "Box", hasArrow: false },
    { name: "Accounts", path: "/admin/accounts", iconName: "Landmark", hasArrow: false },
  ],
  "project manager": [
    { name: "Overview", path: "/project-manager", iconName: "LayoutGrid", hasArrow: false },
    { name: "Orders", path: "/project-manager/orders", iconName: "ShoppingBag" },
    { name: "Project", path: "/project-manager/projects", iconName: "Folder", hasArrow: true },
    { name: "Task", path: "/project-manager/tasks", iconName: "CheckSquare" },
    { name: "Daily Task", path: "/project-manager/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Courier & Tracking", path: "/project-manager/courier", iconName: "Truck" },
    { name: "Expenses", path: "/project-manager/expenses", iconName: "CreditCard" },
    { name: "Status Timeline", path: "/project-manager/timeline", iconName: "TrendingUp" },
  ],
  printing: [
    { name: "Task", path: "/printing", iconName: "ClipboardList" }, // ഇവിടെ "/printing/tasks" എന്ന് നൽകുക
    { name: "Daily Task", path: "/printing/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/printing/timeline", iconName: "TrendingUp" },
  ],
  designing: [
    { name: "Task", path: "/designing", iconName: "ClipboardList" },
    { name: "Daily Task", path: "/projects/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/projects/timeline", iconName: "TrendingUp" },
  ],
  production: [
    { name: "Task", path: "/production/laser-cutting", iconName: "ClipboardList" }, // പ്രൊഡക്ഷൻ മെയിൻ റൂട്ട്
    { name: "Daily Task", path: "/production/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/production/timeline", iconName: "TrendingUp" },
  ],
  logistics: [
    { name: "Overview", path: "/logistics", iconName: "LayoutGrid", hasArrow: false },
    { name: "Task", path: "/logistics/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/logistics/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Status timeline", path: "/logistics/timeline", iconName: "TrendingUp", hasArrow: false },
  ],
  hr: [
    { name: "Overview", path: "/hr", iconName: "LayoutGrid", hasArrow: false },
    { name: "Daily Task", path: "/hr/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Attendance Entry", path: "/hr/attendance-entry", iconName: "UserCheck", hasArrow: false },
    { name: "Attendance Register", path: "/hr/attendance-register", iconName: "BookOpen", hasArrow: false },
    { name: "Status timeline", path: "/hr/timeline", iconName: "TrendingUp", hasArrow: false },
  ],
   accounts: [
    { name: "Overview", path: "/accounts", iconName: "LayoutGrid", hasArrow: false },
    { name: "Daily Entry", path: "/accounts/daily-entry", iconName: "BookOpen", hasArrow: false },
    { name: "History Register", path: "/accounts/history-register", iconName: "History", hasArrow: false },
    { name: "Compliance", path: "/accounts/compliance", iconName: "ShieldCheck", hasArrow: false },
    { name: "Payment", path: "/accounts/payment", iconName: "CreditCard", hasArrow: false },
    { name: "Bank Account", path: "/accounts/bank-account", iconName: "Landmark", hasArrow: false },
    { name: "Daily Task", path: "/accounts/daily-tasks", iconName: "Clock", hasArrow: false },
  ],
  marketing: [
    { name: "Overview", path: "/marketing", iconName: "LayoutGrid", hasArrow: false },
    { name: "Daily Task", path: "/marketing/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Status timeline", path: "/marketing/timeline", iconName: "TrendingUp", hasArrow: false },
  ]

};

export const SIDEBAR_FOOTER_ITEMS = [
  { name: "Settings", path: "/settings", iconName: "Settings" },
  { name: "Help Center", path: "/help", iconName: "HelpCircle" },
];