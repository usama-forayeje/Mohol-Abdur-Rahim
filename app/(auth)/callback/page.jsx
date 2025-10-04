// app/callback/page.jsx - SIMPLIFIED
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth-service";
import { roleHelpers } from "@/lib/roles";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CallbackPage() {
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setAuth } = useAuth();
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

        // Handle browser-specific session errors
        let errorMessage = error.message || "Authentication failed";

        if (errorMessage.includes("Firefox_session_blocked")) {
          errorMessage = "Firefox_session_blocked";
        } else if (errorMessage.includes("Safari_session_blocked")) {
          errorMessage = "Safari_session_blocked";
        } else if (errorMessage.includes("Browser_session_blocked")) {
          errorMessage = "Browser_session_blocked";
        }

        setError(errorMessage);
        setStatus("error");

        // Redirect to login on error with specific error
        setTimeout(() => {
          const errorParam = errorMessage.includes("_session_blocked") ? `?error=${encodeURIComponent(errorMessage)}` : "";
          router.replace(`/sign-in${errorParam}`);
        }, 3000);
      }
    };

    handleCallback();
  }, [setAuth, router]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto" />
            <div className="absolute inset-0 w-16 h-16 mx-auto animate-pulse">
              <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              লগইন প্রসেসিং হচ্ছে...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              আপনার অ্যাকাউন্ট যাচাই করা হচ্ছে এবং ড্যাশবোর্ড প্রস্তুত করা হচ্ছে
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
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
    const getErrorMessage = () => {
      if (error.includes("Firefox_session_blocked")) {
        return "Firefox এর সেশন ব্লক হয়ে গেছে। দয়া করে নিচের সলিউশন ট্রাই করুন।";
      } else if (error.includes("Safari_session_blocked")) {
        return "Safari এর সেশন ব্লক হয়ে গেছে। দয়া করে নিচের সলিউশন ট্রাই করুন।";
      } else if (error.includes("Browser_session_blocked")) {
        return "ব্রাউজার সেশন তৈরি হয়নি। দয়া করে নিচের সলিউশন ট্রাই করুন।";
      }
      return error;
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            লগইন ব্যর্থ হয়েছে
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {getErrorMessage()}
          </p>

          {/* Show browser-specific solutions */}
          {error.includes("_session_blocked") && (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4 text-left">
              {error.includes("Firefox") && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-3">🔥 Firefox কমপ্লিট সলিউশন গাইড:</p>
                  <div className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                      <p className="font-bold text-red-800 mb-2">🚨 সমস্যা: Firefox এর Strict Tracking Protection</p>
                      <p className="text-red-700 text-xs">Firefox আপনার লগইন সেশন ব্লক করে দিচ্ছে। নিচের সলিউশনগুলো ট্রাই করুন:</p>
                    </div>

                    <div>
                      <p className="font-bold text-green-800 mb-1">✅ সবচেয়ে সহজ সলিউশন:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li><strong>about:preferences#privacy</strong> এ যান</li>
                        <li>"Enhanced Tracking Protection" কে <strong>"Standard"</strong> এ সেট করুন</li>
                        <li><strong>Firefox রিস্টার্ট</strong> করুন</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-bold text-orange-800 mb-1">⚠️ Advanced সলিউশন:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li><strong>about:config</strong> এ যান</li>
                        <li><strong>network.cookie.cookieBehavior</strong> সার্চ করুন</li>
                        <li>Value <strong>0</strong> এ সেট করুন</li>
                        <li>সব Extensions ডিজেবল করুন</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200">
                      <p className="font-bold text-blue-800 mb-2">💡 সেরা সমাধান:</p>
                      <p className="text-blue-700 text-xs">
                        Firefox এ যদি বারবার সমস্যা হয়, তাহলে{" "}
                        <a
                          href="https://www.google.com/chrome/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-800 underline"
                        >
                          Google Chrome ব্রাউজার
                        </a>{" "}
                        দিয়ে ট্রাই করুন। Chrome এ এই সমস্যা হয় না।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error.includes("Safari") && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-2">🦁 Safari সলিউশন:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Safari → Preferences → Privacy এ যান</li>
                    <li>"Prevent cross-site tracking" ডিজেবল করুন</li>
                    <li>Private browsing mode দিয়ে ট্রাই করুন</li>
                  </ol>
                </div>
              )}

              {!error.includes("Firefox") && !error.includes("Safari") && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-2">💡 সাধারণ সলিউশন:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Incognito/Private mode দিয়ে ট্রাই করুন</li>
                    <li>Third-party cookies এনাবল করুন</li>
                    <li>Chrome ব্রাউজার দিয়ে ট্রাই করুন</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            লগইন পেজে নিয়ে যাওয়া হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return null;
}