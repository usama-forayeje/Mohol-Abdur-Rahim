// Define all possible permissions
export const PERMISSIONS = {
  // Dashboard & Overview
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_SYSTEM_HEALTH: "view_system_health",

  // Order Management
  VIEW_ALL_ORDERS: "view_all_orders",
  VIEW_OWN_ORDERS: "view_own_orders",
  CREATE_ORDERS: "create_orders",
  UPDATE_ORDERS: "update_orders",
  DELETE_ORDERS: "delete_orders",
  ASSIGN_ORDERS: "assign_orders",
  TRACK_DELIVERY: "track_delivery",

  // Customer Management
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",
  VIEW_CUSTOMER_ANALYTICS: "view_customer_analytics",
  MANAGE_MEASUREMENTS: "manage_measurements",
  VIEW_FEEDBACK: "view_feedback",

  // Tailoring & Production
  VIEW_TAILORING_WORK: "view_tailoring_work",
  MANAGE_CUTTING: "manage_cutting",
  MANAGE_EMBROIDERY: "manage_embroidery",
  MANAGE_STONE_WORK: "manage_stone_work",
  MANAGE_SEWING: "manage_sewing",
  QUALITY_CONTROL: "quality_control",
  VIEW_WORK_LOG: "view_work_log",
  ASSIGN_TASKS: "assign_tasks",

  // Inventory & Fabrics
  VIEW_INVENTORY: "view_inventory",
  MANAGE_FABRICS: "manage_fabrics",
  MANAGE_FABRIC_SALES: "manage_fabric_sales",
  MANAGE_RAW_MATERIALS: "manage_raw_materials",
  VIEW_CATALOG: "view_catalog",
  MANAGE_CATALOG: "manage_catalog",
  PURCHASE_MANAGEMENT: "purchase_management",

  // Financial Management
  VIEW_TRANSACTIONS: "view_transactions",
  MANAGE_PAYMENTS: "manage_payments",
  MANAGE_SALARIES: "manage_salaries",
  MANAGE_JOB_PAYMENTS: "manage_job_payments",
  MANAGE_EXPENSES: "manage_expenses",
  VIEW_FINANCIAL_REPORTS: "view_financial_reports",
  MANAGE_PERSONAL_ACCOUNTS: "manage_personal_accounts",

  // User & Shop Management
  MANAGE_USERS: "manage_users",
  MANAGE_SHOPS: "manage_shops",
  MANAGE_ROLES: "manage_roles",
  VIEW_AUDIT_LOGS: "view_audit_logs",

  // System & Settings
  MANAGE_SYSTEM: "manage_system",
  MANAGE_SETTINGS: "manage_settings",
  BACKUP_DATA: "backup_data",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  // Reports & Analytics
  VIEW_REPORTS: "view_reports",
  CREATE_CUSTOM_REPORTS: "create_custom_reports",
  VIEW_PERFORMANCE_ANALYTICS: "view_performance_analytics",
  EXPORT_DATA: "export_data",
};

// Define all available roles
export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  MANAGER: "manager",
  TAILOR: "tailor",
  EMBROIDERY_MAN: "embroideryMan",
  STONE_MAN: "stoneMan",
  SALESMAN: "salesman",
  USER: "user",
};

// Define role hierarchies and their permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [...Object.values(PERMISSIONS)],

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SYSTEM_HEALTH,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.DELETE_ORDERS,
    PERMISSIONS.ASSIGN_ORDERS,
    PERMISSIONS.TRACK_DELIVERY,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_ANALYTICS,
    PERMISSIONS.MANAGE_MEASUREMENTS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.VIEW_TAILORING_WORK,
    PERMISSIONS.MANAGE_CUTTING,
    PERMISSIONS.MANAGE_EMBROIDERY,
    PERMISSIONS.MANAGE_STONE_WORK,
    PERMISSIONS.MANAGE_SEWING,
    PERMISSIONS.QUALITY_CONTROL,
    PERMISSIONS.VIEW_WORK_LOG,
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_FABRICS,
    PERMISSIONS.MANAGE_FABRIC_SALES,
    PERMISSIONS.MANAGE_RAW_MATERIALS,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_CATALOG,
    PERMISSIONS.PURCHASE_MANAGEMENT,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_SALARIES,
    PERMISSIONS.MANAGE_JOB_PAYMENTS,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_CUSTOM_REPORTS,
    PERMISSIONS.VIEW_PERFORMANCE_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.ASSIGN_ORDERS,
    PERMISSIONS.TRACK_DELIVERY,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_MEASUREMENTS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.VIEW_TAILORING_WORK,
    PERMISSIONS.MANAGE_CUTTING,
    PERMISSIONS.MANAGE_EMBROIDERY,
    PERMISSIONS.MANAGE_STONE_WORK,
    PERMISSIONS.MANAGE_SEWING,
    PERMISSIONS.QUALITY_CONTROL,
    PERMISSIONS.VIEW_WORK_LOG,
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_FABRICS,
    PERMISSIONS.MANAGE_FABRIC_SALES,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_CATALOG,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_JOB_PAYMENTS,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PERFORMANCE_ANALYTICS,
  ],

  [ROLES.TAILOR]: [
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_WORK_LOG,
    PERMISSIONS.VIEW_TAILORING_WORK,
    PERMISSIONS.MANAGE_CUTTING,
    PERMISSIONS.MANAGE_SEWING,
    PERMISSIONS.MANAGE_MEASUREMENTS,
    PERMISSIONS.MANAGE_PERSONAL_ACCOUNTS,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
  ],

  [ROLES.EMBROIDERY_MAN]: [
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_WORK_LOG,
    PERMISSIONS.MANAGE_EMBROIDERY,
    PERMISSIONS.MANAGE_PERSONAL_ACCOUNTS,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
  ],

  [ROLES.STONE_MAN]: [
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_WORK_LOG,
    PERMISSIONS.MANAGE_STONE_WORK,
    PERMISSIONS.MANAGE_PERSONAL_ACCOUNTS,
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
  ],

  [ROLES.SALESMAN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_FABRIC_SALES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.VIEW_CATALOG,
  ],

  [ROLES.USER]: [PERMISSIONS.VIEW_OWN_ORDERS, PERMISSIONS.VIEW_CATALOG],
};

// Helper functions for role management
export const roleHelpers = {
  PERMISSIONS,
  ROLES,
  // Check if a role has a specific permission
  hasPermission: (role, permission) => {
    if (!role || !ROLE_PERMISSIONS[role]) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
  },

  // Check if a role has any of the given permissions
  hasAnyPermission: (role, permissions) => {
    if (!role || !permissions || !Array.isArray(permissions)) return false;
    return permissions.some((permission) =>
      roleHelpers.hasPermission(role, permission)
    );
  },

  // Check if a role has all of the given permissions
  hasAllPermissions: (role, permissions) => {
    if (!role || !permissions || !Array.isArray(permissions)) return false;
    return permissions.every((permission) =>
      roleHelpers.hasPermission(role, permission)
    );
  },

  // Get all permissions for a role
  getRolePermissions: (role) => {
    return ROLE_PERMISSIONS[role] || [];
  },

  // Check if role is admin level (admin or superAdmin)
  isAdmin: (role) => {
    return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  },

  // Check if role is worker level
  isWorker: (role) => {
    return [ROLES.TAILOR, ROLES.EMBROIDERY_MAN, ROLES.STONE_MAN].includes(role);
  },

  // Check if role is management level
  isManagement: (role) => {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role);
  },

  // Get role hierarchy level (higher number = more permissions)
  getRoleLevel: (role) => {
    const levels = {
      [ROLES.USER]: 1,
      [ROLES.SALESMAN]: 2,
      [ROLES.TAILOR]: 3,
      [ROLES.EMBROIDERY_MAN]: 3,
      [ROLES.STONE_MAN]: 3,
      [ROLES.MANAGER]: 4,
      [ROLES.ADMIN]: 5,
      [ROLES.SUPER_ADMIN]: 6,
    };
    return levels[role] || 0;
  },

  // Check if one role can manage another
  canManageRole: (managerRole, targetRole) => {
    return (
      roleHelpers.getRoleLevel(managerRole) >
      roleHelpers.getRoleLevel(targetRole)
    );
  },

  // Get role display name in Bengali
  getRoleDisplayName: (role) => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: "সুপার অ্যাডমিন",
      [ROLES.ADMIN]: "অ্যাডমিন",
      [ROLES.MANAGER]: "ম্যানেজার",
      [ROLES.TAILOR]: "দর্জি",
      [ROLES.EMBROIDERY_MAN]: "এমব্রয়ডারি বিশেষজ্ঞ",
      [ROLES.STONE_MAN]: "স্টোন ওয়ার্ক বিশেষজ্ঞ",
      [ROLES.SALESMAN]: "বিক্রয়কর্তা",
      [ROLES.USER]: "ব্যবহারকারী",
    };
    return roleNames[role] || role;
  },

  // Get all available roles
  getAllRoles: () => {
    return Object.values(ROLES);
  },

  // Get roles that a user can assign (based on their role)
  getAssignableRoles: (userRole) => {
    const userLevel = roleHelpers.getRoleLevel(userRole);
    return roleHelpers.getAllRoles().filter((role) => {
      return roleHelpers.getRoleLevel(role) < userLevel;
    });
  },
};

// Export default object with all utilities
const rolesModule = {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  roleHelpers,
};

export default rolesModule;
