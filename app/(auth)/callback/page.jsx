// app/callback/page.jsx - SIMPLIFIED
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { roleHelpers } from "@/lib/roles";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CallbackPage() {
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const handleCallback = async () => {
      try {
        console.log("Starting OAuth callback...");
        
        // Step 1: Handle OAuth callback
        const user = await authService.handleOAuthCallback();
        if (!user) {
          throw new Error("Authentication failed");
        }

        // Step 2: Get complete user profile
        const completeUser = await authService.getCompleteUserProfile();
        if (!completeUser.profile) {
          throw new Error("Failed to create user profile");
        }

        console.log("User profile:", completeUser.profile);
        console.log("User shops:", completeUser.userShops);

        // Step 3: Set auth state
        setAuth(completeUser, completeUser.profile, completeUser.userShops);

        // Step 4: Determine redirect based on role
        const userRole = completeUser.userShops[0]?.role || completeUser.profile?.role || 'user';
        const redirectPath = roleHelpers.getDefaultPath(userRole);
        
        console.log(`User role: ${userRole}, redirecting to: ${redirectPath}`);
        
        setStatus("success");
        
        // Redirect after short delay
        setTimeout(() => {
          router.replace(redirectPath);
        }, 1500);

      } catch (error) {
        console.error("Callback error:", error);
        setError(error.message || "Authentication failed");
        setStatus("error");
        
        // Redirect to login on error
        setTimeout(() => {
          router.replace("/sign-in");
        }, 3000);
      }
    };

    handleCallback();
  }, [setAuth, router]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            লগইন প্রসেসিং...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার একাউন্ট সেটআপ করা হচ্ছে
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            সফলভাবে লগইন হয়েছে!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            লগইন ব্যর্থ হয়েছে
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            লগইন পেজে নিয়ে যাওয়া হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return null;
}