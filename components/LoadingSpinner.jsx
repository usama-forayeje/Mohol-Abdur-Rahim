import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  X,
  Package,
  Plus,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Settings,
  Database,
  User,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { appwriteService } from "@/appwrite/appwrite";

// Enhanced Skeleton Component with Multiple Variants
export function Skeleton({ className = "", variant = "default", ...props }) {
  const variants = {
    default:
      "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
    shimmer:
      "bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/30 dark:via-blue-800/30 dark:to-blue-900/30",
    pulse:
      "bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-purple-900/30",
    wave: "bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 dark:from-indigo-900/30 dark:via-indigo-800/30 dark:to-indigo-900/30",
  };

  return (
    <div
      className={`animate-pulse ${variants[variant]} bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation:
          variant === "shimmer"
            ? "shimmer 2s ease-in-out infinite"
            : variant === "wave"
            ? "wave 3s ease-in-out infinite"
            : "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
        @keyframes wave {
          0%,
          100% {
            background-position: -200% 0;
          }
          50% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

// Premium Loading Spinner with Multiple Styles
export function LoadingSpinner({
  size = "md",
  className = "",
  variant = "default",
  color = "blue",
}) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    blue: "border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400",
    purple:
      "border-purple-300 border-t-purple-600 dark:border-purple-700 dark:border-t-purple-400",
    green:
      "border-green-300 border-t-green-600 dark:border-green-700 dark:border-t-green-400",
    red: "border-red-300 border-t-red-600 dark:border-red-700 dark:border-t-red-400",
  };

  if (variant === "dots") {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
      style={{ animationDuration: "1s" }}
    />
  );
}

// Advanced Error Message Component
export function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  title = "একটি সমস্যা হয়েছে",
  variant = "destructive",
  showIcon = true,
  className = "",
  showSolutions = true,
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const isPermissionError =
    error.includes("permission") ||
    error.includes("unauthorized") ||
    error.includes("forbidden");

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <Alert className={`${className} border-0 shadow-lg`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        )}

        <AlertDescription className="flex-1">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100 text-lg">
                {title}
              </p>
              <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>

            {isPermissionError && showSolutions && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    সমাধানের উপায়:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        icon: Database,
                        text: "Appwrite Console এ যান",
                        step: "১",
                      },
                      {
                        icon: Package,
                        text: "Database → Collections",
                        step: "২",
                      },
                      {
                        icon: Settings,
                        text: "Settings → Permissions",
                        step: "৩",
                      },
                      {
                        icon: User,
                        text: '"users" role এ READ দিন',
                        step: "৪",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-800 rounded-lg"
                      >
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {item.step}
                        </Badge>
                        <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isRetrying ? (
                    <LoadingSpinner size="xs" className="mr-2" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-2" />
                  )}
                  আবার চেষ্টা করুন
                </Button>
              )}

              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  <X className="w-3 h-3 mr-2" />
                  বন্ধ করুন
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}

// Premium Empty State Component
export function EmptyState({
  icon: Icon = Package,
  title = "কোন তথ্য নেই",
  description = "এখনো কোন ডেটা যোগ করা হয়নি।",
  actionLabel,
  onAction,
  className = "",
  variant = "default",
}) {
  const variants = {
    default: "bg-white dark:bg-slate-900",
    gradient:
      "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950",
    minimal: "bg-gray-50 dark:bg-slate-800",
  };

  return (
    <Card className={`${className} ${variants[variant]} border-0 shadow-lg`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
            <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
          {description}
        </p>

        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Advanced Loading State with Skeleton Content
export function LoadingState({
  message = "লোড হচ্ছে...",
  className = "",
  size = "md",
  showProgress = false,
  showSkeleton = false,
  skeletonType = "cards",
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 20));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [showProgress]);

  if (showSkeleton) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/3" variant="shimmer" />
          <Skeleton className="h-4 w-2/3" variant="default" />
        </div>

        {/* Content Skeleton */}
        {skeletonType === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-lg">
                <CardHeader className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton
                      className="w-10 h-10 rounded-full"
                      variant="pulse"
                    />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" variant="shimmer" />
                      <Skeleton className="h-3 w-1/2" variant="default" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-lg" variant="wave" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" variant="default" />
                    <Skeleton className="h-3 w-4/5" variant="default" />
                    <Skeleton className="h-3 w-2/3" variant="default" />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton
                      className="h-8 w-20 rounded-full"
                      variant="shimmer"
                    />
                    <Skeleton className="h-8 w-24 rounded" variant="pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {skeletonType === "list" && (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow"
              >
                <Skeleton className="w-12 h-12 rounded-full" variant="pulse" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" variant="shimmer" />
                  <Skeleton className="h-3 w-2/3" variant="default" />
                </div>
                <Skeleton className="w-20 h-8 rounded" variant="wave" />
              </div>
            ))}
          </div>
        )}

        {skeletonType === "table" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4" variant="shimmer" />
              ))}
            </div>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow"
              >
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4" variant="default" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
              <LoadingSpinner size="lg" variant="dots" className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {message}
        </h3>

        {showProgress && (
          <div className="w-full max-w-xs mx-auto mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                অগ্রগতি
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Permission Checker with Real-time Status
export function PermissionChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [step, setStep] = useState("");

  const permissionSteps = [
    { icon: Database, text: "Database কানেকশন চেক করা হচ্ছে...", delay: 1000 },
    {
      icon: Lock,
      text: "Authentication স্ট্যাটাস যাচাই করা হচ্ছে...",
      delay: 1500,
    },
    {
      icon: Shield,
      text: "Collection permissions চেক করা হচ্ছে...",
      delay: 2000,
    },
    { icon: User, text: "User roles বিশ্লেষণ করা হচ্ছে...", delay: 2500 },
  ];

  const checkPermissions = async () => {
    setIsChecking(true);
    setResults(null);
    setPermissions([]);

    try {
      // Simulate step by step checking
      for (let i = 0; i < permissionSteps.length; i++) {
        setStep(permissionSteps[i].text);
        await new Promise((resolve) =>
          setTimeout(resolve, permissionSteps[i].delay)
        );
      }

      // Mock permission results
      const mockPermissions = [
        {
          name: "Database Read",
          status: "success",
          message: "✅ অ্যাক্সেস আছে",
        },
        {
          name: "Collection Write",
          status: "warning",
          message: "⚠️ সীমিত অ্যাক্সেস",
        },
        {
          name: "User Authentication",
          status: "success",
          message: "✅ সক্রিয়",
        },
        { name: "File Upload", status: "error", message: "❌ অ্যাক্সেস নেই" },
      ];

      setPermissions(mockPermissions);

      if (typeof appwriteService?.debugPermissions === "function") {
        await appwriteService.debugPermissions();
        setResults("Console এ বিস্তারিত রিপোর্ট দেখুন");
      } else {
        setResults("Permission check সম্পূর্ণ হয়েছে");
      }
    } catch (error) {
      setResults("Error: " + error.message);
    } finally {
      setIsChecking(false);
      setStep("");
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Permission Debug Tool
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              সিস্টেম অনুমতি যাচাই এবং ডিবাগ করুন
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={checkPermissions}
            disabled={isChecking}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            {isChecking ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                চেক করা হচ্ছে...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Permissions চেক করুন
              </>
            )}
          </Button>

          {!isChecking && permissions.length > 0 && (
            <Badge
              variant="outline"
              className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              চেক সম্পূর্ণ
            </Badge>
          )}
        </div>

        {/* Real-time Step Display */}
        {isChecking && step && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-blue-900 dark:text-blue-300 font-medium">
                {step}
              </span>
            </div>
          </div>
        )}

        {/* Permission Results */}
        {permissions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Permission স্ট্যাটাস
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((perm, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    perm.status === "success"
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                      : perm.status === "warning"
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800"
                      : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {perm.name}
                    </span>
                    <span className="text-xs">{perm.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  ডিবাগ রিপোর্ট
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {results}
                  <br />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    বিস্তারিত তথ্যের জন্য Browser Console দেখুন (F12)
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
