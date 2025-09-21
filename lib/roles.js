// lib/roles.js - SIMPLIFIED
export const ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin", 
  MANAGER: "manager",
  TAILOR: "tailor",
  SALESMAN: "salesman",
  EMBROIDERY_MAN: "embroideryMan",
  STONE_MAN: "stoneMan",
  USER: "user",
};

export const roleHelpers = {
  // Check if user can access dashboard
  canAccessDashboard: (role) => {
    // Everyone except 'user' role can access dashboard
    return role && role !== ROLES.USER;
  },

  // Check if user can switch between shops
  canSwitchShops: (role) => {
    // Only admin and superAdmin can switch shops
    return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  },

  // Check if user can view all shops data (superAdmin only)
  canViewAllShops: (role) => {
    return role === ROLES.SUPER_ADMIN;
  },

  // Get default redirect path based on role
  getDefaultPath: (role) => {
    // Users go to home page, everyone else to dashboard
    if (role === ROLES.USER || !role) return "/";
    return "/dashboard";
  },

  // Get role display name in Bengali
  getRoleDisplayName: (role) => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: "সুপার অ্যাডমিন",
      [ROLES.ADMIN]: "অ্যাডমিন",
      [ROLES.MANAGER]: "ম্যানেজার",
      [ROLES.TAILOR]: "দর্জি",
      [ROLES.SALESMAN]: "বিক্রয়কর্মী",
      [ROLES.EMBROIDERY_MAN]: "এমব্রয়ডারি কর্মী",
      [ROLES.STONE_MAN]: "পাথর কর্মী",
      [ROLES.USER]: "গ্রাহক",
    };
    return roleNames[role] || role;
  },

  // Check if user is management level
  isManagement: (role) => {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role);
  },

  // Check if user is worker level
  isWorker: (role) => {
    return [ROLES.TAILOR, ROLES.EMBROIDERY_MAN, ROLES.STONE_MAN].includes(role);
  },

  // Check if user can manage other users
  canManageUsers: (role) => {
    return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  },

  // Check if user can view reports
  canViewReports: (role) => {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role);
  },

  // Check if user can manage inventory
  canManageInventory: (role) => {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role);
  },

  // Simple permission check
  hasPermission: (userRole, requiredRoles) => {
    if (!userRole || !requiredRoles) return false;
    if (typeof requiredRoles === 'string') {
      return userRole === requiredRoles;
    }
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    return false;
  }
};