"use client";

import { useAuthStore } from "@/store/auth-store";
import { roleHelpers } from "@/lib/roles";

/**
 * ProtectedSection component for role-based content rendering
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Roles that can see this section
 * @param {string} props.requiredPermission - Required permission to access
 * @param {React.ReactNode} props.children - Content to render if access granted
 * @param {React.ReactNode} props.fallback - Content to render if access denied (optional)
 * @param {boolean} props.requireAll - If true, user must have ALL roles (default: false - any role)
 */
export function ProtectedSection({
  allowedRoles,
  requiredPermission,
  children,
  fallback = null,
  requireAll = false
}) {
  const { userProfile, getUserRole, hasPermission } = useAuthStore();
  const currentRole = getUserRole();

  // If no user is logged in, don't render anything
  if (!userProfile || !currentRole) {
    return fallback;
  }

  // Check role-based access
  let hasRoleAccess = false;

  if (allowedRoles) {
    if (Array.isArray(allowedRoles)) {
      if (requireAll) {
        // User must have ALL specified roles
        hasRoleAccess = allowedRoles.every(role => currentRole === role);
      } else {
        // User must have ANY of the specified roles
        hasRoleAccess = allowedRoles.includes(currentRole);
      }
    } else {
      // Single role check
      hasRoleAccess = currentRole === allowedRoles;
    }
  } else {
    // If no roles specified, allow access (permission check will handle it)
    hasRoleAccess = true;
  }

  // Check permission-based access
  let hasPermissionAccess = true;
  if (requiredPermission) {
    hasPermissionAccess = hasPermission(requiredPermission);
  }

  // Grant access if both role and permission checks pass
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback;
}

/**
 * InventorySection component specifically for inventory-related content
 * Only allows admin and superAdmin roles by default
 */
export function InventorySection({ children, fallback = null, ...props }) {
  return (
    <ProtectedSection
      allowedRoles={["superAdmin", "admin"]}
      requiredPermission="MANAGE_FABRICS"
      fallback={fallback}
      {...props}
    >
      {children}
    </ProtectedSection>
  );
}

/**
 * AdminSection component for admin-only content
 * Only allows admin and superAdmin roles
 */
export function AdminSection({ children, fallback = null, ...props }) {
  return (
    <ProtectedSection
      allowedRoles={["superAdmin", "admin"]}
      fallback={fallback}
      {...props}
    >
      {children}
    </ProtectedSection>
  );
}

/**
 * ManagementSection component for management-level content
 * Allows superAdmin, admin, and manager roles
 */
export function ManagementSection({ children, fallback = null, ...props }) {
  return (
    <ProtectedSection
      allowedRoles={["superAdmin", "admin", "manager"]}
      fallback={fallback}
      {...props}
    >
      {children}
    </ProtectedSection>
  );
}