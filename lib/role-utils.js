// utils/auth-utils.js - Authentication Helper Functions
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin', 
  MANAGER: 'manager',
  TAILOR: 'tailor',
  USER: 'user',
  SALESMAN: 'salesman',
  EMBROIDERY_MAN: 'embroideryMan',
  STONE_MAN: 'stoneMan'
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'সুপার অ্যাডমিন',
  [ROLES.ADMIN]: 'অ্যাডমিন',
  [ROLES.MANAGER]: 'ম্যানেজার', 
  [ROLES.TAILOR]: 'দর্জি',
  [ROLES.USER]: 'ব্যবহারকারী',
  [ROLES.SALESMAN]: 'বিক্রয়কারী',
  [ROLES.EMBROIDERY_MAN]: 'এমব্রয়ডারি কারিগর',
  [ROLES.STONE_MAN]: 'স্টোন কারিগর'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['all'],
  [ROLES.ADMIN]: [
    'manage_shops', 'manage_users', 'manage_orders', 'manage_customers',
    'manage_inventory', 'view_reports', 'manage_finances'
  ],
  [ROLES.MANAGER]: [
    'manage_orders', 'manage_customers', 'manage_inventory', 
    'view_reports', 'manage_staff_schedules'
  ],
  [ROLES.TAILOR]: [
    'view_orders', 'update_order_status', 'view_measurements'
  ],
  [ROLES.SALESMAN]: [
    'create_orders', 'manage_customers', 'view_inventory'
  ],
  [ROLES.EMBROIDERY_MAN]: [
    'view_orders', 'update_task_status'
  ],
  [ROLES.STONE_MAN]: [
    'view_orders', 'update_task_status'
  ],
  [ROLES.USER]: [
    'view_own_orders', 'view_own_profile'
  ]
};

export function hasPermission(userRole, permission) {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('all') || permissions.includes(permission);
}

export function canAccessDashboard(userRole) {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
}

export function canAccessShop(userRole, userShopId, targetShopId) {
  // Super admin and admin can access all shops
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole)) {
    return true;
  }
  
  // Other roles can only access their assigned shop
  return userShopId === targetShopId;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function getDashboardPath(userRole) {
  switch (userRole) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return "/dashboard";
    case ROLES.MANAGER:
      return "/manager-dashboard";
    case ROLES.TAILOR:
      return "/tailor-dashboard";
    case ROLES.USER:
    default:
      return "/";
  }
}

// Validate user session and return appropriate actions
export function validateUserSession(user, userProfile) {
  if (!user) {
    return {
      isValid: false,
      action: 'REDIRECT_LOGIN',
      path: '/sign-in'
    };
  }

  if (!userProfile || !userProfile.role) {
    return {
      isValid: false,
      action: 'REFRESH_PROFILE',
      path: null
    };
  }

  return {
    isValid: true,
    action: 'CONTINUE',
    path: null
  };
}

// Check if route is accessible for user role
export function isRouteAccessible(route, userRole) {
  const publicRoutes = ['/'];
  const authRoutes = ['/sign-in', '/callback'];
  const adminRoutes = ['/dashboard'];
  const managerRoutes = ['/manager-dashboard'];
  const tailorRoutes = ['/tailor-dashboard'];

  // Public routes - accessible to all
  if (publicRoutes.includes(route)) {
    return true;
  }

  // Auth routes - only for unauthenticated users
  if (authRoutes.includes(route)) {
    return !userRole; // Only if no role (not authenticated)
  }

  // Protected routes
  if (adminRoutes.some(r => route.startsWith(r))) {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
  }

  if (managerRoutes.some(r => route.startsWith(r))) {
    return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
  }

  if (tailorRoutes.some(r => route.startsWith(r))) {
    return [ROLES.TAILOR].includes(userRole);
  }

  return true; // Default allow
}