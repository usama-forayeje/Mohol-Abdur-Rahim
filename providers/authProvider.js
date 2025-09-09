"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }) {
  const { initializeAuth, hasInitialized, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasInitialized()) {
      initializeAuth();
    }
  }, []);

  // Show loading only for a short time
  if (!mounted || (!hasInitialized() && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>অ্যাপ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return children;
}
