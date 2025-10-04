"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function DashboardAuthGuard({ children }) {
  const { isAuthenticated, isLoading, canAccessDashboard } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If still loading, don't do anything yet
    if (isLoading) return;

    // If not authenticated or can't access dashboard, redirect to sign-in
    if (!isAuthenticated || !canAccessDashboard()) {
      router.replace("/sign-in");
      return;
    }
  }, [isAuthenticated, isLoading, canAccessDashboard, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              অ্যাক্সেস যাচাই হচ্ছে...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              আপনার অনুমতি যাচাই করা হচ্ছে
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or can't access dashboard, don't render children
  if (!isAuthenticated || !canAccessDashboard()) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}