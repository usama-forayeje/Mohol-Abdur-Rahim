"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { appwriteService } from "@/appwrite/appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  User,
  Building2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";

export default function CallbackPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState("শুরু করা হচ্ছে...");
  const [progress, setProgress] = useState(0);

  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const processingRef = useRef(false);

  // Skeleton Component
  const Skeleton = ({ className = "", ...props }) => (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: "shimmer 2s ease-in-out infinite",
      }}
      {...props}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );

  // Progress Animation
  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (processingRef.current) return;

    const steps = [
      { text: "Google OAuth যাচাই করা হচ্ছে...", delay: 1000 },
      { text: "ব্যবহারকারী তথ্য সংগ্রহ করা হচ্ছে...", delay: 1500 },
      { text: "প্রোফাইল ডেটা লোড করা হচ্ছে...", delay: 2000 },
      { text: "অনুমতি যাচাই করা হচ্ছে...", delay: 2500 },
      { text: "সেশন তৈরি করা হচ্ছে...", delay: 3000 },
    ];

    const handleCallback = async () => {
      try {
        processingRef.current = true;
        setStatus("processing");
        setProgress(10);

        // Simulate step progression
        let stepIndex = 0;
        const stepInterval = setInterval(() => {
          if (stepIndex < steps.length) {
            setCurrentStep(steps[stepIndex].text);
            setProgress((prev) => Math.min(prev + 15, 80));
            stepIndex++;
          } else {
            clearInterval(stepInterval);
          }
        }, 800);

        // OAuth callback handle করুন
        const user = await appwriteService.handleOAuthCallback();

        if (!user) {
          throw new Error("লগইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।");
        }

        setCurrentStep("প্রোফাইল সিঙ্ক করা হচ্ছে...");
        setProgress(90);

        // Auth store initialize করুন
        await initializeAuth();

        setCurrentStep("সম্পূর্ণ! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
        setProgress(100);
        setStatus("success");

        // Role অনুযায়ী redirect করুন
        const redirectPath = user.profile?.role === "user" ? "/" : "/dashboard";

        setTimeout(() => {
          router.replace(redirectPath);
        }, 1500);
      } catch (error) {
        console.error("Callback failed:", error);
        setError(error.message);
        setStatus("error");

        // Error এর পর sign-in এ redirect করুন
        setTimeout(() => {
          router.replace("/sign-in?error=" + encodeURIComponent(error.message));
        }, 4000);
      }
    };

    // ১ সেকেন্ড পর processing শুরু করুন
    const timeout = setTimeout(handleCallback, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Loading State with Premium Skeleton
  if (status === "loading" || status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    অগ্রগতি
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Current Step */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-blue-900 dark:text-blue-300 font-medium">
                    {currentStep}
                  </span>
                </div>
              </div>

              {/* Skeleton Cards */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading Animation */}
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1s",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto text-center">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="mx-auto mb-4 relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center animate-ping">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent mb-3">
                সফলভাবে সাইন ইন হয়েছে!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {currentStep}
              </p>

              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
                  </span>
                </div>
              </div>

              {/* Success Animation */}
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-slate-900 dark:via-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto text-center">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="mx-auto mb-4 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent mb-3">
              সাইন ইন ব্যর্থ হয়েছে
            </h2>

            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-800 mb-6">
              <p className="text-red-800 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.replace("/sign-in")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                আবার চেষ্টা করুন
              </Button>

              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>৩ সেকেন্ডে স্বয়ংক্রিয় রিডাইরেক্ট...</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
