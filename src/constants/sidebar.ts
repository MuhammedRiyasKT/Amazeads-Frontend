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
    { name: "Attendance", path: "/profile/attendance", iconName: "CalendarDays" },
    { name: "Daily Task Report", path: "/profile/report", iconName: "ClipboardList" },
    { name: "Leave Requests", path: "/profile/leave", iconName: "CalendarDays" },
  ],
  sales: [
    { name: "Overview", path: "/sales", iconName: "LayoutGrid", hasArrow: false },
    { 
      name: "Sale", 
      path: "/sales/create-order", 
      iconName: "ShoppingBag", 
      hasArrow: true,
      subItems: [
        { name: "Create Order", path: "/sales/create-order" },
        { name: "Orders", path: "/sales/orders" },
        { name: "Payment", path: "/sales/payments" },
      ]
    },
    { 
      name: "Project", 
      path: "/sales/projects", 
      iconName: "Folder", 
      hasArrow: true,
      subItems: [
        { name: "Projects", path: "/sales/projects"},
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
        { name: "Orders To Close", path: "/sales/orders-to-close"},
      ]
    },
    { name: "Daily Task", path: "/sales/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { name: "Customer", path: "/sales/customers", iconName: "Users", hasArrow: false },
  ],
  admin: [
    { name: "Overview", path: "/admin", iconName: "LayoutGrid", hasArrow: false },
    { name: "Orders", path: "/admin/orders", iconName: "ShoppingBag", hasArrow: false },
    { name: "Project", path: "/admin/projects", iconName: "Folder", hasArrow: false },
    { name: "Task", path: "/admin/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/admin/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { 
      name: "HR & Staff", 
      path: "/admin/hr/staff", 
      iconName: "Users", 
      hasArrow: true,
      subItems: [
        { name: "Staff List", path: "/admin/hr/staff" },
        { name: "Attendance", path: "/admin/hr/attendance" },
        { name: "Leave Requests", path: "/admin/hr/leave" },
      ]
    },
    { name: "Product", path: "/admin/products", iconName: "Box", hasArrow: false },
    { name: "Accounts", path: "/admin/accounts", iconName: "Landmark", hasArrow: false },
  ],
  manager: [
    { name: "Overview", path: "/manager", iconName: "LayoutGrid", hasArrow: false },
    { name: "Orders", path: "/manager/orders", iconName: "ShoppingBag", hasArrow: false },
    { name: "Project", path: "/manager/projects", iconName: "Folder", hasArrow: false },
    { name: "Task", path: "/manager/tasks", iconName: "CheckSquare", hasArrow: false },
    { name: "Daily Task", path: "/manager/daily-tasks", iconName: "ClipboardList", hasArrow: false },
    { 
      name: "HR & Staff", 
      path: "/manager/hr/staff", 
      iconName: "Users", 
      hasArrow: true,
      subItems: [
        { name: "Staff List", path: "/manager/hr/staff" },
        { name: "Attendance", path: "/manager/hr/attendance" },
        { name: "Leave Requests", path: "/manager/hr/leave" },
      ]
    },
    { name: "Product", path: "/admin/products", iconName: "Box", hasArrow: false },
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
        { name: "All Orders List", path: "/project-manager/orders" },
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
    { name: "Courier & Tracking", 
      path: "/project-manager/packed-orders", 
      iconName: "Truck", 
      hasArrow: false,
      subItems: [
        { name: "Packed Orders", path: "/project-manager/packed-orders" },
        { name: "In Transist", path: "/project-manager/in-transist" },
        { name: "Closed", path: "/project-manager/closed"},
      ]
    },
    { name: "Expenses", path: "/project-manager/expenses", iconName: "CreditCard", hasArrow: false },
  
  ],
  printing: [
    { name: "Task", path: "/printing", iconName: "ClipboardList" }, 
    { name: "Daily Task", path: "/printing/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/printing/timeline", iconName: "TrendingUp" },
    
  ],
  designing: [
    { name: "Task", path: "/designing/tasks", iconName: "ClipboardList" },
    { name: "Daily Task", path: "/designing/daily-tasks", iconName: "Clock" },
    { name: "Status Timeline", path: "/designing/timeline", iconName: "TrendingUp" },
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
    { name: "Leave Requests", path: "/hr/leave", iconName: "CalendarCheck", hasArrow: false },
    { name: "Attendance", path: "/hr/attendance", iconName: "CalendarDays", hasArrow: false },
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
  ]

};

export const SIDEBAR_FOOTER_ITEMS = [
  { name: "Settings", path: "/settings", iconName: "Settings" },
  { name: "Help Center", path: "/help", iconName: "HelpCircle" },
];