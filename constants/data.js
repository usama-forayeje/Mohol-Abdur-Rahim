// constants/data.js
export const navItems = [
  {
    title: "ড্যাশবোর্ড",
    icon: "dashboard",
    url: "/dashboard",
    permissions: ["general"],
  },
  {
    title: "গ্রাহক",
    icon: "users",
    url: "/dashboard/customers",
    permissions: ["management"],
  },
  {
    title: "অর্ডার",
    icon: "orders",
    url: "/dashboard/orders",
    permissions: ["orders_sales"],
    items: [
      {
        title: "নতুন অর্ডার",
        icon: "plus-circle",
        url: "/dashboard/orders/new",
        permissions: ["orders_sales"],
      },
      {
        title: "সব অর্ডার",
        icon: "list",
        url: "/dashboard/orders/list",
        permissions: ["orders_sales"],
      },
      {
        title: "অপেক্ষা",
        icon: "clock",
        url: "/dashboard/orders/pending",
        permissions: ["orders_sales"],
      },
      {
        title: "সম্পূর্ণ",
        icon: "check-circle",
        url: "/dashboard/orders/completed",
        permissions: ["orders_sales"],
      },
    ],
  },
  {
    title: "আমার কাজ",
    icon: "ruler",
    url: "/dashboard/my-tasks",
    permissions: ["tailoring_work", "embroidery_work", "stone_work"],
  },
  {
    title: "ইনভেন্টরি",
    icon: "inventory",
    url: "/dashboard/inventory",
    permissions: ["management"],
  },
  {
    title: "ক্যাটালগ",
    icon: "catalog",
    url: "/dashboard/catalog",
    permissions: ["management"],
  },
  {
    title: "কর্মচারী",
    icon: "users",
    url: "/dashboard/employees",
    permissions: ["management"],
  },
  {
    title: "অর্থনীতি",
    icon: "credit-card",
    permissions: ["management"],
    items: [
      {
        title: "লেনদেন",
        icon: "list",
        url: "/dashboard/finance/transactions",
        permissions: ["management"],
      },
      {
        title: "বেতন",
        icon: "dollar-sign",
        url: "/dashboard/finance/salaries",
        permissions: ["management"],
      },
      {
        title: "খরচ",
        icon: "x-circle",
        url: "/dashboard/finance/expenses",
        permissions: ["management"],
      },
    ],
  },
  {
    title: "রিপোর্ট",
    icon: "analytics",
    url: "/dashboard/reports",
    permissions: ["management"],
  },
  {
    title: "সেটিংস",
    icon: "settings",
    url: "/dashboard/settings",
    permissions: ["admin"],
  },
];
