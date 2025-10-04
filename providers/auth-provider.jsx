"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import AuthErrorBoundary from "@/components/auth-error-boundary";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children, initialAuthData }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const {
    user,
    userProfile,
    userShops,
    selectedShopId,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsAuthLoading(true);
        setLoading(true);

        // If we have initial auth data from server-side rendering, use it
        if (initialAuthData?.isAuthenticated && initialAuthData?.user) {
          console.log("🔐 Using server-side auth data");
          setAuth(initialAuthData.user, initialAuthData.userProfile, initialAuthData.userShops);
          setIsInitialized(true);
          setLoading(false);
          setIsAuthLoading(false);

          // Still verify the session is valid on client-side
          setTimeout(async () => {
            try {
              const currentUser = await authService.getCurrentUser();
              if (!currentUser) {
                console.log("🔐 Server-side session invalid, clearing auth");
                clearAuth();
              }
            } catch (error) {
              console.error("Session verification failed:", error);
              clearAuth();
            }
          }, 100);

          return;
        }

        // Otherwise, check if user is already authenticated on client-side
        console.log("🔐 Checking client-side authentication");
        const currentUser = await authService.getCurrentUser();

        if (currentUser && currentUser.$id) {
          try {
            // Get complete user profile
            const completeUser = await authService.getCompleteUserProfile();
            if (completeUser.profile) {
              setAuth(completeUser, completeUser.profile, completeUser.userShops);
            } else {
              setAuth(currentUser, null, []);
            }
          } catch (profileError) {
            console.error("Error getting user profile:", profileError);
            // If profile fails, still set basic auth
            setAuth(currentUser, null, []);
          }
        } else {
          console.log("🔐 No authenticated user found");
          clearAuth();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuth();
      } finally {
        setLoading(false);
        setIsAuthLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [setAuth, clearAuth, setLoading, initialAuthData]);

  // Create the loading component as a variable instead of conditional return
  const loadingComponent = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            অ্যাপ্লিকেশন লোড হচ্ছে...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার অ্যাকাউন্ট যাচাই করা হচ্ছে এবং ড্যাশবোর্ড প্রস্তুত করা হচ্ছে
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper methods as functions to prevent unnecessary re-renders
  const canAccessDashboard = React.useCallback(() => {
    return isAuthenticated && userProfile?.role !== "user";
  }, [isAuthenticated, userProfile?.role]);

  const canSwitchShops = React.useCallback(() => {
    return ["super_admin", "admin"].includes(userProfile?.role);
  }, [userProfile?.role]);

  const canViewAllShops = React.useCallback(() => {
    return userProfile?.role === "super_admin";
  }, [userProfile?.role]);

  const getUserRole = React.useCallback(() => {
    if (selectedShopId && userShops.length > 0) {
      const userShop = userShops.find((us) => {
        const shopId = typeof us.shopId === "string"
          ? us.shopId
          : us.shopId?.$id || (Array.isArray(us.shopId) && us.shopId[0]?.$id);
        return shopId === selectedShopId && us.status === "active";
      });
      if (userShop?.role) {
        return userShop.role;
      }
    }
    return userProfile?.role || "user";
  }, [selectedShopId, userShops, userProfile?.role]);

  const value = React.useMemo(() => ({
    // State
    user,
    userProfile,
    userShops,
    selectedShopId,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    setAuth,
    clearAuth,
    setLoading,
    setError,
    clearError,

    // Helper methods (memoized)
    canAccessDashboard,
    canSwitchShops,
    canViewAllShops,
    getUserRole,
  }), [
    user,
    userProfile,
    userShops,
    selectedShopId,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    clearError,
    canAccessDashboard,
    canSwitchShops,
    canViewAllShops,
    getUserRole,
  ]);

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthErrorBoundary>
  );
}