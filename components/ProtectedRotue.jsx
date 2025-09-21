"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AlertTriangle } from "lucide-react";

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = null,
  fallbackPath = "/sign-in"
}) {
  const {
    isAuthenticated,
    userProfile,
    isLoading,
    canAccessDashboard,
    getUserRole
  } = useAuthStore();

  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      console.log('🔐 ProtectedRoute: Auth still loading...');
      return;
    }

    console.log('🔐 ProtectedRoute: Checking access...', {
      requireAuth,
      isAuthenticated,
      userRole: userProfile?.role,
      requiredRoles
    });

    // Check authentication first
    if (requireAuth && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to sign-in');
      router.replace(fallbackPath);
      return;
    }

    // If authenticated, check role-based access
    if (isAuthenticated && requireAuth) {
      const currentPath = window.location.pathname;
      const userRole = getUserRole();

      // Block 'user' role from dashboard
      if (currentPath.includes("dashboard") && userRole === 'user') {
        console.log('❌ User role cannot access dashboard');
        router.replace("/");
        return;
      }

      // Check if user can access dashboard at all
      if (currentPath.includes("dashboard") && !canAccessDashboard()) {
        console.log('❌ User cannot access dashboard');
        router.replace("/");
        return;
      }

      // Check specific role requirements
      if (requiredRoles && Array.isArray(requiredRoles)) {
        if (!requiredRoles.includes(userRole)) {
          console.log('❌ User role not in required roles:', { userRole, requiredRoles });
          router.replace("/dashboard"); // Redirect to main dashboard instead of sign-in
          return;
        }
      }
    }

    console.log('✅ Access granted');
    setHasChecked(true);
  }, [isLoading, isAuthenticated, userProfile, requireAuth, requiredRoles, router, canAccessDashboard, getUserRole, fallbackPath]);

  // Loading state
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Block unauthorized access
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return children;
}

// Dashboard specific wrapper
export function DashboardAccess({ children }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={["superAdmin", "admin", "manager", "tailor", "salesman", "embroideryMan", "stoneMan"]}
    >
      {children}
    </ProtectedRoute>
  );
}

// Admin specific wrapper
export function AdminAccess({ children }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={["superAdmin", "admin"]}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
}

// SuperAdmin specific wrapper
export function SuperAdminAccess({ children }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={["superAdmin"]}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
}