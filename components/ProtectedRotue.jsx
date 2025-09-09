"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  allowUnauthenticatedAccess = false,
}) {
  const { isAuthenticated, userProfile, isLoading, hasInitialized } =
    useAuthStore();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasInitialized() || isLoading) return;

    const userRole = userProfile?.role;
    let shouldRedirect = false;
    let redirectPath = "/sign-in";

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      if (!allowUnauthenticatedAccess) {
        shouldRedirect = true;
        redirectPath = "/sign-in";
      }
    }
    // Check role requirement
    else if (isAuthenticated && requiredRoles.length > 0) {
      if (!userRole || !requiredRoles.includes(userRole)) {
        shouldRedirect = true;
        redirectPath = getDashboardPathForRole(userRole);
      }
    }
    // Prevent authenticated users from accessing auth pages
    else if (
      isAuthenticated &&
      !requireAuth &&
      typeof window !== "undefined" &&
      window.location.pathname.includes("sign-in")
    ) {
      shouldRedirect = true;
      redirectPath = getDashboardPathForRole(userRole);
    }

    if (shouldRedirect && !hasCheckedAccess) {
      router.replace(redirectPath);
      setHasCheckedAccess(true);
      return;
    }

    setHasCheckedAccess(true);
  }, [
    hasInitialized,
    isLoading,
    isAuthenticated,
    userProfile?.role,
    requireAuth,
    requiredRoles,
    allowUnauthenticatedAccess,
    hasCheckedAccess,
    router,
  ]);

  const getDashboardPathForRole = (userRole) => {
    switch (userRole) {
      case "admin":
      case "superAdmin":
      case "manager":
        return "/dashboard";
      case "user":
      default:
        return "/";
    }
  };

  // Show loading while checking
  if (!hasInitialized() || isLoading || !hasCheckedAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Don't render if checks failed
  if (requireAuth && !isAuthenticated && !allowUnauthenticatedAccess) {
    return null;
  }

  if (
    isAuthenticated &&
    requiredRoles.length > 0 &&
    !requiredRoles.includes(userProfile?.role)
  ) {
    return null;
  }

  return children;
}
