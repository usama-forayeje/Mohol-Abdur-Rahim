// components/ui/LoadingSpinner.jsx
"use client";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-blue-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    ></div>
  );
}

// components/ui/ErrorMessage.jsx
("use client");

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  title = "একটি সমস্যা হয়েছে",
  variant = "destructive",
  showIcon = true,
  className = "",
}) {
  if (!error) return null;

  const isPermissionError =
    error.includes("permission") || error.includes("unauthorized");

  return (
    <Alert
      className={`${className} ${
        variant === "destructive" ? "border-red-200 bg-red-50" : ""
      }`}
    >
      {showIcon && (
        <AlertTriangle
          className={`h-4 w-4 ${
            variant === "destructive" ? "text-red-600" : "text-yellow-600"
          }`}
        />
      )}
      <AlertDescription
        className={
          variant === "destructive" ? "text-red-800" : "text-yellow-800"
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm mt-1">{error}</p>
          </div>

          {isPermissionError && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">সমাধান:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Appwrite Console এ যান</li>
                <li>Database Collections আপনার Collection</li>
                <li>Settings Permissions</li>
                <li>"users" role এ READ permission দিন</li>
                <li>Save করুন</li>
              </ol>
            </div>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                আবার চেষ্টা করুন
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                বন্ধ করুন
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// components/ui/EmptyState.jsx
("use client");

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon = Package,
  title = "কোন তথ্য নেই",
  description = "এখনো কোন ডেটা যোগ করা হয়নি।",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <Card className={`${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <Icon className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md">{description}</p>

        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// components/ui/LoadingState.jsx
("use client");

import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState({
  message = "লোড হচ্ছে...",
  className = "",
  size = "md",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

// components/PermissionChecker.jsx - Debug component for permissions
("use client");

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appwriteService } from "@/appwrite/appwrite";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export function PermissionChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);

  const checkPermissions = async () => {
    setIsChecking(true);
    try {
      await appwriteService.debugPermissions();
      setResults("Check console for detailed results");
    } catch (error) {
      setResults("Error: " + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Permission Debug Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={checkPermissions} disabled={isChecking}>
            {isChecking ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                চেক করা হচ্ছে...
              </>
            ) : (
              "Permissions চেক করুন"
            )}
          </Button>

          {results && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm">
                {results} <br />
                বিস্তারিত তথ্যের জন্য Browser Console দেখুন (F12)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
